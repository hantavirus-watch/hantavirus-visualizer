import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import './App.css';
import ClusteredMarkers from './ClusteredMarkers';
import Sidebar from './Sidebar';
import TooltipPopup from './TooltipPopup';
import Legend from './Legend';
import 'leaflet/dist/leaflet.css';

// Responsive utility
function useIsMobile(breakpoint = 760) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}
import {
  ABOUT_PAGE,
  ALERT_TYPE_META,
  CONTACT_PAGE,
  ENDEMIC_ZONES,
  FAQ_ITEMS,
  FEATURED_OUTBREAK,
  HANTAVIRUS_PAGE,
  HISTORICAL_CASES,
  INTRO_STEPS,
  LOCATION_ALIASES,
  MENU_ITEMS,
  ROUTE_ALERT,
  SUPPORT_LINKS,
  SYMPTOMS_PAGE,
} from './siteContent';

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

// Example legend items (update dynamically as needed)
const DEFAULT_LEGEND_ITEMS = [
  { label: 'Confirmed', color: '#38bdf8' },
  { label: 'Suspected', color: '#fbbf24' },
  { label: 'Recovered', color: '#22d3ee' },
  { label: 'Fatal', color: '#ef4444' },
];
const MAP_CENTER = [20, 0];
const MAP_ZOOM = 2;
const MAP_FOCUS_ZOOM = 4;
const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
const ALERT_TYPE_ORDER = ['local', 'imported', 'response'];
const OUTBREAK_PATTERNS = [/hondius/i, /cruise ship/i, /antarctic peninsula/i, /tenerife/i];
const HASH_TO_VIEW = {
  '': 'map',
  '/': 'map',
  map: 'map',
  hantavirus: 'hantavirus',
  symptoms: 'symptoms',
  about: 'about',
  faq: 'faq',
  contact: 'contact',
  outbreak: 'outbreak',
  'outbreaks/mv-hondius-2026': 'outbreak',
};
const VIEW_TO_HASH = {
  map: '#/',
  outbreak: FEATURED_OUTBREAK.routeHash,
  hantavirus: '#/hantavirus',
  symptoms: '#/symptoms',
  about: '#/about',
  faq: '#/faq',
  contact: '#/contact',
};

function normalizeHashToView(hashValue) {
  const normalizedHash = hashValue.replace(/^#/, '').replace(/^\//, '').replace(/\/$/, '');
  return HASH_TO_VIEW[normalizedHash] || 'map';
}

function updateHash(viewId) {
  const nextHash = VIEW_TO_HASH[viewId] || VIEW_TO_HASH.map;

  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.hash === nextHash) {
    return;
  }

  window.location.hash = nextHash;
}

function toTitleCase(value) {
  return value.replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function formatPublishedDate(publishedAt) {
  const publishedDate = new Date(publishedAt);

  if (Number.isNaN(publishedDate.getTime())) {
    return 'Date unavailable';
  }

  return publishedDate.toLocaleString();
}

function formatRelativeTime(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60000);

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute');
  }

  const hours = Math.round(minutes / 60);

  if (Math.abs(hours) < 48) {
    return formatter.format(hours, 'hour');
  }

  const days = Math.round(hours / 24);
  return formatter.format(days, 'day');
}

function getSignalLevel(reportCount) {
  if (reportCount >= 18) {
    return 'surge';
  }

  if (reportCount >= 8) {
    return 'active';
  }

  return 'watch';
}

function getSignalLabel(reportCount) {
  const level = getSignalLevel(reportCount);

  if (level === 'surge') {
    return 'Surge';
  }

  if (level === 'active') {
    return 'Active';
  }

  return 'Watch';
}

function getSignalPillClass(reportCount) {
  return `signal-pill signal-pill--${getSignalLevel(reportCount)}`;
}

function getAlertTypeClass(alertType) {
  return `type-pill type-pill--${alertType}`;
}

function getMarkerClassName(alertType, reportCount, isSelected) {
  const signalLevel = getSignalLevel(reportCount);
  return [
    'alert-pin',
    `alert-pin--${alertType}`,
    `alert-pin--${signalLevel}`,
    isSelected ? 'alert-pin--selected' : '',
  ].filter(Boolean).join(' ');
}

function isUnknownLocation(value) {
  return !value || /unknown/i.test(value);
}

function classifyAlertType(item) {
  const searchableText = [item.title, item.location_name, item.link]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/(screening|quarantine|isolat|advisory|response|monitoring|tracing|surveillance)/.test(searchableText)) {
    return 'response';
  }

  if (/(returnee|repatriat|travel|passenger|hospital|clinic|exposed|contact)/.test(searchableText)) {
    return 'imported';
  }

  return 'local';
}

function resolveCountryFromLocationName(locationName) {
  if (isUnknownLocation(locationName)) {
    return '';
  }

  const alias = LOCATION_ALIASES.find(entry => entry.locationName === locationName);

  if (alias) {
    return alias.country;
  }

  const parts = locationName.split(',').map(part => part.trim()).filter(Boolean);
  return parts[parts.length - 1] || locationName;
}

function resolveReportLocation(item) {
  const searchableText = [item.location_name, item.title, item.link, item.source]
    .filter(Boolean)
    .join(' ');
  const aliasMatch = LOCATION_ALIASES.find(entry => entry.patterns.some(pattern => pattern.test(searchableText)));

  if (Array.isArray(item.coordinates) && item.coordinates.length === 2) {
    const locationName = !isUnknownLocation(item.location_name)
      ? item.location_name
      : aliasMatch?.locationName || 'Unspecified location';

    return {
      locationName,
      country: aliasMatch?.country || resolveCountryFromLocationName(locationName),
      coordinates: item.coordinates,
    };
  }

  return {
    locationName: aliasMatch?.locationName || '',
    country: aliasMatch?.country || '',
    coordinates: aliasMatch?.coordinates || null,
  };
}

function hydrateReport(item) {
  const resolvedLocation = resolveReportLocation(item);
  const publishedDate = new Date(item.published);
  const searchText = [
    item.title,
    item.source,
    item.location_name,
    resolvedLocation.locationName,
    resolvedLocation.country,
  ].filter(Boolean).join(' ').toLowerCase();

  return {
    ...item,
    alertType: classifyAlertType(item),
    country: resolvedLocation.country,
    hasCoordinates: Array.isArray(resolvedLocation.coordinates) && resolvedLocation.coordinates.length === 2,
    isFeaturedOutbreak: OUTBREAK_PATTERNS.some(pattern => pattern.test(searchText)),
    locationName: resolvedLocation.locationName || item.location_name || 'No location',
    coordinates: resolvedLocation.coordinates,
    publishedDate,
    searchText,
  };
}

function buildLocationMarkers(data) {
  const groupedLocations = new Map();

  data.forEach(item => {
    if (!item.hasCoordinates) {
      return;
    }

    const [lat, lng] = item.coordinates;
    const locationKey = `${item.locationName}:${lat}:${lng}`;
    const existingLocation = groupedLocations.get(locationKey);

    if (existingLocation) {
      existingLocation.reportCount += 1;
      existingLocation.reports.push(item);
      existingLocation.typeCounts[item.alertType] += 1;
      existingLocation.sources.add(item.source || 'Unknown');
      return;
    }

    groupedLocations.set(locationKey, {
      id: locationKey,
      coordinates: item.coordinates,
      locationName: item.locationName,
      country: item.country || resolveCountryFromLocationName(item.locationName),
      reportCount: 1,
      reports: [item],
      sources: new Set([item.source || 'Unknown']),
      typeCounts: {
        local: item.alertType === 'local' ? 1 : 0,
        imported: item.alertType === 'imported' ? 1 : 0,
        response: item.alertType === 'response' ? 1 : 0,
      },
    });
  });

  return Array.from(groupedLocations.values())
    .map(location => ({
      ...location,
      dominantType: ALERT_TYPE_ORDER
        .slice()
        .sort((left, right) => location.typeCounts[right] - location.typeCounts[left])[0],
      reports: [...location.reports].sort((left, right) => right.publishedDate - left.publishedDate),
      sourceCount: location.sources.size,
    }))
    .sort((left, right) => right.reportCount - left.reportCount || left.locationName.localeCompare(right.locationName));
}

function buildAlertIcon(marker, isSelected) {
  return L.divIcon({
    className: 'alert-pin-icon',
    html: `
      <div class="${getMarkerClassName(marker.dominantType, marker.reportCount, isSelected)}">
        <span class="alert-pin__pulse"></span>
        <span class="alert-pin__core">${marker.reportCount > 1 ? formatNumber(marker.reportCount) : ''}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function buildRouteIcon(stop) {
  return L.divIcon({
    className: 'route-pin-icon',
    html: `
      <div class="route-pin route-pin--${stop.type}">
        <span class="route-pin__label">${stop.type.slice(0, 1).toUpperCase()}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
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

function MapViewportController({ activeView, selectedMarker, showDetailDrawer }) {
  const map = useMap();

  useEffect(() => {
    if (activeView === 'outbreak') {
      const routeBounds = L.latLngBounds(ROUTE_ALERT.stops.map(stop => stop.coordinates));
      map.flyToBounds(routeBounds.pad(0.35), {
        animate: true,
        duration: 1.2,
      });
      return;
    }

    if (!selectedMarker || !showDetailDrawer) {
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
  }, [activeView, map, selectedMarker, showDetailDrawer]);

  return null;
}

function SectionCard({ title, body, bullets }) {
  return (
    <article className="section-card">
      <h3>{title}</h3>
      <p>{body}</p>
      {bullets?.length ? (
        <ul className="section-list">
          {bullets.map(bullet => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function PageFrame({ eyebrow, title, description, onClose, children, actions }) {
  return (
    <section className="page-panel glass-card" aria-label={title}>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">{eyebrow}</p>
          <h2 className="page-title">{title}</h2>
          <p className="page-description">{description}</p>
        </div>
        <div className="page-header__actions">
          {actions}
          <button type="button" className="page-close-button" onClick={onClose}>
            Back to map
          </button>
        </div>
      </header>
      <div className="page-body">{children}</div>
    </section>
  );
}

function NewsFeedDrawer({ feedSearch, onClose, onFeedSearch, onSelectReport, reports }) {
  return (
    <aside className="drawer drawer--feed glass-card" aria-label="Live alerts feed">
      <div className="drawer-header">
        <div>
          <p className="drawer-eyebrow">Live alerts</p>
          <h2>Recent signal feed</h2>
        </div>
        <button type="button" className="drawer-close" onClick={onClose}>
          Close
        </button>
      </div>
      <label className="drawer-search">
        <span className="sr-only">Search the news feed</span>
        <input
          type="search"
          placeholder="Search news, places or source"
          value={feedSearch}
          onChange={event => onFeedSearch(event.target.value)}
        />
      </label>
      <div className="drawer-list" aria-label="Recent signal list">
        {reports.length ? reports.map(report => (
          <button key={`${report.link}-${report.published}`} type="button" className="feed-item" onClick={() => onSelectReport(report)}>
            <div className="feed-item__meta">
              <span className={getAlertTypeClass(report.alertType)}>{ALERT_TYPE_META[report.alertType].shortLabel}</span>
              <span>{formatRelativeTime(report.published)}</span>
              <span>{report.source || 'Unknown source'}</span>
            </div>
            <strong className="feed-item__title">{report.title}</strong>
            <span className="feed-item__location">{report.locationName}</span>
          </button>
        )) : (
          <div className="empty-card">
            <strong>No matching alerts</strong>
            <span>Try a broader search term.</span>
          </div>
        )}
      </div>
    </aside>
  );
}

function ClusterDrawer({ cluster, onClose }) {
  return (
    <aside className="drawer drawer--detail glass-card" aria-label="Selected location details">
      <div className="drawer-header">
        <div>
          <p className="drawer-eyebrow">Selected cluster</p>
          <h2>{cluster.locationName}</h2>
        </div>
        <button type="button" className="drawer-close" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="detail-stats-grid">
        <div className="detail-stat-card">
          <strong>{formatNumber(cluster.reportCount)}</strong>
          <span>signals</span>
        </div>
        <div className="detail-stat-card">
          <strong>{cluster.sourceCount}</strong>
          <span>sources</span>
        </div>
        <div className="detail-stat-card">
          <strong>{cluster.country || 'Mixed'}</strong>
          <span>territory</span>
        </div>
      </div>

      <div className="detail-banner">
        <span className={getSignalPillClass(cluster.reportCount)}>{getSignalLabel(cluster.reportCount)}</span>
        <span className={getAlertTypeClass(cluster.dominantType)}>{ALERT_TYPE_META[cluster.dominantType].label}</span>
      </div>

      <p className="detail-summary">{cluster.reports[0].title}</p>
      <a className="action-link action-link--primary" href={cluster.reports[0].link} target="_blank" rel="noreferrer">
        Open latest source
      </a>

      <div className="drawer-list" aria-label="Cluster reports">
        {cluster.reports.map(report => (
          <a key={`${report.link}-${report.published}`} className="report-card" href={report.link} target="_blank" rel="noreferrer">
            <div className="report-card__meta">
              <span className={getAlertTypeClass(report.alertType)}>{ALERT_TYPE_META[report.alertType].shortLabel}</span>
              <span>{formatPublishedDate(report.published)}</span>
            </div>
            <strong>{report.title}</strong>
            <span>{report.source || 'Unknown source'}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}

function LegendPanel({
  isExpanded,
  onToggle,
  showEndemic,
  showHistorical,
  showRouteLayer,
  onToggleEndemic,
  onToggleHistorical,
  onToggleRouteLayer,
}) {
  return (
    <section className="legend-card glass-card">
      <button type="button" className="legend-toggle" onClick={onToggle} aria-expanded={isExpanded}>
        <span>Layers</span>
        <span>{isExpanded ? 'Hide' : 'Show'}</span>
      </button>

      {isExpanded ? (
        <div className="legend-body">
          <div className="legend-block">
            <p className="page-eyebrow">Now active</p>
            <div className="legend-list">
              {ALERT_TYPE_ORDER.map(alertType => (
                <div key={alertType} className="legend-row">
                  <span className={`legend-swatch legend-swatch--${alertType}`}></span>
                  <div>
                    <strong>{ALERT_TYPE_META[alertType].label}</strong>
                    <span>{ALERT_TYPE_META[alertType].description}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="legend-caption">Marker counts represent grouped signal mentions, not confirmed case totals.</p>
          </div>

          <div className="legend-block">
            <p className="page-eyebrow">Add context</p>
            <button type="button" className={`layer-toggle ${showEndemic ? 'is-active' : ''}`} onClick={onToggleEndemic}>
              <span>Endemic zones</span>
              <small>{ENDEMIC_ZONES.length} long-running regions</small>
            </button>
            <button type="button" className={`layer-toggle ${showHistorical ? 'is-active' : ''}`} onClick={onToggleHistorical}>
              <span>Historical burden</span>
              <small>{HISTORICAL_CASES.length} reference circles</small>
            </button>
            <button type="button" className={`layer-toggle ${showRouteLayer ? 'is-active' : ''}`} onClick={onToggleRouteLayer}>
              <span>Route alert</span>
              <small>Departure, stopover and response markers</small>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MenuDrawer({ onClose, onNavigate, outbreakReportCount }) {
  return (
    <aside className="menu-panel glass-card" aria-label="Navigation menu">
      <div className="drawer-header">
        <div>
          <p className="drawer-eyebrow">Navigate</p>
          <h2>HantaWatch atlas</h2>
        </div>
        <button type="button" className="drawer-close" onClick={onClose}>
          Close
        </button>
      </div>

      <nav className="menu-list">
        {MENU_ITEMS.map(item => (
          <button key={item.id} type="button" className="menu-link" onClick={() => onNavigate(item.id)}>
            <span className="menu-link__eyebrow">{item.eyebrow}</span>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </nav>

      <article className="featured-card">
        <p className="page-eyebrow">Featured outbreak</p>
        <h3>{FEATURED_OUTBREAK.title}</h3>
        <p>{FEATURED_OUTBREAK.summary}</p>
        <div className="featured-card__stats">
          <span>{FEATURED_OUTBREAK.deaths} deaths</span>
          <span>{FEATURED_OUTBREAK.cases} cases</span>
          <span>{outbreakReportCount} related reports</span>
        </div>
        <button type="button" className="action-link action-link--ghost" onClick={() => onNavigate('outbreak')}>
          Open dossier
        </button>
      </article>
    </aside>
  );
}

function WelcomeModal({ onClose, onOpenGuide }) {
  return (
    <div className="modal-shell" role="dialog" aria-modal="true" aria-label="Welcome to the atlas">
      <div className="modal-backdrop" onClick={onClose}></div>
      <section className="modal-card glass-card">
        <div className="modal-header">
          <div>
            <p className="page-eyebrow">Welcome</p>
            <h2>Read the map as a signal atlas</h2>
            <p>
              This view combines live alerts, long-horizon risk zones and a curated outbreak dossier in one surface. Use it as a navigation tool, not as a clinical source.
            </p>
          </div>
        </div>

        <div className="intro-grid">
          {INTRO_STEPS.map(step => (
            <article key={step.title} className="intro-card">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="action-link action-link--primary" onClick={onClose}>
            Start exploring
          </button>
          <button type="button" className="action-link action-link--ghost" onClick={onOpenGuide}>
            Learn about hantavirus
          </button>
        </div>
      </section>
    </div>
  );
}

function SupportStrip() {
  return (
    <section className="support-strip glass-card" aria-label="Project links">
      <div>
        <p className="page-eyebrow">Stay informed</p>
        <strong>Follow the project</strong>
        <span>Telegram alerts for fast updates, GitHub for the code, Ko-fi for support.</span>
      </div>
      <div className="support-strip__actions">
        <a className="action-link action-link--ghost" href={SUPPORT_LINKS.telegram} target="_blank" rel="noreferrer">
          Telegram
        </a>
        <a className="action-link action-link--ghost" href={SUPPORT_LINKS.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="action-link action-link--primary" href={SUPPORT_LINKS.support} target="_blank" rel="noreferrer">
          Support
        </a>
      </div>
    </section>
  );
}

function ArticlePage({ onClose, outbreakReports, view }) {
  if (view === 'outbreak') {
    return (
      <PageFrame
        eyebrow="Featured event"
        title={`${FEATURED_OUTBREAK.title} dossier`}
        description={FEATURED_OUTBREAK.summary}
        onClose={onClose}
        actions={<span className="metric-pill">ETA {FEATURED_OUTBREAK.eta}</span>}
      >
        <div className="article-layout">
          <section className="article-hero-card">
            <div className="hero-stats">
              <div><strong>{FEATURED_OUTBREAK.deaths}</strong><span>deaths</span></div>
              <div><strong>{FEATURED_OUTBREAK.cases}</strong><span>cases</span></div>
              <div><strong>{outbreakReports.length}</strong><span>linked reports</span></div>
            </div>
            <ul className="section-list">
              {FEATURED_OUTBREAK.bulletPoints.map(point => <li key={point}>{point}</li>)}
            </ul>
          </section>

          <section className="section-grid section-grid--two">
            <SectionCard title="Route markers" body={ROUTE_ALERT.summary} bullets={ROUTE_ALERT.stops.map(stop => `${toTitleCase(stop.type)}: ${stop.title}`)} />
            <SectionCard title="Why it matters" body="The current signal spike mixes official notices, repatriation stories, local hospital updates and passenger-linked response measures. That combination is why the feed looks broader than a single location-based outbreak." />
          </section>

          <section className="report-section">
            <div className="section-heading">
              <h3>Related reporting</h3>
              <span>{outbreakReports.length} items in the local dataset</span>
            </div>
            <div className="report-grid">
              {outbreakReports.length ? outbreakReports.slice(0, 24).map(report => (
                <a key={`${report.link}-${report.published}`} className="report-card" href={report.link} target="_blank" rel="noreferrer">
                  <div className="report-card__meta">
                    <span className={getAlertTypeClass(report.alertType)}>{ALERT_TYPE_META[report.alertType].shortLabel}</span>
                    <span>{formatRelativeTime(report.published)}</span>
                  </div>
                  <strong>{report.title}</strong>
                  <span>{report.locationName}</span>
                </a>
              )) : (
                <div className="empty-card">
                  <strong>No related items found</strong>
                  <span>The dossier will populate when outbreak keywords appear in the dataset.</span>
                </div>
              )}
            </div>
          </section>
          <SupportStrip />
        </div>
      </PageFrame>
    );
  }

  if (view === 'hantavirus') {
    return (
      <PageFrame eyebrow={HANTAVIRUS_PAGE.eyebrow} title={HANTAVIRUS_PAGE.title} description={HANTAVIRUS_PAGE.intro} onClose={onClose} actions={<span className="metric-pill">{HANTAVIRUS_PAGE.updated}</span>}>
        <div className="article-layout">
          <section className="section-grid section-grid--two">
            {HANTAVIRUS_PAGE.highlights.map(highlight => (
              <SectionCard key={highlight.title} title={highlight.title} body={highlight.description} />
            ))}
          </section>
          <section className="section-grid section-grid--two">
            {HANTAVIRUS_PAGE.sections.map(section => (
              <SectionCard key={section.title} title={section.title} body={section.body} bullets={section.bullets} />
            ))}
          </section>
          <SupportStrip />
        </div>
      </PageFrame>
    );
  }

  if (view === 'symptoms') {
    return (
      <PageFrame eyebrow={SYMPTOMS_PAGE.eyebrow} title={SYMPTOMS_PAGE.title} description={SYMPTOMS_PAGE.intro} onClose={onClose} actions={<span className="metric-pill">{SYMPTOMS_PAGE.updated}</span>}>
        <div className="article-layout">
          <article className="warning-card">
            <p className="page-eyebrow">Emergency threshold</p>
            <strong>{SYMPTOMS_PAGE.warning}</strong>
          </article>
          <section className="section-grid section-grid--three">
            {SYMPTOMS_PAGE.timelines.map(section => (
              <SectionCard key={section.title} title={`${section.title} · ${section.subtitle}`} body={section.body} bullets={section.bullets} />
            ))}
          </section>
          <SectionCard title="Diagnosis" body={SYMPTOMS_PAGE.diagnosis} />
          <SupportStrip />
        </div>
      </PageFrame>
    );
  }

  if (view === 'about') {
    return (
      <PageFrame eyebrow={ABOUT_PAGE.eyebrow} title={ABOUT_PAGE.title} description={ABOUT_PAGE.intro} onClose={onClose}>
        <div className="article-layout">
          <section className="section-grid section-grid--three">
            {ABOUT_PAGE.steps.map(step => (
              <article key={step.step} className="section-card">
                <p className="page-eyebrow">{step.step}</p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </section>
          <section className="section-grid section-grid--two">
            <SectionCard title="Map layers" body="Each layer answers a different question: where hantavirus is established, where historical burden is high, and where live reporting is currently spiking." bullets={ABOUT_PAGE.layers} />
            <SectionCard title="Source posture" body="Signals are linked back to primary reporting wherever possible. Supplemental media intelligence helps surface motion faster, but it does not replace official public-health guidance." bullets={ABOUT_PAGE.sources} />
          </section>
          <SectionCard title="Known limitations" body="This atlas is intentionally honest about uncertainty. Coverage varies, geocoding is approximate for some items, and public reporting can lag fast-moving events." bullets={ABOUT_PAGE.limitations} />
          <SupportStrip />
        </div>
      </PageFrame>
    );
  }

  if (view === 'faq') {
    return (
      <PageFrame eyebrow="Reference" title="Frequently asked questions" description="A compact reference for the questions readers usually have first." onClose={onClose}>
        <div className="article-layout">
          <section className="faq-list">
            {FAQ_ITEMS.map(item => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </section>
          <SupportStrip />
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame eyebrow={CONTACT_PAGE.eyebrow} title={CONTACT_PAGE.title} description={CONTACT_PAGE.intro} onClose={onClose}>
      <div className="article-layout">
        <section className="section-grid section-grid--two">
          <SectionCard title="Reach out" body={`Email: ${CONTACT_PAGE.email}`} bullets={CONTACT_PAGE.bullets} />
          <SectionCard title="Medical note" body={CONTACT_PAGE.disclaimer} />
        </section>
        <SupportStrip />
      </div>
    </PageFrame>
  );
}

function App() {
  const prefersDarkMode = usePrefersDarkMode();
  const isMobile = useIsMobile();
  const [reports, setReports] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState('');
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState(() => normalizeHashToView(typeof window === 'undefined' ? '' : window.location.hash));
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [feedSearch, setFeedSearch] = useState('');
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [isIntroOpen, setIsIntroOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.sessionStorage.getItem('hanta-intro-dismissed') !== '1';
  });
  const [showEndemic, setShowEndemic] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showRouteLayer, setShowRouteLayer] = useState(true);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  // Sidebar hamburger state for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            setReports([]);
            setTotalReports(0);
            setLoadError('Invalid outbreak data payload');
            setIsLoading(false);
            return;
          }

          const hydratedReports = data.map(hydrateReport).sort((left, right) => right.publishedDate - left.publishedDate);

          setTotalReports(data.length);
          setLoadError('');
          setReports(hydratedReports);
          setLastUpdated(new Date());
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Data loading error:', error);
          setReports([]);
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
      setIsFeedOpen(false);
      setShowDetailDrawer(false);

      if (activeView !== 'map') {
        updateHash('map');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView]);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(normalizeHashToView(window.location.hash));
    };

    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const shouldLock = activeView !== 'map' || isMenuOpen || isFeedOpen || isIntroOpen;
    document.body.classList.toggle('is-scroll-locked', shouldLock);

    return () => {
      document.body.classList.remove('is-scroll-locked');
    };
  }, [activeView, isFeedOpen, isIntroOpen, isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsFeedOpen(false);

    if (activeView !== 'map') {
      setShowDetailDrawer(false);
    }
  }, [activeView]);

  useEffect(() => {
    if (!shareNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setShareNotice(''), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [shareNotice]);

  const markers = buildLocationMarkers(reports);
  const featuredMarker = markers.find(marker => marker.id === selectedMarkerId) || null;
  const countryCount = new Set(reports.map(report => report.country).filter(Boolean)).size;
  const geolocatedReports = reports.filter(report => report.hasCoordinates).length;
  const sourceCount = new Set(reports.map(report => report.source).filter(Boolean)).size;
  const outbreakReports = reports.filter(report => report.isFeaturedOutbreak);
  const filteredFeed = reports.filter(report => report.searchText.includes(feedSearch.trim().toLowerCase()));
  const tileUrl = prefersDarkMode ? DARK_TILE_URL : LIGHT_TILE_URL;
  const lastUpdatedLabel = lastUpdated ? formatRelativeTime(lastUpdated) : 'No update yet';
  const homeMetrics = [
    { label: 'Countries', value: countryCount },
    { label: 'Signals', value: totalReports },
    { label: 'Mapped', value: geolocatedReports },
    { label: 'Sources', value: sourceCount },
  ];

  useEffect(() => {
    if (!markers.length) {
      setSelectedMarkerId('');
      return;
    }

    const hasSelectedMarker = markers.some(marker => marker.id === selectedMarkerId);

    if (!hasSelectedMarker) {
      setSelectedMarkerId(markers[0].id);
    }
  }, [markers, selectedMarkerId]);

  const dismissIntro = () => {
    setIsIntroOpen(false);

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('hanta-intro-dismissed', '1');
    }
  };

  const navigateToView = viewId => {
    setActiveView(viewId);
    updateHash(viewId);
    setIsMenuOpen(false);
  };


  const handleMarkerClick = markerId => {
    setSelectedMarkerId(markerId);
    setShowDetailDrawer(true);
    setIsFeedOpen(false);
    setActiveView('map');
    updateHash('map');
  };

  // Close popup when map is clicked (handled in ClusteredMarkers, but keep state in sync)
  const handleClosePopup = () => {
    setShowDetailDrawer(false);
    setSelectedMarkerId('');
  };

  const handleShare = async () => {
    const shareUrl = typeof window === 'undefined' ? '' : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'HantaWatch signal atlas',
          text: SUPPORT_LINKS.shareText,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareNotice('Link copied');
    } catch (error) {
      console.error('Share error:', error);
      setShareNotice('Share unavailable');
    }
  };

  const handleFeedItemSelect = report => {
    if (!report.hasCoordinates) {
      window.open(report.link, '_blank', 'noopener,noreferrer');
      return;
    }

    const matchingMarker = markers.find(marker => marker.locationName === report.locationName);

    if (matchingMarker) {
      setSelectedMarkerId(matchingMarker.id);
      setShowDetailDrawer(true);
      setIsFeedOpen(false);
      setActiveView('map');
      updateHash('map');
      return;
    }

    window.open(report.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`app-shell ${prefersDarkMode ? 'theme-dark' : 'theme-light'}`}>
      {/* Hamburger for sidebar (mobile only) */}
      {isMobile && (
        <button
          className="hamburger"
          aria-label="Open filters menu"
          onClick={() => setIsSidebarOpen(true)}
          style={{ position: 'fixed', top: 18, left: 18, zIndex: 201, background: 'var(--accent, #c85c3e)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
        >
          ☰
        </button>
      )}

      {/* Sidebar overlay for mobile, static for desktop */}
      <Sidebar
        className={`sidebar${isMobile ? (isSidebarOpen ? ' open' : '') : ''}`}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
        // Add your filters/setFilters props here if needed
      />

      <div className="hud-layer">
        <div className="top-bar">
          <div className="brand-chip glass-card">
            <span className="brand-chip__eyebrow">HantaWatch</span>
            <strong className="brand-chip__title">Signal atlas</strong>
          </div>
          <div className="top-actions">
            <button type="button" className="top-action top-action--ghost glass-card" onClick={handleShare}>
              Share
            </button>
            <a className="top-action top-action--ghost glass-card" href={SUPPORT_LINKS.support} target="_blank" rel="noreferrer">
              Support
            </a>
            <button
              type="button"
              className="menu-toggle glass-card"
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(open => !open)}
            >
              Menu
            </button>
          </div>
        </div>
        {/* ...existing code... */}
        {/* The rest of your layout remains unchanged */}
        {/* ...existing code... */}
      </div>
      {/* ...existing code... */}
    </div>
  );
}

export default App;
