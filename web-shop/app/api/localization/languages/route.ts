import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const supabase = getSupabaseServerClient();

    if (code) {
      
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
                return NextResponse.json(
          { error: 'Language not found' },
          { status: 404 }
        );
      }

      const language = {
        id: data.id,
        code: data.code,
        name: data.name,
        nativeName: data.native_name,
        direction: data.direction,
        isActive: data.is_active,
        fallbackCode: data.fallback_code,
        flag: data.flag,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return NextResponse.json(language);
    } else {
      
            const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
                return NextResponse.json(
          { error: 'Failed to get languages' },
          { status: 500 }
        );
      }

      const languages = data.map((language: any) => ({
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

      return NextResponse.json(languages);
    }
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, nativeName, direction, isActive, fallbackCode } = body;

    if (!code || !name || !nativeName || !direction) {
      return NextResponse.json(
        { error: 'code, name, nativeName, and direction are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('languages')
      .insert({
        code,
        name,
        native_name: nativeName,
        direction,
        is_active: isActive || false,
        fallback_code: fallbackCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
            if (error.code === '23505') { 
        return NextResponse.json(
          { error: 'Language with this code already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const language = {
      id: data.id,
      code: data.code,
      name: data.name,
      nativeName: data.native_name,
      direction: data.direction,
      isActive: data.is_active,
      fallbackCode: data.fallback_code,
      flag: data.flag,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

        return NextResponse.json(language, { status: 201 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}