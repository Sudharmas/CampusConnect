"use server";
import { generatePartnerSuggestions, PartnerSuggestionsInput, PartnerSuggestionsOutput } from "@/ai/flows/generate-partner-suggestions";

export async function findPartners(input: { userProfile: string }): Promise<PartnerSuggestionsOutput> {
  const flowInput: PartnerSuggestionsInput = {
    userProfile: input.userProfile,
    numberOfSuggestions: 6,
  };
  const suggestions = await generatePartnerSuggestions(flowInput);
  return suggestions;
}
