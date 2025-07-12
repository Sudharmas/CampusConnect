import { db } from "@/lib/firebase";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

// Corresponds to the `users` collection schema
export interface User {
  id: string;
  role: "user" | "admin";
  firstName: string;
  lastName: string;
  USN: string;
  collegeName: string;
  collegeID: string;
  emailPrimary: string;
  emailPrimaryVerified: boolean;
  emailOptional: string;
  emailOptionalVerified: boolean;

  branch: string;
  interests: string[];
  skills: string[];
  bio: string;
  profilePhotoURL: string;
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


// This is a simplified representation of a user profile for the AI
interface UserProfile {
    userId: string;
    name: string;
    interests: string[];
    skills: string[];
    bio: string;
}

export async function getAllUsersAsProfileString(): Promise<string> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            userId: doc.id,
            name: `${data.firstName} ${data.lastName}`,
            interests: data.interests || [],
            skills: data.skills || [], // Assuming skills are stored similarly to interests
            bio: data.bio || '',
        }
    });

    // Convert the list of user profiles to a single string for the AI prompt
    return userList.map(user => 
        `User ID: ${user.userId}\nName: ${user.name}\nInterests: ${user.interests.join(', ')}\nSkills: ${user.skills.join(', ')}\nBio: ${user.bio}`
    ).join('\n\n---\n\n');
}
