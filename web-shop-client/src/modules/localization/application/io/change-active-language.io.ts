import { z } from 'zod';

/**
 * Input/Output schemas for ChangeActiveLanguage use case
 */

// Input schema
export const ChangeActiveLanguageInputSchema = z.object({
  languageCode: z.string().min(1, 'Language code is required')
    .regex(/^[a-z]{2,3}$/, 'Language code must be 2-3 lowercase letters')
});

export type ChangeActiveLanguageInput = z.infer<typeof ChangeActiveLanguageInputSchema>;

// Output schema
export const ChangeActiveLanguageOutputSchema = z.object({
  language: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    nativeName: z.string(),
    direction: z.enum(['ltr', 'rtl']),
    isActive: z.boolean(),
    fallbackCode: z.string().optional(),
    flag: z.string().optional()
  }),
  previousLanguageCode: z.string().optional()
});

export type ChangeActiveLanguageOutput = z.infer<typeof ChangeActiveLanguageOutputSchema>;
