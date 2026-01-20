import React, { useState, useEffect } from 'react';

export interface TourStep {
  target: string; 
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return;

    const element = document.querySelector(steps[currentStep].target) as HTMLElement | null;
    setTargetElement(element);

    const updateRect = () => {
      if (!element) return;
      const r = element.getBoundingClientRect();
      setRect(r);
    };

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      updateRect();
    }

    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', updateRect);
    const interval = window.setInterval(updateRect, 150); 

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
      window.clearInterval(interval);
    };
  }, [isOpen, currentStep, steps]);

  if (!isOpen || !targetElement || !rect) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
  };

  const tooltipWidth = 400;
  const tooltipMaxHeight = 220;
  const bottomSpace = window.innerHeight - rect.bottom - 16;
  const placeAbove = bottomSpace < tooltipMaxHeight;
  const tooltipTop = placeAbove ? Math.max(16, rect.top - tooltipMaxHeight) : rect.bottom + 16;
  const tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - tooltipWidth - 16));

  return (
    <>
      {}
      <div className="fixed inset-0 z-[1000] pointer-events-none">
        {}
        <div
          className="absolute pointer-events-auto rounded-lg"
          style={{
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}
        />

        {}
        <div
          className="absolute bg-white rounded-xl shadow-2xl max-w-md w-[400px] p-6 pointer-events-auto z-[1001]"
          style={{
            top: `${tooltipTop}px`,
            left: `${tooltipLeft}px`,
          }}
        >
          {}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip tour"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {}
          <p className="text-gray-700 mb-6">{step.content}</p>

          {}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-indigo-600'
                    : index < currentStep
                    ? 'w-2 bg-indigo-300'
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`Step ${index + 1}${index === currentStep ? ' (current)' : ''}`}
              />
            ))}
          </div>

          {}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const useOnboardingTour = (tourKey: string) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    
    const hasCompletedTour = localStorage.getItem(`tour-completed-${tourKey}`);
    if (!hasCompletedTour) {
      setIsOpen(true);
    }
  }, [tourKey]);

  const handleComplete = () => {
    localStorage.setItem(`tour-completed-${tourKey}`, 'true');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const resetTour = () => {
    localStorage.removeItem(`tour-completed-${tourKey}`);
    setIsOpen(true);
  };

  return { isOpen, handleComplete, handleClose, resetTour };
};

