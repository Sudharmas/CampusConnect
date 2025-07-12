'use server';
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface CollegeData {
    name: string;
    emailDomain: string;
}

/**
 * Adds or updates a college in the 'all-colleges' subcollection.
 * This subcollection lives under a single document: /colleges/college-data.
 * @param collegeId The unique ID for the college (e.g., 'SAMPLE01').
 * @param collegeData The data for the college.
 */
export async function addCollege(collegeId: string, collegeData: CollegeData): Promise<void> {
    if (!collegeId || !collegeData.name || !collegeData.emailDomain) {
        throw new Error("College ID, name, and email domain are required.");
    }

    try {
        // Define the path to the subcollection
        const collegeDocRef = doc(db, 'colleges', 'college-data', 'all-colleges', collegeId);

        // Set the college document in the subcollection
        await setDoc(collegeDocRef, {
            ...collegeData,
            collegeID: collegeId, // Storing the ID within the document is good practice
            updatedAt: serverTimestamp(),
        });

        console.log(`College '${collegeId}' successfully added/updated.`);

    } catch (error) {
        console.error("Error adding college: ", error);
        throw new Error("Failed to add college to the database.");
    }
}
