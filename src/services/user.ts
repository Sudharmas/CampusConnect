
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, serverTimestamp, setDoc, query, where, getDoc, updateDoc, deleteDoc, limit } from "firebase/firestore";

// User data is now stored in a top-level 'users' collection.
export interface User {
  id: string;
  role: "user" | "admin";
  firstName: string;
  lastName?: string;
  USN: string;
  collegeName: string;
  collegeID: string;
  emailPrimary: string;
  emailPrimaryVerified: boolean;
  emailOptional?: string;
  emailOptionalVerified: boolean; // Changed to non-optional
  branch: string;
  interests?: string[];
  skills?: string[];
  bio?: string;
  profilePhotoURL?: string;
  createdAt: any; // serverTimestamp() is not a Date object
  updatedAt: any; // serverTimestamp() is not a Date object
}

interface CreateUserParams {
  id: string;
  role: "user" | "admin";
  firstName: string;
  lastName?: string;
  USN: string;
  collegeName: string;
  collegeID: string;
  emailPrimary: string;
  branch: string;
}

export async function createUser({
  id,
  role,
  firstName,
  lastName,
  USN,
  collegeName,
  collegeID,
  emailPrimary,
  branch,
}: CreateUserParams): Promise<void> {
  // Path is now simply /users/{id}
  const userDocRef = doc(db, "users", id);

  await setDoc(userDocRef, {
    id,
    role,
    firstName,
    lastName: lastName || "",
    USN: USN.toUpperCase(),
    collegeName,
    collegeID,
    emailPrimary,
    emailPrimaryVerified: false,
    emailOptional: "",
    emailOptionalVerified: false,
    branch,
    interests: [],
    skills: [],
    bio: "",
    profilePhotoURL: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserById(userId: string): Promise<User | null> {
    if (!userId) return null;

    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return userDoc.data() as User;
    } else {
        return null;
    }
}

export async function getUserByUsn(usn: string): Promise<User | null> {
    if (!usn) return null;
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where("USN", "==", usn.toUpperCase()), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
    }
    return null;
}

export async function checkIfUserExists(email: string, usn: string): Promise<{ emailExists: boolean; usnExists: boolean }> {
  const usersCollectionRef = collection(db, 'users');

  const emailQuery = query(usersCollectionRef, where("emailPrimary", "==", email), limit(1));
  const usnQuery = query(usersCollectionRef, where("USN", "==", usn.toUpperCase()), limit(1));
  
  const [emailSnapshot, usnSnapshot] = await Promise.all([
    getDocs(emailQuery),
    getDocs(usnQuery),
  ]);

  return {
    emailExists: !emailSnapshot.empty,
    usnExists: !usnSnapshot.empty,
  };
}


export type UserUpdatePayload = Partial<Pick<User, 'firstName' | 'lastName' | 'bio' | 'interests' | 'skills' | 'profilePhotoURL'>>;

export async function updateUser(userId: string, data: UserUpdatePayload): Promise<void> {
    if (!userId) {
        throw new Error("User ID is required to update a profile.");
    }
    const userDocRef = doc(db, "users", userId);

    await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function updateUserOptionalEmail(userId: string, email: string): Promise<void> {
    if (!userId) {
        throw new Error("User ID is required to update the email.");
    }
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
        emailOptional: email,
        emailOptionalVerified: false, // Reset verification status on change
        updatedAt: serverTimestamp(),
    });
}

export async function verifyUserEmail(userId: string, emailType: 'primary' | 'optional'): Promise<void> {
    if (!userId) {
        throw new Error("User ID is required.");
    }
    const userDocRef = doc(db, "users", userId);
    const fieldToUpdate = emailType === 'primary' ? 'emailPrimaryVerified' : 'emailOptionalVerified';
    
    await updateDoc(userDocRef, {
        [fieldToUpdate]: true,
        updatedAt: serverTimestamp(),
    });
}

// This function updates our DB when Firebase Auth confirms verification
export async function markEmailAsVerified(userId: string): Promise<User | null> {
    if (!userId) return null;
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if(userDoc.exists() && !userDoc.data().emailPrimaryVerified) {
        await updateDoc(userDocRef, {
            emailPrimaryVerified: true,
            updatedAt: serverTimestamp()
        });
        const updatedDoc = await getDoc(userDocRef);
        return updatedDoc.data() as User;
    }
    return userDoc.exists() ? userDoc.data() as User : null;
}


export async function deleteUserAccount(userId: string): Promise<void> {
    if (!userId) {
        throw new Error("User ID is required to delete the account.");
    }
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
}


// This is a simplified representation of a user profile for the AI
interface UserProfile {
    userId: string;
    name: string;
    interests: string[];
    skills: string[];
    bio: string;
}

export async function getAllUsersAsProfileString(): Promise<string> {
    // Query the top-level 'users' collection
    const usersCollectionRef = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollectionRef);
    
    const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            userId: doc.id,
            name: `${data.firstName} ${data.lastName}`,
            interests: data.interests || [],
            skills: data.skills || [],
            bio: data.bio || '',
        }
    });

    // Convert the list of user profiles to a single string for the AI prompt
    return userList.map(user => 
        `User ID: ${user.userId}\nName: ${user.name}\nInterests: ${user.interests.join(', ')}\nSkills: ${user.skills.join(', ')}\nBio: ${user.bio}`
    ).join('\n\n---\n\n');
}

/**
 * Adds a connection for a user.
 * Stores connections in a subcollection: /users/{userId}/connections/{connectedUserId}
 * @param userId The ID of the user initiating the connection.
 * @param connectedUserId The ID of the user to connect with.
 */
export async function addConnection(userId: string, connectedUserId: string): Promise<void> {
    if (!userId || !connectedUserId) {
        throw new Error("Both user IDs are required to create a connection.");
    }
    if (userId === connectedUserId) {
        throw new Error("Cannot connect with yourself.");
    }
    const connectionDocRef = doc(db, "users", userId, "connections", connectedUserId);
    await setDoc(connectionDocRef, {
        connectedAt: serverTimestamp(),
    });
}

/**
 * Retrieves all connections for a given user.
 * @param userId The ID of the user whose connections to fetch.
 * @returns A promise that resolves to an array of connected user IDs.
 */
export async function getConnections(userId: string): Promise<string[]> {
    if (!userId) {
        return [];
    }
    const connectionsCollectionRef = collection(db, "users", userId, "connections");
    const snapshot = await getDocs(connectionsCollectionRef);
    return snapshot.docs.map(doc => doc.id);
}

    
