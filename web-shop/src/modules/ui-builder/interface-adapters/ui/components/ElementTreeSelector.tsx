'use client';

import React from 'react';
import type { SidebarElement } from '../../../domain/types/sidebar-element.types';

interface ElementTreeSelectorProps {
  elements: SidebarElement[];
  selectedId: string | null;
  onSelect: (elementId: string) => void;
  onDelete?: (elementId: string) => void;
}

interface ElementTreeProps {
  elements: SidebarElement[];
  selectedId: string | null;
  onSelect: (elementId: string) => void;
  onDelete?: (elementId: string) => void;
  level?: number;
}

function ElementTree({ elements, selectedId, onSelect, onDelete, level = 0 }: ElementTreeProps): JSX.Element {
  return (
    <div className="space-y-0.5">
      {elements.map((element) => (
        <div key={element.id}>
          <div className={`flex items-center gap-1 rounded text-xs transition-colors ${
            selectedId === element.id
              ? 'bg-blue-500'
              : ''
          }`}>
            <button
              onClick={() => onSelect(element.id)}
              className={`flex-1 text-left px-2 py-1.5 rounded transition-colors ${
                selectedId === element.id
                  ? 'text-white font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              style={{ paddingLeft: `${(level + 1) * 10}px` }}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] uppercase font-semibold ${selectedId === element.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {element.type}
                </span>
                <span className="font-mono">{element.id}</span>
              </div>
              {element.label && element.label !== element.id && (
                <div className={`text-[10px] mt-0.5 ${selectedId === element.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  "{element.label}"
                </div>
              )}
            </button>
            {onDelete && element.type === 'Button' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete button "${element.label || element.id}"?`)) {
                    onDelete(element.id);
                  }
                }}
                className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Delete button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          {element.children && element.children.length > 0 && (
            <ElementTree
              elements={element.children}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ElementTreeSelector({ elements, selectedId, onSelect, onDelete }: ElementTreeSelectorProps): JSX.Element {
  return (
    <div>
      {elements.length > 0 ? (
        <ElementTree elements={elements} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} />
      ) : (
        <div className="text-gray-500 text-sm text-center py-4">
          No elements found
        </div>
      )}
    </div>
  );
}











