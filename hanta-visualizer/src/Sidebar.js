import React, { useState } from 'react';

const Sidebar = ({ filters, setFilters }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 bg-primary border-r border-border shadow-lg w-72 dark:bg-primary dark:text-white ${collapsed ? '-translate-x-64' : 'translate-x-0'}`}
    >
      <button
        className="absolute top-4 right-[-2.5rem] bg-accent text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '→' : '←'}
      </button>
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm mb-1">Date Range</label>
          <input
            type="date"
            className="bg-secondary rounded px-2 py-1 w-full mb-2"
            value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
          <input
            type="date"
            className="bg-secondary rounded px-2 py-1 w-full"
            value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
        {/* Virus Strain Filter */}
        <div>
          <label className="block text-sm mb-1">Virus Strain</label>
          <select
            className="bg-secondary rounded px-2 py-1 w-full"
            value={filters.strain}
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
            value={filters.status}
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
};

export default Sidebar;
