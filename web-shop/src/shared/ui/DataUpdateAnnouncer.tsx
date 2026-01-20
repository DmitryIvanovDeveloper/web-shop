import React from 'react';

interface DataUpdateAnnouncerProps {
  lastUpdated: Date;
  updateCount: number;
}

export const DataUpdateAnnouncer: React.FC<DataUpdateAnnouncerProps> = ({ lastUpdated, updateCount }) => {
  const text = `Data updated ${updateCount} times. Last updated ${lastUpdated.toLocaleTimeString()}.`;
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  );
};

export default DataUpdateAnnouncer;

