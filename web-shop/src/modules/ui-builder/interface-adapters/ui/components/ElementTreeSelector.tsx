'use client';

import React, { useState } from 'react';
import type { SidebarElement } from '../../../domain/types/sidebar-element.types';

interface ElementTreeSelectorProps {
  elements: SidebarElement[];
  selectedId: string | null;
  selectedIds?: Set<string>;
  onSelect: (elementId: string, shiftKey?: boolean) => void;
  onDelete?: (elementId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

interface ElementTreeProps {
  elements: SidebarElement[];
  selectedId: string | null;
  selectedIds?: Set<string>;
  onSelect: (elementId: string, shiftKey?: boolean) => void;
  onDelete?: (elementId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  level?: number;
}

function ElementTree({ 
  elements, 
  selectedId, 
  selectedIds = new Set(), 
  onSelect, 
  onDelete, 
  onReorder, 
  level = 0
}: ElementTreeProps): JSX.Element {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    console.log('[ElementTreeSelector] Drag start:', index);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      console.log('[ElementTreeSelector] Reordering:', { fromIndex: draggedIndex, toIndex: dropIndex });
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div 
      className="space-y-0.5"
      onDragOver={(e) => {
        if (level === 0 && onReorder && draggedIndex !== null) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
    >
      {elements.map((element, index) => {
        const hasChildren = element.children && element.children.length > 0;
        const isExpanded = expandedIds.has(element.id);
        const isSelected = selectedId === element.id || selectedIds.has(element.id);
        const isDraggable = level === 0 && element.type === 'Button' && !!onReorder;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div 
            key={element.id}
            draggable={isDraggable}
            onDragStart={isDraggable ? (e) => {
              const target = e.target as HTMLElement;
              // Only prevent drag if started from delete button
              const deleteButton = target.closest('button[title="Delete button"]');
              if (deleteButton) {
                e.preventDefault();
                return;
              }
              handleDragStart(e, index);
            } : undefined}
            onDragEnd={isDraggable ? handleDragEnd : undefined}
            onDragOver={level === 0 && element.type === 'Button' && onReorder ? (e) => handleDragOver(e, index) : undefined}
            onDragLeave={level === 0 && element.type === 'Button' && onReorder ? handleDragLeave : undefined}
            onDrop={level === 0 && element.type === 'Button' && onReorder ? (e) => handleDrop(e, index) : undefined}
            className={`transition-all ${
              isDragging ? 'opacity-50' : ''
            } ${
              isDragOver ? 'translate-y-1' : ''
            } ${isDraggable ? 'cursor-move' : ''}`}
            style={{
              ...(isDraggable ? { userSelect: 'none' } : {}),
            }}
          >
            <div className={`flex items-center gap-1 rounded text-xs transition-colors ${
              isSelected
                ? selectedIds.has(element.id) && selectedId !== element.id
                  ? 'bg-blue-300'
                  : 'bg-blue-500'
                : ''
            } ${isDragOver ? 'border-t-2 border-blue-400' : ''}`}>
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
              {!hasChildren && level === 0 && element.type === 'Button' && onReorder && (
                <div 
                  className="w-4 flex items-center justify-center cursor-move select-none" 
                  title="Drag to reorder"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
              )}
              {!hasChildren && (!onReorder || level > 0 || element.type !== 'Button') && <div className="w-4" />}
              <button
                onClick={(e) => {
                  console.log('[ElementTreeSelector] Button click:', { elementId: element.id, shiftKey: e.shiftKey });
                  onSelect(element.id, e.shiftKey);
                }}
                draggable={false}
                className={`flex-1 text-left px-2 py-1.5 rounded transition-colors ${
                  isSelected
                    ? 'text-white font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                style={{ paddingLeft: `${level * 10}px` }}
              >
                {element.type === 'Button' ? (
                  <span className="text-sm">
                    {element.label || element.name || 'Button'}
                  </span>
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
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Delete button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            {hasChildren && isExpanded && element.children && (
              <ElementTree
                elements={element.children}
                selectedId={selectedId}
                selectedIds={selectedIds}
                onSelect={onSelect}
                onDelete={onDelete}
                onReorder={onReorder}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ElementTreeSelector({ 
  elements, 
  selectedId, 
  selectedIds, 
  onSelect, 
  onDelete, 
  onReorder 
}: ElementTreeSelectorProps): JSX.Element {
  const visibleElements = elements.length > 0 && elements[0].children ? elements[0].children : [];

  return (
    <div>
      {visibleElements.length > 0 ? (
        <ElementTree 
          elements={visibleElements} 
          selectedId={selectedId}
          selectedIds={selectedIds}
          onSelect={onSelect} 
          onDelete={onDelete}
          onReorder={onReorder}
        />
      ) : (
        <div className="text-gray-500 text-sm text-center py-4">
          No elements found
        </div>
      )}
    </div>
  );
}
