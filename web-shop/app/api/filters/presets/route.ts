import { NextResponse } from 'next/server';

type Preset = {
  id: string;
  name: string;
  filterSet: {
    dateRange: {
      preset: string;
      granularity: string;
      from?: string;
      to?: string;
    };
    geo: {
      countries: string[];
    };
    payment: {
      methods: string[];
    };
    source: {
      sources: string[];
    };
    currency: {
      currency: string;
    };
  };
  createdAt: string;
  updatedAt: string;
};

export async function GET(): Promise<NextResponse> {
  // For now we return an empty presets list to unblock dashboard.
  const response: { presets: Preset[] } = {
    presets: [],
  };

  return NextResponse.json(response);
}

  