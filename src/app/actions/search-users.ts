
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import type { User } from '@/services/user';

export interface SearchedUser {
  id: string;
  firstName: string;
  lastName?: string;
  profilePhotoURL?: string;
  skills?: string[];
  interests?: string[];
}

/**
 * Searches for users based on a query string.
 * The query is matched against first name, last name, skills, and interests.
 * @param searchQuery The string to search for.
 * @returns A promise that resolves to an array of matching users.
 */
export async function searchUsers(searchQuery: string): Promise<SearchedUser[]> {
  const usersCollection = collection(db, 'users');
  const q = searchQuery.toLowerCase();

  // This is a basic implementation. For production apps, a dedicated search
  // service like Algolia or Elasticsearch is recommended for better performance.
  const firstNameQuery = query(usersCollection, where('firstName', '>=', q), where('firstName', '<=', q + '\uf8ff'));
  const lastNameQuery = query(usersCollection, where('lastName', '>=', q), where('lastName', '<=', q + '\uf8ff'));
  const skillsQuery = query(usersCollection, where('skills', 'array-contains', q));
  const interestsQuery = query(usersCollection, where('interests', 'array-contains', q));

  try {
    const [firstNameSnapshot, lastNameSnapshot, skillsSnapshot, interestsSnapshot] = await Promise.all([
      getDocs(firstNameQuery),
      getDocs(lastNameQuery),
      getDocs(skillsQuery),
      getDocs(interestsQuery),
    ]);
    
    const usersMap = new Map<string, SearchedUser>();

    const processSnapshot = (snapshot: any) => {
        snapshot.forEach((doc: any) => {
            if (!usersMap.has(doc.id)) {
                const data = doc.data() as User;
                usersMap.set(doc.id, {
                    id: doc.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profilePhotoURL: data.profilePhotoURL,
                    skills: data.skills,
                    interests: data.interests,
                });
            }
        });
    }

    processSnapshot(firstNameSnapshot);
    processSnapshot(lastNameSnapshot);
    processSnapshot(skillsSnapshot);
    processSnapshot(interestsSnapshot);

    return Array.from(usersMap.values());

  } catch (error) {
    console.error('Error searching users:', error);
    // In a real app, you might want to log this error to a monitoring service
    throw new Error('Failed to search for users.');
  }
}
