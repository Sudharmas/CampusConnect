import { db } from "@/lib/firebase";
import { collection, doc, getDocs, serverTimestamp, setDoc, query, where, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

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
  emailOptionalVerified?: boolean;
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
    USN,
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
        updatedAt: serverTimestamp(),
    });
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
