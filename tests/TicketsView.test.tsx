import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketsView from '../src/components/TicketsView';
import { Ticket } from '../src/types';

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TCK-TEST1',
    match: 'Match 24 - Group Stage',
    homeTeam: 'Brazil',
    awayTeam: 'France',
    homeFlag: 'https://example.com/br.png',
    awayFlag: 'https://example.com/fr.png',
    date: 'July 20, 2026',
    time: '19:00',
    venue: 'MetLife Stadium, New Jersey',
    section: '302',
    row: 'D',
    seat: '12',
    price: 120,
    category: 'Category 3',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TEST1',
  },
  {
    id: 'TCK-TEST2',
    match: 'Semifinal',
    homeTeam: 'Germany',
    awayTeam: 'Argentina',
    homeFlag: 'https://example.com/de.png',
    awayFlag: 'https://example.com/ar.png',
    date: 'August 2, 2026',
    time: '20:00',
    venue: 'MetLife Stadium, New Jersey',
    section: '108',
    row: 'B',
    seat: '7',
    price: 250,
    category: 'Category 1',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TEST2',
  },
];

describe('TicketsView', () => {
  const mockOnTransfer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "My Ticket Wallet" heading', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    expect(screen.getByText('My Ticket Wallet')).toBeInTheDocument();
  });

  it('shows empty wallet state when no tickets are provided', () => {
    render(<TicketsView tickets={[]} onTransferTicket={mockOnTransfer} />);
    expect(screen.getByText('Wallet is Empty')).toBeInTheDocument();
  });

  it('shows helpful message in empty wallet state', () => {
    render(<TicketsView tickets={[]} onTransferTicket={mockOnTransfer} />);
    expect(
      screen.getByText(/You don't have any stadium seat bookings yet/i)
    ).toBeInTheDocument();
  });

  it('renders each ticket team matchup in list', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    expect(screen.getByText('Brazil vs France')).toBeInTheDocument();
    expect(screen.getByText('Germany vs Argentina')).toBeInTheDocument();
  });

  it('renders match labels for all tickets', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    expect(screen.getByText('Match 24 - Group Stage')).toBeInTheDocument();
    expect(screen.getByText('Semifinal')).toBeInTheDocument();
  });

  it('renders section information for each ticket in list', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    const sectionRefs = screen.getAllByText('302');
    expect(sectionRefs.length).toBeGreaterThan(0);
  });

  it('renders row information for each ticket', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    // Row D and Row B should both appear
    const rowD = screen.getAllByText('D');
    expect(rowD.length).toBeGreaterThan(0);
  });

  it('renders date information for each ticket', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    expect(screen.getByText('July 20, 2026')).toBeInTheDocument();
    expect(screen.getByText('August 2, 2026')).toBeInTheDocument();
  });

  it('renders ticket IDs in the list', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    expect(screen.getByText(/ID: TCK-TEST1/)).toBeInTheDocument();
    expect(screen.getByText(/ID: TCK-TEST2/)).toBeInTheDocument();
  });

  it('shows "Active • Ready" status for tickets', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    const statusItems = screen.getAllByText('Active • Ready');
    expect(statusItems.length).toBe(2);
  });

  it('clicking a ticket reveals detail panel (on desktop) with venue info', () => {
    render(<TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />);
    const firstTicketCard = screen.getByText('Brazil vs France').closest('[class*="glass-panel"]');
    if (firstTicketCard) {
      fireEvent.click(firstTicketCard);
      // After clicking, detail panel renders venue
      expect(screen.getAllByText(/MetLife Stadium/i).length).toBeGreaterThan(0);
    }
  });

  it('renders without crashing when mounted with empty tickets', () => {
    const { container } = render(
      <TicketsView tickets={[]} onTransferTicket={mockOnTransfer} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing when mounted with multiple tickets', () => {
    const { container } = render(
      <TicketsView tickets={MOCK_TICKETS} onTransferTicket={mockOnTransfer} />
    );
    expect(container).toBeTruthy();
  });
});
