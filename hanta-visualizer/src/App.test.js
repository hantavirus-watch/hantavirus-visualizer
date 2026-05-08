import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders only geolocated outbreak points', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ([
      { title: 'Georgia case', link: 'https://example.com/1', coordinates: [32.3, -83.1] },
      { title: 'Missing coordinates', link: 'https://example.com/2', coordinates: null },
      { title: 'Johannesburg case', link: 'https://example.com/3', coordinates: [-26.2, 28.0] },
    ]),
  });

  render(<App />);

  expect(screen.getByText(/HantaWatch Live/i)).toBeInTheDocument();
  expect(screen.getByText(/Created by Valentina Schiavon/i)).toBeInTheDocument();
  expect(screen.getByText(/Copyright/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /github.com\/valentinaschiavon99/i })).toHaveAttribute(
    'href',
    'https://github.com/valentinaschiavon99'
  );
  expect(screen.getByText(/Loading outbreak data/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Total reports: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Geolocated points: 2/i)).toBeInTheDocument();
  });

  expect(screen.getAllByTestId('marker')).toHaveLength(2);
});

test('shows an error when the payload is not an array', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({ items: [] }),
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Invalid data format/i)).toBeInTheDocument();
  });

  expect(screen.getByText(/Total reports: 0/i)).toBeInTheDocument();
  expect(screen.getByText(/Geolocated points: 0/i)).toBeInTheDocument();
});
