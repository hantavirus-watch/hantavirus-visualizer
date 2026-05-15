
import React, { useState } from 'react';

const Sidebar = ({ filters = {}, setFilters = () => {}, className = '', open = false, onClose, isMobile = false }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Overlay close for mobile
  const handleOverlayClick = e => {
    if (e.target.classList.contains('sidebar-overlay') && onClose) {
      onClose();
    }
  };

  // Sidebar content
  const sidebarContent = (
    <aside
      className={
        `${className} fixed top-0 left-0 h-full z-30 transition-transform duration-300 bg-primary border-r border-border shadow-lg w-72 dark:bg-primary dark:text-white` +
        (isMobile ? ' sidebar-mobile' : '')
      }
      style={isMobile ? { width: '80vw', maxWidth: 340, left: 0, right: 'auto', borderRadius: 0 } : {}}
    >
      {/* Mobile close button */}
      {isMobile && (
        <button
          className="absolute top-4 right-4 bg-accent text-white rounded-full p-2 shadow-lg focus:outline-none"
          onClick={onClose}
          aria-label="Close filters menu"
          style={{ zIndex: 202 }}
        >
          ×
        </button>
      )}
      {/* Desktop collapse button */}
      {!isMobile && (
        <button
          className="absolute top-4 right-[-2.5rem] bg-accent text-white rounded-full p-2 shadow-lg focus:outline-none"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      )}
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm mb-1">Date Range</label>
          <input
            type="date"
            className="bg-secondary rounded px-2 py-1 w-full mb-2"
            value={filters.startDate || ''}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
          <input
            type="date"
            className="bg-secondary rounded px-2 py-1 w-full"
            value={filters.endDate || ''}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
        {/* Virus Strain Filter */}
        <div>
          <label className="block text-sm mb-1">Virus Strain</label>
          <select
            className="bg-secondary rounded px-2 py-1 w-full"
            value={filters.strain || ''}
            onChange={e => setFilters(f => ({ ...f, strain: e.target.value }))}
          >
            <option value="">All</option>
            <option value="Andes">Andes</option>
            <option value="Sin Nombre">Sin Nombre</option>
            <option value="Puumala">Puumala</option>
            {/* Add more strains as needed */}
          </select>
        </div>
        {/* Case Status Filter */}
        <div>
          <label className="block text-sm mb-1">Case Status</label>
          <select
            className="bg-secondary rounded px-2 py-1 w-full"
            value={filters.status || ''}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="suspected">Suspected</option>
            <option value="recovered">Recovered</option>
            <option value="fatal">Fatal</option>
          </select>
        </div>
      </div>
    </aside>
  );

  // For mobile, render overlay
  if (isMobile) {
    return open ? (
      <div className="sidebar-overlay" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.32)' }} onClick={handleOverlayClick}>
        {sidebarContent}
      </div>
    ) : null;
  }
  // Desktop: always render
  return sidebarContent;
};

export default Sidebar;
