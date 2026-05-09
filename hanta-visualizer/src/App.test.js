import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    divIcon: jest.fn(config => config),
    latLngBounds: jest.fn(() => ({
      pad: jest.fn(() => ({})),
    })),
  },
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, eventHandlers }) => (
    <button type="button" data-testid="marker" onClick={() => eventHandlers?.click?.()}>
      Marker
      {children}
    </button>
  ),
  CircleMarker: ({ children }) => <div data-testid="historical-marker">{children}</div>,
  Polygon: ({ children }) => <div data-testid="polygon">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  Tooltip: ({ children }) => <div>{children}</div>,
  ZoomControl: () => <div data-testid="zoom-control" />,
  useMap: () => ({
    flyTo: jest.fn(),
    flyToBounds: jest.fn(),
  }),
}));

afterEach(() => {
  jest.restoreAllMocks();
  window.sessionStorage.clear();
});

test('renders the new atlas shell and opens a content page from the menu', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ([
      { title: 'Argentina report', source: 'Google News ES', link: 'https://example.com/1', coordinates: [-34.6, -58.3], location_name: 'Argentina', published: '2026-05-09T00:00:00Z' },
      { title: 'Spain report', source: 'Google News ES', link: 'https://example.com/2', coordinates: [40.4, -3.7], location_name: 'Spain', published: '2026-05-08T00:00:00Z' },
      { title: 'Argentina second report', source: 'Google News ES', link: 'https://example.com/3', coordinates: [-34.6, -58.3], location_name: 'Argentina', published: '2026-05-07T00:00:00Z' },
    ]),
  });

  render(<App />);

  expect(screen.getByRole('dialog', { name: /welcome to the atlas/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /start exploring/i }));

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /live global hantavirus signals with outbreak context/i })).toBeInTheDocument();
  });

  expect(screen.getByText(/countries/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /news feed/i })).toHaveLength(2);

  fireEvent.click(screen.getByRole('button', { name: /^menu$/i }));
  fireEvent.click(screen.getByRole('button', { name: /faq/i }));

  expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument();
});

test('shows the invalid payload error in the atlas shell', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ items: [] }),
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/invalid outbreak data payload/i)).toBeInTheDocument();
  });

  expect(screen.getByText(/featured event/i)).toBeInTheDocument();
});
