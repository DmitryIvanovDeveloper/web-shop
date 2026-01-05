import { z } from 'zod';

/**
 * Input/Output schemas for UpdateTranslations use case
 */

// Input schema
export const UpdateTranslationsInputSchema = z.object({
  translations: z.array(z.object({
    key: z.string().min(1, 'Translation key is required')
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/,
        'Translation key must be valid (alphanumeric, dots, underscores, hyphens)'),
    languageCode: z.string().min(1, 'Language code is required')
      .regex(/^[a-z]{2,3}$/, 'Language code must be 2-3 lowercase letters'),
    value: z.string(),
    context: z.string().optional()
  })).min(1, 'At least one translation is required')
});

export type UpdateTranslationsInput = z.infer<typeof UpdateTranslationsInputSchema>;

// Output schema
export const UpdateTranslationsOutputSchema = z.object({
  updatedCount: z.number().min(0),
  languageCode: z.string()
});

export type UpdateTranslationsOutput = z.infer<typeof UpdateTranslationsOutputSchema>;
