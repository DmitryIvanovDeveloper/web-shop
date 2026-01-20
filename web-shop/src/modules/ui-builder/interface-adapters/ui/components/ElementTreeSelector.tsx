'use client';

import React, { useState } from 'react';
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (elementId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-0.5">
      {elements.map((element) => {
        const hasChildren = element.children && element.children.length > 0;
        const isExpanded = expandedIds.has(element.id);
        const isSelected = selectedId === element.id;

        return (
          <div key={element.id}>
            <div className={`flex items-center gap-1 rounded text-xs transition-colors ${
              isSelected
                ? 'bg-blue-500'
                : ''
            }`}>
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(element.id);
                  }}
                  className={`px-1 py-1.5 text-gray-500 hover:text-gray-700 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              {!hasChildren && <div className="w-4" />}
              <button
                onClick={() => onSelect(element.id)}
                className={`flex-1 text-left px-2 py-1.5 rounded transition-colors ${
                  isSelected
                    ? 'text-white font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                style={{ paddingLeft: `${level * 10}px` }}
              >
                {element.type === 'Button' ? (
                  
                  <div className="flex items-center gap-2">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-white text-blue-600 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: element.colors?.backgroundColor || '#f3f4f6',
                        color: element.colors?.textColor || '#374151',
                        borderColor: element.colors?.borderColor || '#d1d5db',
                        minWidth: '60px',
                        justifyContent: 'center'
                      }}
                    >
                      {element.label || element.name || 'Button'}
                    </div>
                  </div>
                ) : (
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                      {element.type}
                    </span>
                    <span className="font-mono text-xs">{element.id}</span>
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
            {hasChildren && isExpanded && (
              <ElementTree
                elements={element.children}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ElementTreeSelector({ elements, selectedId, onSelect, onDelete }: ElementTreeSelectorProps): JSX.Element {
  
  const visibleElements = elements.length > 0 && elements[0].children ? elements[0].children : [];

  return (
    <div>
      {visibleElements.length > 0 ? (
        <ElementTree elements={visibleElements} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} />
      ) : (
        <div className="text-gray-500 text-sm text-center py-4">
          No elements found
        </div>
      )}
    </div>
  );
}
