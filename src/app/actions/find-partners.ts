
"use server";
import { generatePartnerSuggestions, PartnerSuggestionsInput, PartnerSuggestionsOutput } from "@/ai/flows/generate-partner-suggestions";
import { getAllUsersAsProfileString, getConnections } from "@/services/user";
import { auth } from "@/lib/firebase";

export async function findPartners(input: { userProfile: string }): Promise<PartnerSuggestionsOutput> {
  const allUsersString = await getAllUsersAsProfileString();
  const currentUser = auth.currentUser;

  let connectedUserIds: string[] = [];
  if (currentUser) {
      connectedUserIds = await getConnections(currentUser.uid);
  }

  const flowInput: PartnerSuggestionsInput = {
    currentUserProfile: input.userProfile,
    allUserProfiles: allUsersString,
    numberOfSuggestions: 6,
    connectedUserIds: connectedUserIds,
  };
  
  const suggestions = await generatePartnerSuggestions(flowInput);
  
  // Ensure connected users are always at the top by sorting
  if (connectedUserIds.length > 0 && suggestions.suggestions) {
    suggestions.suggestions.sort((a, b) => {
        const aIsConnected = connectedUserIds.includes(a.userId);
        const bIsConnected = connectedUserIds.includes(b.userId);
        if (aIsConnected && !bIsConnected) return -1;
        if (!aIsConnected && bIsConnected) return 1;
        // if both are connected or both are not, sort by match score
        return b.matchScore - a.matchScore;
    });
  }

  return suggestions;
}

    