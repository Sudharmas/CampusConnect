
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

  // For a production app, a dedicated search service like Algolia or Elasticsearch 
  // is recommended for better performance and more complex queries. 
  // Firestore is not optimized for full-text search on its own.
  
  // This client-side filtering approach is a workaround for Firestore's limitations.
  try {
    const allUsersSnapshot = await getDocs(usersCollection);
    
    const allUsers = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as User
    }));

    const filteredUsers = allUsers.filter(user => {
        const fullName = `${user.firstName.toLowerCase()} ${user.lastName?.toLowerCase() || ''}`;
        
        if (fullName.includes(q)) {
            return true;
        }

        if (user.skills?.some(skill => skill.toLowerCase().includes(q))) {
            return true;
        }
        
        if (user.interests?.some(interest => interest.toLowerCase().includes(q))) {
            return true;
        }
        
        return false;
    });

    // Map to the final SearchedUser structure
    return filteredUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePhotoURL: user.profilePhotoURL,
      skills: user.skills,
      interests: user.interests,
    }));

  } catch (error) {
    console.error('Error searching users:', error);
    // In a real app, you might want to log this error to a monitoring service
    throw new Error('Failed to search for users.');
  }
}
