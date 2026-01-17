'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { Grid } from './grid';
import { OfferCard } from './offer-card';

export interface DataGridProps {
  readonly dataSource?: string;  // "api://products/offers"
  readonly renderItem?: (item: any, index: number) => ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function DataGrid({ 
  dataSource, 
  renderItem, 
  className = '', 
  style 
}: DataGridProps): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (!dataSource) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const apiUrl = dataSource.replace('api://', '/api/');
        const response = await fetch(apiUrl);
        const json = await response.json();
        const offers = json.offers || json.products || json.data || (Array.isArray(json) ? json : []);
        setData(offers);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataSource]);

  if (loading) {
    console.log('[DataGrid] Rendering loading state');
    return <div className="text-white">Loading offers...</div>;
  }

  console.log('[DataGrid] Rendering with data:', data);
  console.log('[DataGrid] Data length:', data.length);
  console.log('[DataGrid] renderItem exists:', !!renderItem);
  console.log('[DataGrid] dataSource:', dataSource);
  console.log('[DataGrid] className:', className);
  console.log('[DataGrid] style:', style);

  return (
    <div className={`${className || ''} mt-8`} style={style}>
      <h2 className="text-white text-xl font-bold mb-4">Products</h2>
      <Grid>
        {data.map((item, idx) => {
          console.log(`[DataGrid] Rendering item ${idx}:`, item);
          if (renderItem) {
            return renderItem(item, idx);
          }
          // По умолчанию рендерим OfferCard
          return <OfferCard key={item.id || idx} {...item} />;
        })}
      </Grid>
    </div>
  );
}

