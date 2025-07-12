'use server';
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface CollegeData {
    name: string;
    emailDomain: string;
}

/**
 * Adds or updates a college in the top-level 'collegedetails' collection.
 * The path is now /collegedetails/{collegeId}.
 * @param collegeId The unique ID for the college (e.g., '4SN').
 * @param collegeData The data for the college.
 */
export async function addCollege(collegeId: string, collegeData: CollegeData): Promise<void> {
    if (!collegeId || !collegeData.name || !collegeData.emailDomain) {
        throw new Error("College ID, name, and email domain are required.");
    }
     if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(collegeData.emailDomain)) {
        throw new Error("Invalid email domain format.");
    }

    try {
        // The new, simplified path to the college document.
        const collegeDocRef = doc(db, 'collegedetails', collegeId.toUpperCase());

        await setDoc(collegeDocRef, {
            ...collegeData,
            id: collegeId.toUpperCase(), 
            updatedAt: serverTimestamp(),
        }, { merge: true });

    } catch (error) {
        console.error("Error adding college: ", error);
        if (error instanceof Error) {
            throw new Error(`Failed to add college to the database: ${error.message}`);
        }
        throw new Error("An unknown error occurred while adding the college.");
    }
}
