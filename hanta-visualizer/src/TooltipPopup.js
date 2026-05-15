import React from 'react';

const TooltipPopup = ({ caseData }) => {
  if (!caseData) return null;
  return (
    <div className="bg-secondary text-white rounded-lg shadow-xl p-4 min-w-[220px] max-w-xs border border-border">
      <div className="font-semibold text-accent mb-1">{caseData.strain || 'Unknown Strain'}</div>
      <div className="text-lg font-bold mb-2">{caseData.locationName}</div>
      <div className="text-sm mb-1">Date: <span className="font-medium">{caseData.date || 'N/A'}</span></div>
      <div className="text-sm mb-1">Status: <span className="font-medium">{caseData.status || 'N/A'}</span></div>
      <div className="text-sm mb-1">Country: <span className="font-medium">{caseData.country || 'N/A'}</span></div>
      {caseData.notes && <div className="text-xs mt-2 text-gray-300">{caseData.notes}</div>}
    </div>
  );
};

export default TooltipPopup;
