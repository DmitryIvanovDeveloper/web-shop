import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type ScenarioContextType = {
  selectedScenario: number | null;
  setSelectedScenario: (index: number | null) => void;
  showAllScenarios: () => void;
};

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const { pathname } = useLocation();

  // When route changes to module page, auto-select the first scenario (index 0) only if no scenario is selected.
  useEffect(() => {
    if (pathname.startsWith('/modules/')) {
      // Only auto-select first scenario if no scenario is currently selected
      if (selectedScenario === null) {
        setSelectedScenario(0);
      }
    } else {
      setSelectedScenario(null);
    }
  }, [pathname, selectedScenario]);

  const showAllScenarios = () => {
    setSelectedScenario(null);
  };

  return (
    <ScenarioContext.Provider value={{ selectedScenario, setSelectedScenario, showAllScenarios }}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within ScenarioProvider');
  }
  return context;
}
