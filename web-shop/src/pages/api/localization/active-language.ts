import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let { data: activeLanguage, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('[API] Failed to get active language:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!activeLanguage) {
      // If no active language, return English as default
      const { data: defaultLanguage, error: defaultError } = await supabase
        .from('languages')
        .select('*')
        .eq('code', 'en')
        .single();

      if (defaultError || !defaultLanguage) {
        return res.status(404).json({ error: 'No default language found' });
      }

      activeLanguage = defaultLanguage;
    }

    // Map to API response format
    const apiLanguage = {
      id: activeLanguage.id,
      code: activeLanguage.code,
      name: activeLanguage.name,
      nativeName: activeLanguage.native_name,
      direction: activeLanguage.direction,
      isActive: activeLanguage.is_active,
      fallbackCode: activeLanguage.fallback_code,
      flag: activeLanguage.flag,
      createdAt: activeLanguage.created_at,
      updatedAt: activeLanguage.updated_at
    };

    res.status(200).json(apiLanguage);
  } catch (error) {
    console.error('[API] Unexpected error getting active language:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
