import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { languageCode } = req.body;

    if (!languageCode || typeof languageCode !== 'string') {
      return res.status(400).json({ error: 'Language code is required' });
    }

    // First, set all languages to inactive
    const { error: deactivateError } = await supabase
      .from('languages')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .neq('code', languageCode); // Update all except the one we're activating

    if (deactivateError) {
      console.error('[API] Failed to deactivate other languages:', deactivateError);
      return res.status(500).json({ error: deactivateError.message });
    }

    // Then, activate the requested language
    const { error: activateError } = await supabase
      .from('languages')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('code', languageCode);

    if (activateError) {
      console.error('[API] Failed to activate language:', activateError);
      return res.status(500).json({ error: activateError.message });
    }

    res.status(200).json({
      success: true,
      message: `Language ${languageCode} activated successfully`
    });
  } catch (error) {
    console.error('[API] Unexpected error activating language:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
