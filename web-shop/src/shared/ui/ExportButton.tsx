'use client';

import React, { useState } from 'react';

export type ExportFormat = 'CSV' | 'JSON' | 'PDF';

interface ExportButtonProps {
  data: any;
  filename?: string;
  format?: ExportFormat;
  label?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = 'export',
  format = 'CSV',
  label = 'Export',
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: any, filename: string) => {
    const rows: string[] = [];

    // Extract headers
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      rows.push(headers.join(','));

      // Extract rows
      data.forEach((item: any) => {
        const values = headers.map(header => {
          const value = item[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        rows.push(values.join(','));
      });
    } else if (typeof data === 'object') {
      // Handle single object
      const headers = Object.keys(data);
      rows.push(headers.join(','));
      rows.push(headers.map(h => data[h]).join(','));
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async (data: any, filename: string) => {
    // Simple PDF generation (would use a library like jsPDF in production)
    const textContent = JSON.stringify(data, null, 2);
    const blob = new Blob([textContent], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.txt`); // Simplified - use .pdf with proper library
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      switch (format) {
        case 'CSV':
          exportToCSV(data, filename);
          break;
        case 'JSON':
          exportToJSON(data, filename);
          break;
        case 'PDF':
          await exportToPDF(data, filename);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`
        px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg 
        hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <span>📥</span>
          <span>{label} {format}</span>
        </>
      )}
    </button>
  );
};

// Multi-format export dropdown
interface ExportDropdownProps {
  data: any;
  filename?: string;
  onExport?: (format: ExportFormat) => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  filename = 'dashboard-export',
  onExport,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formats: ExportFormat[] = ['CSV', 'JSON', 'PDF'];

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);
    if (onExport) {
      onExport(format);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
      >
        <span>📥</span>
        <span>Export</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            {formats.map((format) => (
              <ExportButton
                key={format}
                data={data}
                filename={filename}
                format={format}
                label=""
                className="w-full rounded-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

