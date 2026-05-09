import React, { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const MAP_CENTER = [20, 0];
const MAP_ZOOM = 2;
const MAP_FOCUS_ZOOM = 4;
const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
const FALLBACK_LOCATIONS = [
  {
    locationName: 'Canary Islands',
    coordinates: [28.2916, -16.6291],
    patterns: [/canary islands/i, /canarias/i, /tenerife/i, /gran canaria/i, /las palmas/i],
  },
];
const MENU_PAGES = [
  {
    id: 'reports',
    eyebrow: 'Data view',
    title: 'Reports & clusters',
    description: 'Open the live outbreak dataset in a dedicated page instead of on top of the map.',
  },
  {
    id: 'guide',
    eyebrow: 'Map guide',
    title: 'Signal map guide',
    description: 'Read the intensity scale, refresh cadence and how to navigate the live map.',
  },
  {
    id: 'about',
    eyebrow: 'Project info',
    title: 'About & links',
    description: 'Credits, repository, Telegram alerts and share links live here now.',
  },
];

function getSeverityColor(reportCount) {
  if (reportCount >= 15) {
    return '#dc2626';
  }

  if (reportCount >= 6) {
    return '#f97316';
  }

  return '#facc15';
}

function getSeverityLabel(reportCount) {
  if (reportCount >= 15) {
    return 'High activity';
  }

  if (reportCount >= 6) {
    return 'Medium activity';
  }

  return 'Low activity';
}

function getSeverityKey(reportCount) {
  if (reportCount >= 15) {
    return 'high';
  }

  if (reportCount >= 6) {
    return 'medium';
  }

  return 'low';
}

function getMarkerClassName(reportCount, isSelected) {
  const severityKey = getSeverityKey(reportCount);
  return [
    'signal-marker',
    `signal-marker--${severityKey}`,
    isSelected ? 'signal-marker--selected' : '',
  ].filter(Boolean).join(' ');
}

function formatPublishedDate(publishedAt) {
  const publishedDate = new Date(publishedAt);

  if (Number.isNaN(publishedDate.getTime())) {
    return 'Date unavailable';
  }

  return publishedDate.toLocaleDateString();
}

function resolveReportLocation(item) {
  if (Array.isArray(item.coordinates) && item.coordinates.length === 2) {
    return {
      locationName: item.location_name || 'Unknown location',
      coordinates: item.coordinates,
    };
  }

  const searchableText = [item.location_name, item.title, item.link]
    .filter(Boolean)
    .join(' ');

  const fallbackLocation = FALLBACK_LOCATIONS.find(entry => entry.patterns.some(pattern => pattern.test(searchableText)));

  if (!fallbackLocation) {
    return null;
  }

  return {
    locationName: fallbackLocation.locationName,
    coordinates: fallbackLocation.coordinates,
  };
}

function buildLocationMarkers(data) {
  const groupedLocations = new Map();

  data.forEach(item => {
    const resolvedLocation = resolveReportLocation(item);

    if (!resolvedLocation) {
      return;
    }

    const [lat, lng] = resolvedLocation.coordinates;
    const locationKey = `${resolvedLocation.locationName}:${lat}:${lng}`;
    const existingLocation = groupedLocations.get(locationKey);
    const resolvedReport = {
      ...item,
      location_name: resolvedLocation.locationName,
      coordinates: resolvedLocation.coordinates,
    };

    if (existingLocation) {
      existingLocation.reportCount += 1;
      existingLocation.reports.push(resolvedReport);
      return;
    }

    groupedLocations.set(locationKey, {
      id: locationKey,
      coordinates: resolvedLocation.coordinates,
      locationName: resolvedLocation.locationName,
      reportCount: 1,
      reports: [resolvedReport],
    });
  });

  return Array.from(groupedLocations.values())
    .map(location => ({
      ...location,
      reports: [...location.reports].sort((left, right) => new Date(right.published) - new Date(left.published)),
    }))
    .sort((left, right) => right.reportCount - left.reportCount);
}

function usePrefersDarkMode() {
  const getInitialPreference = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [prefersDarkMode, setPrefersDarkMode] = useState(getInitialPreference);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = event => setPrefersDarkMode(event.matches);

    setPrefersDarkMode(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersDarkMode;
}

function MapViewportController({ selectedMarker, activePage }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedMarker || activePage !== 'reports') {
      map.flyTo(MAP_CENTER, MAP_ZOOM, {
        animate: true,
        duration: 1,
      });
      return;
    }

    map.flyTo(selectedMarker.coordinates, MAP_FOCUS_ZOOM, {
      animate: true,
      duration: 1.2,
    });
  }, [activePage, map, selectedMarker]);

  return null;
}

function PageFrame({ eyebrow, title, description, onClose, className = '', children }) {
  return (
    <section className={`page-panel glass-card ${className}`.trim()} aria-label={title}>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">{eyebrow}</div>
          <h2 className="page-title">{title}</h2>
          <p className="page-description">{description}</p>
        </div>
        <button type="button" className="page-close-button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="page-body">{children}</div>
    </section>
  );
}

function ReportsPage({
  featuredMarker,
  filteredMarkers,
  filteredReportCount,
  locationFilter,
  locationOptions,
  onClose,
  onResetFilters,
  onSelectMarker,
  onSetLocationFilter,
  onSetSeverityFilter,
  severityFilter,
}) {
  return (
    <PageFrame
      eyebrow="Data view"
      title="Reports & clusters"
      description="Every cluster now opens inside a dedicated page instead of a popup on the main map."
      onClose={onClose}
      className="page-panel--wide"
    >
      <div className="reports-toolbar">
        <div className="filter-grid">
          <label className="filter-field">
            <span>Country / region</span>
            <select value={locationFilter} onChange={event => onSetLocationFilter(event.target.value)}>
              <option value="all">All</option>
              {locationOptions.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Severity</span>
            <select value={severityFilter} onChange={event => onSetSeverityFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <div className="page-summary-row">
          <span>{filteredReportCount} mapped reports in view</span>
          {(locationFilter !== 'all' || severityFilter !== 'all') && (
            <button type="button" className="text-button" onClick={onResetFilters}>
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="reports-layout">
        <div className="cluster-list" aria-label="Cluster list">
          {filteredMarkers.length ? filteredMarkers.map(cluster => (
            <button
              key={cluster.id}
              type="button"
              className={`cluster-item${cluster.id === featuredMarker?.id ? ' is-selected' : ''}`}
              onClick={() => onSelectMarker(cluster.id)}
            >
              <div className="cluster-item__top">
                <span className="cluster-item__name">{cluster.locationName}</span>
                <span className={`severity-pill severity-pill--${getSeverityKey(cluster.reportCount)}`}>
                  {getSeverityLabel(cluster.reportCount)}
                </span>
              </div>
              <div className="cluster-item__meta">
                <span>{cluster.reportCount} reports</span>
                <span>{cluster.reports[0].source || 'Source unavailable'}</span>
              </div>
            </button>
          )) : (
            <div className="empty-state">
              <strong>No outbreaks found.</strong>
              <span>Try widening the country or severity filters.</span>
            </div>
          )}
        </div>

        <div className="detail-panel">
          {featuredMarker ? (
            <>
              <div className="detail-header">
                <div>
                  <div className="page-eyebrow">Selected cluster</div>
                  <h3 className="detail-title">{featuredMarker.locationName}</h3>
                </div>
                <span className={`severity-pill severity-pill--${getSeverityKey(featuredMarker.reportCount)}`}>
                  {getSeverityLabel(featuredMarker.reportCount)}
                </span>
              </div>

              <p className="detail-story">{featuredMarker.reports[0].title}</p>

              <div className="detail-stats">
                <div className="detail-stat">
                  <strong>{featuredMarker.reportCount}</strong>
                  <span>clustered reports</span>
                </div>
                <div className="detail-stat">
                  <strong>{featuredMarker.locationName}</strong>
                  <span>current focus</span>
                </div>
              </div>

              <div className="detail-actions">
                <a
                  className="action-link action-link--primary"
                  href={featuredMarker.reports[0].link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open latest report
                </a>
              </div>

              <div className="detail-links" aria-label="Report links">
                {featuredMarker.reports.map((report, index) => (
                  <a
                    key={`${report.link}-${index}`}
                    className="detail-link"
                    href={report.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="detail-link__source">{report.source || 'Source unavailable'}</span>
                    <span className="detail-link__title">{report.title}</span>
                    <span className="detail-link__date">{formatPublishedDate(report.published)}</span>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state empty-state--tall">
              <strong>No active cluster</strong>
              <span>Select a marker on the map or choose another filter combination.</span>
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}

function GuidePage({ geolocatedReports, isLoading, lastUpdated, loadError, markers, onClose, onOpenReports, totalReports }) {
  return (
    <PageFrame
      eyebrow="Map guide"
      title="How to read the live map"
      description="The main screen stays minimal now. Use this page to understand the signal scale and refresh state."
      onClose={onClose}
      className="page-panel--medium"
    >
      <div className="guide-grid">
        <article className="guide-card">
          <div className="guide-card__header">
            <h3>Signal status</h3>
            {isLoading && <span className="status-chip status-chip--loading">Loading</span>}
            {!isLoading && !loadError && <span className="status-chip status-chip--live">Live</span>}
            {loadError && <span className="status-chip status-chip--error">Error</span>}
          </div>
          <p>
            The homepage now keeps only the core counters visible. Open this guide or the reports page from the top menu whenever you need context.
          </p>
          <ul className="guide-metrics">
            <li><strong>{totalReports}</strong><span>reports in dataset</span></li>
            <li><strong>{markers.length}</strong><span>active clusters</span></li>
            <li><strong>{geolocatedReports}</strong><span>mapped reports</span></li>
          </ul>
          <div className="guide-note">Auto-refresh every 30 minutes</div>
          {lastUpdated && <div className="guide-note">Last update: {lastUpdated.toLocaleString()}</div>}
          {loadError && <div className="guide-error">{loadError}</div>}
        </article>

        <article className="guide-card">
          <h3>Intensity scale</h3>
          <div className="legend-list">
            <div className="legend-row"><span className="legend-dot legend-dot--yellow"></span><span>Yellow: 1-5 reports</span></div>
            <div className="legend-row"><span className="legend-dot legend-dot--orange"></span><span>Orange: 6-14 reports</span></div>
            <div className="legend-row"><span className="legend-dot legend-dot--red"></span><span>Red: 15+ reports</span></div>
          </div>
          <p>
            Marker color intensifies as more reports cluster in the same geolocated area. Click any marker to jump directly into the reports page.
          </p>
          <button type="button" className="action-link action-link--ghost" onClick={onOpenReports}>
            Open reports page
          </button>
        </article>
      </div>
    </PageFrame>
  );
}

function AboutPage({ onClose }) {
  return (
    <PageFrame
      eyebrow="Project info"
      title="About HantaWatch"
      description="All supporting links and credits now live in one place instead of floating around the map."
      onClose={onClose}
      className="page-panel--medium"
    >
      <div className="about-grid">
        <article className="about-card">
          <h3>Valentina Schiavon</h3>
          <p>
            Independent project tracking hantavirus-related reports and clustering them on a live world map.
          </p>
          <div className="about-links">
            <a className="action-link action-link--primary" href="https://github.com/valentinaschiavon99" target="_blank" rel="noreferrer">
              Open GitHub profile
            </a>
            <a className="action-link action-link--ghost" href="https://t.me/hantavirus_watch_bot" target="_blank" rel="noreferrer">
              Telegram alerts
            </a>
            <a className="action-link action-link--ghost" href="https://twitter.com/intent/tweet?text=Track%20hantavirus%20outbreaks%20worldwide%20in%20real%20time%20%F0%9F%97%BA%EF%B8%8F&url=https%3A%2F%2Fhantavirus-watch.github.io%2Fhantavirus-visualizer" target="_blank" rel="noreferrer">
              Share project
            </a>
          </div>
        </article>

        <article className="about-card">
          <h3>Credits</h3>
          <ul className="credit-list">
            <li>Copyright {new Date().getFullYear()} Valentina Schiavon</li>
            <li><a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a></li>
            <li><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a></li>
            <li><a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO basemaps</a></li>
            <li><a href="https://ko-fi.com/hantaviruswatch" target="_blank" rel="noreferrer">Support on Ko-fi</a></li>
          </ul>
        </article>
      </div>
    </PageFrame>
  );
}

function App() {
  const prefersDarkMode = usePrefersDarkMode();
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('');
  const outbreakDataUrl = `${process.env.PUBLIC_URL}/outbreak.json`;

  useEffect(() => {
    const loadOutbreakData = () => {
      fetch(`${outbreakDataUrl}?t=${Date.now()}`, { cache: 'no-store' })
        .then(response => {
          if (response.ok === false) {
            throw new Error(`HTTP ${response.status}`);
          }

          return response.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            setMarkers([]);
            setTotalReports(0);
            setLoadError('Invalid data format');
            setIsLoading(false);
            return;
          }

          setTotalReports(data.length);
          setLoadError('');
          setMarkers(buildLocationMarkers(data));
          setLastUpdated(new Date());
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Data loading error:', error);
          setMarkers([]);
          setTotalReports(0);
          setLoadError('Unable to load outbreak data');
          setIsLoading(false);
        });
    };

    loadOutbreakData();
    const intervalId = window.setInterval(loadOutbreakData, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [outbreakDataUrl]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key !== 'Escape') {
        return;
      }

      setIsMenuOpen(false);
      setActivePage('');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const shouldLock = Boolean(activePage) || isMenuOpen;
    document.body.classList.toggle('is-scroll-locked', shouldLock);

    return () => {
      document.body.classList.remove('is-scroll-locked');
    };
  }, [activePage, isMenuOpen]);

  const filteredMarkers = markers.filter(marker => {
    const matchesLocation = locationFilter === 'all' || marker.locationName === locationFilter;
    const matchesSeverity = severityFilter === 'all' || getSeverityKey(marker.reportCount) === severityFilter;

    return matchesLocation && matchesSeverity;
  });

  useEffect(() => {
    if (!filteredMarkers.length) {
      if (selectedMarkerId) {
        setSelectedMarkerId('');
      }

      return;
    }

    const hasSelectedMarker = filteredMarkers.some(marker => marker.id === selectedMarkerId);

    if (!hasSelectedMarker) {
      setSelectedMarkerId(filteredMarkers[0].id);
    }
  }, [filteredMarkers, selectedMarkerId]);

  const geolocatedReports = markers.reduce((reportCount, marker) => reportCount + marker.reportCount, 0);
  const filteredReportCount = filteredMarkers.reduce((reportCount, marker) => reportCount + marker.reportCount, 0);
  const featuredMarker = filteredMarkers.find(marker => marker.id === selectedMarkerId) || filteredMarkers[0] || null;
  const locationOptions = Array.from(new Set(markers.map(marker => marker.locationName))).sort((left, right) => left.localeCompare(right));
  const tileUrl = prefersDarkMode ? DARK_TILE_URL : LIGHT_TILE_URL;
  const homeStats = [
    { label: 'reports', value: totalReports },
    { label: 'clusters', value: markers.length },
    { label: 'mapped', value: geolocatedReports },
  ];

  const openPage = pageId => {
    setActivePage(pageId);
    setIsMenuOpen(false);
  };

  const openReportsPage = () => openPage('reports');

  const handleMarkerClick = markerId => {
    setSelectedMarkerId(markerId);
    openPage('reports');
  };

  return (
    <div className={`app-shell ${prefersDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <div className="top-bar">
        <div className="brand-chip glass-card">
          <span className="brand-chip__eyebrow">Hantavirus Watch</span>
          <strong className="brand-chip__title">Live map</strong>
        </div>

        <div className={`menu-wrap ${isMenuOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className="menu-toggle glass-card"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(open => !open)}
          >
            Menu
          </button>

          {isMenuOpen && (
            <div className="menu-dropdown glass-card" role="menu" aria-label="Top navigation">
              {MENU_PAGES.map(page => (
                <button
                  key={page.id}
                  type="button"
                  className="menu-item"
                  onClick={() => openPage(page.id)}
                >
                  <span className="menu-item__eyebrow">{page.eyebrow}</span>
                  <span className="menu-item__title">{page.title}</span>
                  <span className="menu-item__desc">{page.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="home-stage">
        <div className="status-row" aria-label="Live counters">
          {homeStats.map(stat => (
            <button
              key={stat.label}
              type="button"
              className="stat-card glass-card"
              aria-label={`Open reports page: ${stat.label} ${stat.value}`}
              onClick={openReportsPage}
            >
              <span className="stat-card__value">{stat.value}</span>
              <span className="stat-card__label">{stat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <a
        className="donate-fab glass-card"
        href="https://ko-fi.com/hantaviruswatch"
        target="_blank"
        rel="noreferrer"
        aria-label="Support this project on Ko-fi"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
        </svg>
        <span>Support</span>
      </a>

      {activePage && (
        <div className="page-layer">
          <button
            type="button"
            className="page-backdrop"
            aria-label="Close current page"
            onClick={() => setActivePage('')}
          />

          <div className="page-shell">
            {activePage === 'reports' && (
              <ReportsPage
                featuredMarker={featuredMarker}
                filteredMarkers={filteredMarkers}
                filteredReportCount={filteredReportCount}
                locationFilter={locationFilter}
                locationOptions={locationOptions}
                onClose={() => setActivePage('')}
                onResetFilters={() => {
                  setLocationFilter('all');
                  setSeverityFilter('all');
                }}
                onSelectMarker={setSelectedMarkerId}
                onSetLocationFilter={setLocationFilter}
                onSetSeverityFilter={setSeverityFilter}
                severityFilter={severityFilter}
              />
            )}

            {activePage === 'guide' && (
              <GuidePage
                geolocatedReports={geolocatedReports}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
                loadError={loadError}
                markers={markers}
                onClose={() => setActivePage('')}
                onOpenReports={openReportsPage}
                totalReports={totalReports}
              />
            )}

            {activePage === 'about' && <AboutPage onClose={() => setActivePage('')} />}
          </div>
        </div>
      )}

      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        className="signal-map"
      >
        <MapViewportController activePage={activePage} selectedMarker={featuredMarker} />
        <TileLayer url={tileUrl} />
        {filteredMarkers.map(marker => (
          <CircleMarker
            key={marker.id}
            center={marker.coordinates}
            radius={Math.min(26, 8 + marker.reportCount * 2.4)}
            pathOptions={{
              className: getMarkerClassName(marker.reportCount, marker.id === selectedMarkerId),
              color: marker.id === selectedMarkerId ? '#ffffff' : getSeverityColor(marker.reportCount),
              fillColor: getSeverityColor(marker.reportCount),
              fillOpacity: marker.id === selectedMarkerId ? 0.92 : 0.78,
              weight: marker.id === selectedMarkerId ? 2.8 : 1.2,
              opacity: 1,
            }}
            eventHandlers={{
              click: () => handleMarkerClick(marker.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default App;