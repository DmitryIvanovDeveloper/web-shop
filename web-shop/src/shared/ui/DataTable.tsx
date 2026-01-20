import React, { useState, useMemo } from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  selectedRowIndex?: number;
  ariaLabel?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  pagination = false,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  selectedRowIndex,
  ariaLabel,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr < bStr ? -1 : 1;
      } else {
        return aStr > bStr ? -1 : 1;
      }
    });
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;

  const handleSort = (key: keyof T | string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const getSortIcon = (key: keyof T | string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getCellValue = (row: T, column: TableColumn<T>) => {
    const value = row[column.key];
    return column.render ? column.render(value, row) : value;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, rowIndex: number, row: T) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (rowIndex > 0) {
          setFocusedRowIndex(rowIndex - 1);
          const prevRow = tableRef.current?.querySelector(`tr[data-row-index="${rowIndex - 1}"]`) as HTMLElement;
          prevRow?.focus();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (rowIndex < paginatedData.length - 1) {
          setFocusedRowIndex(rowIndex + 1);
          const nextRow = tableRef.current?.querySelector(`tr[data-row-index="${rowIndex + 1}"]`) as HTMLElement;
          nextRow?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onRowClick) {
          onRowClick(row, rowIndex);
        }
        break;
      case 'Home':
        event.preventDefault();
        setFocusedRowIndex(0);
        const firstRow = tableRef.current?.querySelector(`tr[data-row-index="0"]`) as HTMLElement;
        firstRow?.focus();
        break;
      case 'End':
        event.preventDefault();
        const lastIndex = paginatedData.length - 1;
        setFocusedRowIndex(lastIndex);
        const lastRow = tableRef.current?.querySelector(`tr[data-row-index="${lastIndex}"]`) as HTMLElement;
        lastRow?.focus();
        break;
    }
  };

  const handleRowClick = (row: T, rowIndex: number) => {
    setFocusedRowIndex(rowIndex);
    if (onRowClick) {
      onRowClick(row, rowIndex);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="p-6 text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table 
          ref={tableRef}
          className="min-w-full divide-y divide-gray-200"
          role="grid"
          aria-label={ariaLabel || title || 'Data table'}
          aria-rowcount={sortedData.length}
        >
          <thead className="bg-gray-50">
            <tr role="row">
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  role="columnheader"
                  aria-sort={
                    sortConfig && sortConfig.key === column.key
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : column.sortable
                      ? 'none'
                      : undefined
                  }
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500' : ''
                  } ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  tabIndex={column.sortable ? 0 : -1}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="text-gray-400" aria-hidden="true">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => {
              const globalRowIndex = (currentPage - 1) * pageSize + rowIndex;
              const isSelected = selectedRowIndex === globalRowIndex;
              const isFocused = focusedRowIndex === rowIndex;
              
              return (
                <tr 
                  key={rowIndex}
                  role="row"
                  data-row-index={rowIndex}
                  aria-rowindex={globalRowIndex + 1}
                  aria-selected={isSelected}
                  tabIndex={onRowClick ? 0 : -1}
                  className={`transition-colors ${
                    isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  } ${
                    isFocused ? 'ring-2 ring-indigo-500 ring-inset' : ''
                  } ${
                    onRowClick ? 'cursor-pointer focus:outline-none' : ''
                  }`}
                  onClick={() => handleRowClick(row, globalRowIndex)}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, row)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      role="gridcell"
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.align === 'center' ? 'text-center' :
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className="text-gray-900">
                        {getCellValue(row, column)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const showPage = 
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              if (!showPage) {
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={i} className="px-3 py-1">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm font-medium ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
