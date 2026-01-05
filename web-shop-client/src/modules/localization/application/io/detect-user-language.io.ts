import { z } from 'zod';

/**
 * Input/Output schemas for DetectUserLanguage use case
 */

// Input schema
export const DetectUserLanguageInputSchema = z.object({
  fallbackLanguage: z.string()
    .regex(/^[a-z]{2,3}$/, 'Fallback language code must be 2-3 lowercase letters')
    .optional()
});

export type DetectUserLanguageInput = z.infer<typeof DetectUserLanguageInputSchema>;

// Output schema
export const DetectUserLanguageOutputSchema = z.object({
  detectedLanguage: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    nativeName: z.string(),
    direction: z.enum(['ltr', 'rtl']),
    isActive: z.boolean(),
    fallbackCode: z.string().optional(),
    flag: z.string().optional()
  }),
  source: z.enum(['browser', 'url', 'stored', 'fallback'])
});

export type DetectUserLanguageOutput = z.infer<typeof DetectUserLanguageOutputSchema>;
