'use server';
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface CollegeData {
    name: string;
    emailDomain: string;
}

/**
 * Adds or updates a college in the 'collegedetails' subcollection.
 * This subcollection lives under the document: /colleges/college-data.
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
        const parentDocRef = doc(db, 'colleges', 'college-data');
        const collegeDocRef = doc(parentDocRef, 'collegedetails', collegeId);

        // Ensure the parent document exists. This is often necessary due to security rules.
        const parentDocSnap = await getDoc(parentDocRef);
        if (!parentDocSnap.exists()) {
            // We can set it with some metadata, or leave it empty.
            await setDoc(parentDocRef, { createdAt: serverTimestamp() });
        }

        await setDoc(collegeDocRef, {
            ...collegeData,
            collegeID: collegeId.toUpperCase(), 
            updatedAt: serverTimestamp(),
        }, { merge: true });

    } catch (error) {
        console.error("Error adding college: ", error);
        // The original error might have more details. Let's re-throw it for better debugging.
        if (error instanceof Error) {
            throw new Error(`Failed to add college to the database: ${error.message}`);
        }
        throw new Error("An unknown error occurred while adding the college.");
    }
}
