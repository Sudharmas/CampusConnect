import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface College {
    id: string;
    name: string;
    emailDomain: string;
}

const parentDocRef = doc(db, 'colleges', 'college-data');

export async function getCollegeById(collegeId: string): Promise<College | null> {
    if (!collegeId) return null;
    
    // The path is now /colleges/college-data/collegedetails/<collegeId>
    const collegeDocRef = doc(parentDocRef, 'collegedetails', collegeId);
    const collegeDoc = await getDoc(collegeDocRef);

    if (collegeDoc.exists()) {
        const data = collegeDoc.data();
        return {
            id: collegeDoc.id,
            name: data.name,
            emailDomain: data.emailDomain
        } as College;
    } else {
        return null;
    }
}
