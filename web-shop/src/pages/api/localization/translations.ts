import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method === 'GET') {
    try {
      const { lang } = req.query;

      if (!lang || typeof lang !== 'string') {
        return res.status(400).json({ error: 'Language code parameter is required' });
      }

      const { data: translations, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', lang);

      if (error) {
        console.error('[API] Failed to get translations:', error);
        return res.status(500).json({ error: error.message });
      }

      // Map to API response format
      const apiTranslations = (translations || []).map((translation: any) => ({
        key: translation.key,
        languageCode: translation.language_code,
        value: translation.value,
        isTranslated: translation.value && translation.value.length > 0,
        createdAt: translation.created_at,
        updatedAt: translation.updated_at
      }));

      res.status(200).json(apiTranslations);
    } catch (error) {
      console.error('[API] Unexpected error getting translations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      let updatedCount = 0;
      let createdCount = 0;

      // Process each update
      for (const update of updates) {
        const { key, languageCode, value } = update;

        // Check if translation exists
        const { data: existing, error: checkError } = await supabase
          .from('translations')
          .select('id')
          .eq('key', key)
          .eq('language_code', languageCode)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('[API] Failed to check existing translation:', checkError);
          return res.status(500).json({ error: checkError.message });
        }

        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from('translations')
            .update({
              value,
              updated_at: new Date().toISOString()
            })
            .eq('key', key)
            .eq('language_code', languageCode);

          if (updateError) {
            console.error('[API] Failed to update translation:', updateError);
            return res.status(500).json({ error: updateError.message });
          }
          updatedCount++;
        } else {
          // Create new
          const { error: insertError } = await supabase
            .from('translations')
            .insert({
              key,
              language_code: languageCode,
              value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('[API] Failed to create translation:', insertError);
            return res.status(500).json({ error: insertError.message });
          }
          createdCount++;
        }
      }

      return res.status(200).json({
        message: 'Translations updated successfully',
        updatedCount,
        createdCount
      });
    } catch (error) {
      console.error('[API] Unexpected error updating translations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}