import { z } from 'zod';

/**
 * Input/Output schemas for GetLocalizationStatus use case
 */

// Input schema
export const GetLocalizationStatusInputSchema = z.object({
  appId: z.string().optional()
});

export type GetLocalizationStatusInput = z.infer<typeof GetLocalizationStatusInputSchema>;

// Output schema
export const GetLocalizationStatusOutputSchema = z.object({
  activeLanguage: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    nativeName: z.string(),
    direction: z.enum(['ltr', 'rtl']),
    isActive: z.boolean(),
    fallbackCode: z.string().optional(),
    flag: z.string().optional()
  }),
  supportedLanguages: z.array(z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    nativeName: z.string(),
    direction: z.enum(['ltr', 'rtl']),
    isActive: z.boolean(),
    fallbackCode: z.string().optional(),
    flag: z.string().optional()
  })),
  translationStats: z.object({
    totalKeys: z.number().min(0),
    translatedKeys: z.number().min(0),
    completionPercentage: z.number().min(0).max(100)
  })
});

export type GetLocalizationStatusOutput = z.infer<typeof GetLocalizationStatusOutputSchema>;
