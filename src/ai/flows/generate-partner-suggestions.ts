
'use server';

/**
 * @fileOverview A flow to generate partner suggestions based on user interests.
 *
 * - generatePartnerSuggestions - A function that generates partner suggestions.
 * - PartnerSuggestionsInput - The input type for the generatePartnerSuggestions function.
 * - PartnerSuggestionsOutput - The return type for the generatePartnerSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PartnerSuggestionsInputSchema = z.object({
  currentUserProfile: z
    .string()
    .describe('The current user\'s profile information including interests and skills.'),
  allUserProfiles: z
    .string()
    .describe('A string containing the profiles of all users in the system.'),
  numberOfSuggestions: z
    .number()
    .default(5)
    .describe('The number of partner suggestions to generate.'),
  connectedUserIds: z
    .array(z.string())
    .optional()
    .describe('An optional list of user IDs the current user is already connected with. These users should be given a higher priority or match score.'),
});
export type PartnerSuggestionsInput = z.infer<typeof PartnerSuggestionsInputSchema>;

const PartnerSuggestionSchema = z.object({
  userId: z.string().describe('The unique identifier of the suggested partner.'),
  name: z.string().describe('The name of the suggested partner.'),
  commonInterests: z
    .array(z.string())
    .describe('A list of common interests with the user.'),
  matchScore: z.number().describe('A score between 0 and 1 indicating the strength of the match.'),
});

const PartnerSuggestionsOutputSchema = z.object({
  suggestions: z.array(PartnerSuggestionSchema).describe('A list of partner suggestions.'),
});

export type PartnerSuggestionsOutput = z.infer<typeof PartnerSuggestionsOutputSchema>;

export async function generatePartnerSuggestions(
  input: PartnerSuggestionsInput
): Promise<PartnerSuggestionsOutput> {
  return generatePartnerSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePartnerSuggestionsPrompt',
  input: {
    schema: PartnerSuggestionsInputSchema,
  },
  output: {
    schema: PartnerSuggestionsOutputSchema,
  },
  prompt: `You are an AI assistant designed to suggest potential collaboration partners to users on a campus platform.

  Your task is to analyze the current user's profile and compare it against all other user profiles available in the system.
  Based on this comparison, you must identify the best potential collaborators.
  Consider shared interests, complementary skills, and common project goals.
  
  {{#if connectedUserIds}}
  The user is already connected with the following user IDs: {{#each connectedUserIds}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  Please ensure these users are given a very high matchScore (e.g., above 0.9) to reflect their existing connection, in addition to any other good matches you find.
  {{/if}}

  Current User Profile:
  {{{currentUserProfile}}}

  All User Profiles in the system:
  {{{allUserProfiles}}}

  Please generate {{{numberOfSuggestions}}} partner suggestions.
  Return a JSON object containing a list of these suggestions.
  Each suggestion should include the userId, name, a list of commonInterests, and a matchScore (a float between 0 and 1).
  Do not suggest the current user to themselves.
  
  Example Output:
  {
    "suggestions": [
      {
        "userId": "user123",
        "name": "Alice Smith",
        "commonInterests": ["AI", "Machine Learning"],
        "matchScore": 0.85
      },
      {
        "userId": "user456",
        "name": "Bob Johnson",
        "commonInterests": ["Web Development", "React"],
        "matchScore": 0.70
      }
    ]
  }`,
});

const generatePartnerSuggestionsFlow = ai.defineFlow(
  {
    name: 'generatePartnerSuggestionsFlow',
    inputSchema: PartnerSuggestionsInputSchema,
    outputSchema: PartnerSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    