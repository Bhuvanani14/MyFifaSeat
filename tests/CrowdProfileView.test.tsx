import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CrowdProfileView from '../src/components/CrowdProfileView';

describe('CrowdProfileView', () => {
  it('renders the Crowd Telemetry Profile heading', () => {
    render(<CrowdProfileView />);
    expect(screen.getByText('Crowd Telemetry Profile')).toBeInTheDocument();
  });

  it('renders the sub-header for the sensor grid', () => {
    render(<CrowdProfileView />);
    expect(screen.getByText(/Real-time stadium sensor grid diagnostics/i)).toBeInTheDocument();
  });

  it('displays the total attendance stat', () => {
    render(<CrowdProfileView />);
    // 81,308 is rendered via toLocaleString()
    expect(screen.getByText(/81,308/)).toBeInTheDocument();
  });

  it('shows the average noise level value', () => {
    render(<CrowdProfileView />);
    // 94.5 decibels
    expect(screen.getByText('94.5')).toBeInTheDocument();
  });

  it('shows the overall crowd mood', () => {
    render(<CrowdProfileView />);
    expect(screen.getByText('Electric')).toBeInTheDocument();
  });

  it('renders the Stadium Sound Map tab button', () => {
    render(<CrowdProfileView />);
    const soundMapTab = screen.getByRole('button', { name: /Stadium Sound Map/i });
    expect(soundMapTab).toBeInTheDocument();
  });

  it('renders the Concession Queues tab button', () => {
    render(<CrowdProfileView />);
    const concessionTab = screen.getByRole('button', { name: /Concession Queues/i });
    expect(concessionTab).toBeInTheDocument();
  });

  it('renders Live Cheering Alerts section in default noise tab', () => {
    render(<CrowdProfileView />);
    expect(screen.getByText(/Live Cheering Alerts/i)).toBeInTheDocument();
  });

  it('renders Arena Noise Distribution heading in default view', () => {
    render(<CrowdProfileView />);
    expect(screen.getByText(/Arena Noise Distribution/i)).toBeInTheDocument();
  });

  it('switches to concession queues content when tab is clicked', () => {
    render(<CrowdProfileView />);
    const concessionTab = screen.getByRole('button', { name: /Concession Queues/i });
    fireEvent.click(concessionTab);
    // After clicking, concession content heading should appear
    expect(screen.getByText(/Real-Time Concession wait times/i)).toBeInTheDocument();
  });

  it('concession tab shows concession stand names', () => {
    render(<CrowdProfileView />);
    const concessionTab = screen.getByRole('button', { name: /Concession Queues/i });
    fireEvent.click(concessionTab);
    expect(screen.getByText('Arena Draft & Brew')).toBeInTheDocument();
    expect(screen.getByText('FIFA Fan Burgers')).toBeInTheDocument();
  });

  it('shows fan support split with Brazil percentage', () => {
    render(<CrowdProfileView />);
    expect(screen.getByText(/🇧🇷 Brazil Fans: 58%/)).toBeInTheDocument();
  });

  it('shows cheering feed entries mentioning Brazil', () => {
    render(<CrowdProfileView />);
    // The cheering feed mentions "Brazil" in one entry
    const brazilMentions = screen.getAllByText(/Brazil/i);
    expect(brazilMentions.length).toBeGreaterThan(0);
  });

  it('renders without crashing on mount', () => {
    const { container } = render(<CrowdProfileView />);
    expect(container).toBeTruthy();
  });

  it('Sector Sensor Check panel renders in default view', () => {
    render(<CrowdProfileView />);
    expect(screen.getByText(/Sector Sensor Check/i)).toBeInTheDocument();
  });
});
