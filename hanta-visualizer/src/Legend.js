import React from 'react';

const Legend = ({ legendItems }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary bg-opacity-90 rounded-xl shadow-lg flex flex-row items-center px-6 py-3 space-x-6 border border-border min-w-[220px]">
      {legendItems.map(item => (
        <div key={item.label} className="flex items-center space-x-2">
          <span
            className="inline-block w-4 h-4 rounded-full border border-white"
            style={{ backgroundColor: item.color }}
            aria-label={item.label}
          ></span>
          <span className="text-sm text-white font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
