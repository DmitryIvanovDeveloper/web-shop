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
    let query = supabase
      .from('languages')
      .select('*')
      .in('code', ['en', 'ar']); // Only return English and Arabic as per task requirements

    // Filter by code if provided
    const { code } = req.query;
    if (code && typeof code === 'string') {
      query = query.eq('code', code);
    }

    const { data: languages, error } = await query.order('name');

    if (error) {
      console.error('[API] Failed to get languages:', error);
      return res.status(500).json({ error: error.message });
    }

    // Map to API response format
    const apiLanguages = (languages || []).map((language: any) => ({
      id: language.id,
      code: language.code,
      name: language.name,
      nativeName: language.native_name,
      direction: language.direction,
      isActive: language.is_active,
      fallbackCode: language.fallback_code,
      flag: language.flag,
      createdAt: language.created_at,
      updatedAt: language.updated_at
    }));

    res.status(200).json(apiLanguages);
  } catch (error) {
    console.error('[API] Unexpected error getting languages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
