import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DURJOG platform header and branding', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/DURJOG/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
