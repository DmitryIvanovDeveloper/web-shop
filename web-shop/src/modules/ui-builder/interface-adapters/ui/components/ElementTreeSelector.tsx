'use client';

import React from 'react';
import type { SidebarElement } from '../../../domain/types/sidebar-element.types';

interface ElementTreeSelectorProps {
  elements: SidebarElement[];
  selectedId: string | null;
  onSelect: (elementId: string) => void;
}

interface ElementTreeProps {
  elements: SidebarElement[];
  selectedId: string | null;
  onSelect: (elementId: string) => void;
  level?: number;
}

function ElementTree({ elements, selectedId, onSelect, level = 0 }: ElementTreeProps): JSX.Element {
  return (
    <div className="space-y-0.5">
      {elements.map((element) => (
        <div key={element.id}>
          <button
            onClick={() => onSelect(element.id)}
            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
              selectedId === element.id
                ? 'bg-blue-500 text-white font-medium'
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
          {element.children && element.children.length > 0 && (
            <ElementTree
              elements={element.children}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ElementTreeSelector({ elements, selectedId, onSelect }: ElementTreeSelectorProps): JSX.Element {
  return (
    <div>
      {elements.length > 0 ? (
        <ElementTree elements={elements} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <div className="text-gray-500 text-sm text-center py-4">
          No elements found
        </div>
      )}
    </div>
  );
}





