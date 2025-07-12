import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface College {
    id: string;
    name: string;
    emailDomain: string;
}

export async function getCollegeById(collegeId: string): Promise<College | null> {
    if (!collegeId) return null;
    
    const collegeDocRef = doc(db, 'colleges', collegeId);
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
