'use client';

import React from 'react';
import { ComponentNode } from '@/modules/app-layout/domain/value-objects/component-node.value-object';
import { DynamicRenderer } from '@/modules/app-layout/interface-adapters/ui/components/dynamic-renderer';

export default function TestComponentsPage() {
  // Создаем тестовый ComponentNode с правильной обработкой Result
  const createNode = (params: any) => {
    const result = ComponentNode.create(params);
    if (result.isFailure()) {
      console.error('Failed to create node:', result.error);
      return null;
    }
    return result.value;
  };

  const testNode = createNode({
    id: 'test-root',
    type: 'div',
    styles: {
      backgroundColor: '#f0f0f0',
      padding: '20px',
      border: '1px solid #ccc',
    },
    children: [
      createNode({
        id: 'test-header',
        type: 'h1',
        props: { children: 'Hello from React Components!' },
        styles: {
          color: '#333',
          marginBottom: '10px',
        },
      }),

      createNode({
        id: 'test-paragraph',
        type: 'p',
        props: { children: 'This is rendered using React components instead of HTML strings.' },
        styles: {
          color: '#666',
          lineHeight: '1.5',
        },
      }),

      createNode({
        id: 'test-button',
        type: 'button',
        props: {
          children: 'Click me!',
          onClick: () => alert('Button clicked!')
        },
        styles: {
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
      }),
    ].filter(Boolean), // Убираем null значения
  });

  if (!testNode) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p>Failed to create test component nodes</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Component Rendering Test</h1>
      <p className="mb-4">This page demonstrates React component rendering instead of HTML strings:</p>

      <div className="border rounded-lg p-4 bg-gray-50">
        <DynamicRenderer node={testNode} />
      </div>

      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400">
        <p className="text-sm text-blue-700">
          <strong>Features:</strong> Interactive components, proper React lifecycle,
          no dangerouslySetInnerHTML, type safety, and better performance.
        </p>
      </div>
    </div>
  );
}