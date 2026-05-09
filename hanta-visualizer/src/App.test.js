import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ eventHandlers }) => (
    <button type="button" data-testid="marker" onClick={() => eventHandlers?.click?.()}>
      Marker
    </button>
  ),
  useMap: () => ({ flyTo: jest.fn() }),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders a minimal home and opens the reports page from the top menu', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ([
      { title: 'Argentina report', source: 'Google News ES', link: 'https://example.com/1', coordinates: [-34.6, -58.3], location_name: 'Argentina', published: '2026-05-09T00:00:00Z' },
      { title: 'Spain report', source: 'Google News ES', link: 'https://example.com/2', coordinates: [40.4, -3.7], location_name: 'Spain', published: '2026-05-08T00:00:00Z' },
      { title: 'Argentina second report', source: 'Google News ES', link: 'https://example.com/3', coordinates: [-34.6, -58.3], location_name: 'Argentina', published: '2026-05-07T00:00:00Z' },
    ]),
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Open reports page: reports 3/i })).toBeInTheDocument();
  });

  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /support this project on ko-fi/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /Reports & clusters/i })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  fireEvent.click(screen.getByRole('button', { name: /Reports & clusters/i }));

  expect(screen.getByRole('heading', { name: /Reports & clusters/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^Argentina$/i, level: 3 })).toBeInTheDocument();
  expect(screen.getByText(/Argentina second report/i)).toBeInTheDocument();
  expect(screen.getByText(/2 reports/i)).toBeInTheDocument();
});

test('shows the load error inside the guide page when the payload is invalid', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ items: [] }),
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Open reports page: reports 0/i })).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: /menu/i }));
  fireEvent.click(screen.getByRole('button', { name: /Signal map guide/i }));

  expect(screen.getByRole('heading', { name: /How to read the live map/i })).toBeInTheDocument();
  expect(screen.getByText(/Invalid data format/i)).toBeInTheDocument();
});