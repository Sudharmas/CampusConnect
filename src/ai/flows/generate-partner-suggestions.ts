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
  userProfile: z
    .string()
    .describe('The user profile information including interests and skills.'),
  numberOfSuggestions: z
    .number()
    .default(5)
    .describe('The number of partner suggestions to generate.'),
});
export type PartnerSuggestionsInput = z.infer<typeof PartnerSuggestionsInputSchema>;

const PartnerSuggestionSchema = z.object({
  userId: z.string().describe('The unique identifier of the suggested partner.'),
  name: z.string().describe('The name of the suggested partner.'),
  commonInterests: z
    .array(z.string())
    .describe('A list of common interests with the user.'),
  matchScore: z.number().describe('A score indicating the strength of the match.'),
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
  prompt: `You are an AI assistant designed to suggest potential collaboration partners to users.

  Based on the user's profile information, identify other users who would be a good fit for collaboration.
  Consider interests, skills, and project goals when making your suggestions.

  User Profile: {{{userProfile}}}
  Number of Suggestions: {{{numberOfSuggestions}}}

  Return a JSON array of partner suggestions.
  Each suggestion should include the userId, name, a list of commonInterests and a matchScore between 0 and 1.
  Example:
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
