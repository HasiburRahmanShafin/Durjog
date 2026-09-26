// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock react-leaflet ESM exports for Jest
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: () => <div data-testid="geojson-layer" />,
  useMap: () => ({ setView: jest.fn() }),
  useMapEvent: jest.fn(),
  useMapEvents: jest.fn(),
}));

// Mock leaflet CSS / assets
jest.mock('leaflet', () => ({
  icon: jest.fn(),
  divIcon: jest.fn(),
}));
