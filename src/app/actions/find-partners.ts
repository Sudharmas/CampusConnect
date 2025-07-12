"use server";
import { generatePartnerSuggestions, PartnerSuggestionsInput, PartnerSuggestionsOutput } from "@/ai/flows/generate-partner-suggestions";
import { getAllUsersAsProfileString } from "@/services/user";
import { auth } from "@/lib/firebase";

export async function findPartners(input: { userProfile: string }): Promise<PartnerSuggestionsOutput> {
  const allUsersString = await getAllUsersAsProfileString();

  const flowInput: PartnerSuggestionsInput = {
    currentUserProfile: input.userProfile,
    allUserProfiles: allUsersString,
    numberOfSuggestions: 6,
  };
  const suggestions = await generatePartnerSuggestions(flowInput);
  return suggestions;
}
