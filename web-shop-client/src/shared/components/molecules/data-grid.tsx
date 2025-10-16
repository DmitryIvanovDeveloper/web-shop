'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { Grid } from './grid';

export interface DataGridProps {
  readonly dataSource?: string;  // "api://products/offers"
  readonly columns?: number;
  readonly gap?: number;
  readonly renderItem?: (item: any, index: number) => ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function DataGrid({ 
  dataSource, 
  columns = 4, 
  gap = 4,
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
        // Преобразуем "api://products/offers" -> "/api/products/offers"
        const apiUrl = dataSource.replace('api://', '/api/');
        const response = await fetch(apiUrl);
        const json = await response.json();
        setData(json.offers || json.products || json.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataSource]);

  if (loading) {
    return <div className="text-white">Loading offers...</div>;
  }

  return (
    <Grid columns={columns} gap={gap} className={className} style={style}>
      {data.map((item, idx) => renderItem ? renderItem(item, idx) : null)}
    </Grid>
  );
}

