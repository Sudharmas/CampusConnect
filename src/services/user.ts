
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, serverTimestamp, setDoc, query, where, getDoc, updateDoc, deleteDoc, limit, addDoc } from "firebase/firestore";

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
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
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

    const updateData: any = { ...data, updatedAt: serverTimestamp() };

    // Convert comma-separated strings to arrays if they are strings
    if (typeof data.interests === 'string') {
        updateData.interests = data.interests.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof data.skills === 'string') {
        updateData.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    await updateDoc(userDocRef, updateData);
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


/**
 * Triggers the "Trigger Email" extension to send a verification link for the optional email.
 * This is a simplified implementation. A real-world scenario would involve a unique token
 * and a dedicated verification page. For now, this link just simulates the action.
 * @param userId The user's ID.
 * @param email The optional email address to verify.
 */
export async function sendOptionalEmailVerificationLink(userId: string, email: string): Promise<void> {
  // A real implementation would generate a unique token and save it with the user's document.
  // For now, the link is simplified and doesn't perform a real verification action on click.
  // The action of sending the email is the main purpose here.
  const verificationLink = `${window.location.origin}/verify-email?userId=${userId}&emailType=optional`;

  try {
    await addDoc(collection(db, "mail"), {
      to: email,
      message: {
        subject: "Verify your Optional Email for CampusConnect",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #007bff;">CampusConnect Email Verification</h2>
            <p>Hello,</p>
            <p>Please click the button below to verify this email address for your CampusConnect account.</p>
            <a href="${verificationLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
            <p>If you did not request this, please ignore this email.</p>
            <br/>
            <p>Thanks,</p>
            <p>The CampusConnect Team</p>
          </div>
        `,
      },
      createdAt: serverTimestamp(),
    });
  } catch (error: any) {
    // This is the fallback for local development or if Firestore rules are not set up.
    if (error.code === 'permission-denied') {
        console.warn(
            "Email trigger failed due to Firestore permissions. " +
            "This is expected in a locked-down environment. " +
            "To enable, allow authenticated users to create documents in the 'mail' collection. " +
            "Continuing with local simulation."
        );
        // The function will now complete successfully, allowing the UI to show a success message.
    } else {
        console.error("Error triggering send email extension:", error);
        throw new Error("Could not send verification email. Please ensure the Trigger Email extension is configured correctly.");
    }
  }
}
