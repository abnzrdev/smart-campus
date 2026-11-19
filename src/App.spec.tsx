import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('App (smoke)', () => {
  it('renders the room name and simulated current time', () => {
    render(<App />);
    expect(screen.getByText('Study Room A-101')).toBeInTheDocument();
    expect(screen.getByText(/Simulated current time:/)).toHaveTextContent('09:00');
  });

  it('shows the default existing booking 10:00–11:00', () => {
    render(<App />);
    expect(screen.getByText(/10:00 – 11:00/)).toBeInTheDocument();
  });

  it('reports Available for the touching 11:00–12:00 slot', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Available')).toBeInTheDocument();
  });

  it('reports Unavailable for the overlapping 10:30–11:30 slot', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '10:30–11:30' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
  });

  it('does not show a negative duration for reversed quick input', async () => {
    const user = userEvent.setup();
    render(<App />);
    // Set a reversed interval via selects/inputs: start 12:00, end 11:00
    await user.selectOptions(screen.getByLabelText('Start hour'), '12');
    await user.selectOptions(screen.getByLabelText('End hour'), '11');
    const intervalText = screen.getByText(/Requested interval/).textContent;
    expect(intervalText).toContain('invalid');
    expect(intervalText).not.toContain('-60');
  });

  it('F1: lists only rooms that seat the requested attendees', async () => {
    const user = userEvent.setup();
    render(<App />);
    const attendees = screen.getByLabelText('Attendees');
    await user.clear(attendees);
    await user.type(attendees, '10');
    const roomSelect = screen.getByRole('combobox', { name: 'Room' });
    const options = within(roomSelect).getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining('Seminar Room B-204'),
      expect.stringContaining('Media Lab D-012'),
      expect.stringContaining('Boardroom E-105'),
    ]);
  });

  it('F2: shows only rooms containing every selected equipment item', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('checkbox', { name: 'Projector' }));
    await user.click(screen.getByRole('checkbox', { name: 'Video conferencing' }));
    const roomSelect = screen.getByRole('combobox', { name: 'Room' });
    const options = within(roomSelect).getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Seminar Room B-204');
    expect(options[1]).toHaveTextContent('Boardroom E-105');
  });

  it('F4: shows an empty state when no room matches', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('checkbox', { name: 'Whiteboard' }));
    await user.click(screen.getByRole('checkbox', { name: 'TV screen' }));
    expect(screen.getByText('No rooms match these requirements.')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Room' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check availability' })).not.toBeInTheDocument();
  });

  it("F5 and isolation: switching rooms shows that room's own bookings and blocked status", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText(/10:00 – 11:00/)).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Room' }), 'd-012');
    expect(screen.getByRole('heading', { name: 'Media Lab D-012' })).toBeInTheDocument();
    expect(screen.getByText(/12:00 – 13:00/)).toBeInTheDocument();
    expect(screen.queryByText(/10:00 – 11:00/)).not.toBeInTheDocument();
    expect(screen.getByText('Blocked', { selector: 'span' })).toBeInTheDocument();
  });

  it('F5: clears a previous availability result when the room changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Available')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Room' }), 'e-105');
    expect(screen.queryByText('Available')).not.toBeInTheDocument();
  });

  it('F3: a blocked room is reported as unavailable with a room-specific message', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Room' }), 'd-012');
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText('Media Lab D-012 is currently marked as blocked. No availability checks pass while blocked.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Available')).not.toBeInTheDocument();
  });

  it('lets the user clear a minute field, shows a hint, and recovers when a valid value is typed', async () => {
    const user = userEvent.setup();
    render(<App />);
    const startMinute = screen.getByLabelText('Start minute');
    await user.clear(startMinute);
    expect(startMinute).toHaveValue(null);
    expect(screen.getByText('Minutes must be whole numbers from 00 to 59.')).toBeInTheDocument();
    await user.type(startMinute, '30');
    expect(startMinute).toHaveValue(30);
    expect(screen.getByText(/Requested interval: 11:30 – 12:00/)).toBeInTheDocument();
  });

  it('pads a single-digit minute when the field loses focus', async () => {
    const user = userEvent.setup();
    render(<App />);
    const endMinute = screen.getByLabelText('End minute');
    await user.clear(endMinute);
    await user.type(endMinute, '5');
    await user.tab();
    expect(endMinute).toHaveValue(5);
    expect(screen.getByText(/Requested interval: 11:00 – 12:05/)).toBeInTheDocument();
  });

  it('rejects a blank minute through the rule check instead of silently using 00', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByLabelText('End minute'));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText('End time must be a whole number of minutes (integer).')
    ).toBeInTheDocument();
  });

  it('shows an Explain button after a result and displays a mock explanation when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Available')).toBeInTheDocument();
    const explainBtn = screen.getByRole('button', { name: 'Explain availability' });
    expect(explainBtn).toBeInTheDocument();
    await user.click(explainBtn);
    expect(await screen.findByText('Mock AI explanation')).toBeInTheDocument();
    expect(screen.getByText(/free from/)).toBeInTheDocument();
  });

  it('does not change the availability status when an explanation is shown', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Available')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText('Mock AI explanation')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('shows an explanation for an overlap result', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '10:30–11:30' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText('Mock AI explanation')).toBeInTheDocument();
    const explainPanel = screen.getByLabelText('Mock AI explanation');
    expect(explainPanel).toHaveTextContent('overlaps an existing booking');
  });

  it('shows an explanation for a blocked room', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Room' }), 'd-012');
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText('Mock AI explanation')).toBeInTheDocument();
    expect(screen.getByText(/is blocked and cannot be booked/)).toBeInTheDocument();
  });

  it('clears the explanation when a new check is run', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    await user.click(await screen.findByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText('Mock AI explanation')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '10:30–11:30' }));
    await user.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(screen.queryByText('Mock AI explanation')).not.toBeInTheDocument();
  });
});
