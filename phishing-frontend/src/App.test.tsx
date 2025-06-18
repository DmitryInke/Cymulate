import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders phishing simulation app', () => {
  render(<App />);
  // App should render without crashing
  expect(document.body).toBeInTheDocument();
});
