import React from 'react';
import { useDocumentUpdateCheck } from '../hooks/useDocumentUpdateCheck';

export type ScenarioTableItem = {
  id: string;
  title: string;
  description?: string;
};

type Props = {
  scenarios: ScenarioTableItem[];
  moduleName: string;
  selectedScenario?: number | null;
  onScenarioSelect?: (index: number) => void;
};

export function ScenariosTable({ scenarios, moduleName, selectedScenario, onScenarioSelect }: Props) {
  // Check updates for all scenarios
  const scenarioUpdateChecks = scenarios.map(scenario => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDocumentUpdateCheck(moduleName, scenario.title);
  });

  return (
    <div style={{ 
      border: '1px solid #2b3952', 
      borderRadius: 8, 
      background: '#0f1829',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: 12, 
        borderBottom: '1px solid #2b3952', 
        background: '#1a2332',
        fontWeight: 600,
        color: '#fff'
      }}>
        Scenarios Overview
      </div>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {scenarios.map((scenario, index) => {
          const updateCheck = scenarioUpdateChecks[index];
          const isSelected = selectedScenario === index;
          
          return (
            <div 
              key={scenario.id}
              style={{ 
                padding: 12, 
                borderBottom: index < scenarios.length - 1 ? '1px solid #2b3952' : 'none',
                background: isSelected ? '#1e3a5f' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => onScenarioSelect?.(index)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ 
                  fontWeight: isSelected ? 600 : 500, 
                  color: isSelected ? '#fff' : '#9fb3d9',
                  fontSize: 14
                }}>
                  {scenario.title}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Status indicators */}
                  {updateCheck?.isChecking && (
                    <span style={{ 
                      color: '#fbbf24', 
                      fontSize: 10, 
                      border: '1px solid #92400e', 
                      background: '#451a03', 
                      padding: '2px 6px', 
                      borderRadius: 4 
                    }}>
                      Checking…
                    </span>
                  )}
                  {updateCheck?.isOutdated && !updateCheck?.isChecking && (
                    <span style={{ 
                      color: '#fca5a5', 
                      fontSize: 10, 
                      border: '1px solid #7f1d1d', 
                      background: '#3f1d1d', 
                      padding: '2px 6px', 
                      borderRadius: 4 
                    }}>
                      Outdated
                    </span>
                  )}
                  
                  {/* Action buttons */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScenarioSelect?.(index);
                    }}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #2b3952',
                      background: isSelected ? '#2e68ff' : 'transparent',
                      color: isSelected ? '#fff' : '#9fb3d9',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 500
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
              
              {scenario.description && (
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: 12, 
                  lineHeight: 1.4,
                  marginTop: 4
                }}>
                  {scenario.description}
                </div>
              )}
              
              {updateCheck?.lastChecked && (
                <div style={{ 
                  color: '#4b5563', 
                  fontSize: 10, 
                  marginTop: 6,
                  fontStyle: 'italic'
                }}>
                  Last checked: {updateCheck.lastChecked.toLocaleTimeString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div style={{ 
        padding: 8, 
        borderTop: '1px solid #2b3952', 
        background: '#1a2332',
        fontSize: 11,
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Total: {scenarios.length} scenarios</span>
        <span>
          Outdated: {scenarioUpdateChecks.filter(check => check?.isOutdated).length}
        </span>
      </div>
    </div>
  );
}
