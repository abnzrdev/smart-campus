import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import App from '@/App';
import * as provider from '@/lib/mockLLM';
import type { AdapterResult } from '@/lib/mockLLM';

function deferredExplanation() {
  let resolve!: (value: AdapterResult) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<AdapterResult>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function checkAndExplain() {
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
  fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));
}

const oldResult: AdapterResult = {
  ok: true,
  response: { explanation: 'Old room explanation.' },
  error: null,
};

afterEach(() => vi.restoreAllMocks());

describe('explanation request lifecycle with a delayed provider', () => {
  it.each(['room', 'time', 'attendees', 'equipment', 'blocked', 'new check'])('discards a stale success after changing %s', async (change) => {
    const pending = deferredExplanation();
    vi.spyOn(provider, 'mockExplain').mockReturnValueOnce(pending.promise);
    render(<App />);
    checkAndExplain();
    expect(screen.getByText('Generating mock explanation…')).toBeInTheDocument();

    if (change === 'room') {
      fireEvent.change(screen.getByRole('combobox', { name: 'Room' }), { target: { value: 'd-012' } });
    } else if (change === 'time') {
      fireEvent.click(screen.getByRole('button', { name: '10:30–11:30' }));
    } else if (change === 'attendees') {
      fireEvent.change(screen.getByLabelText('Attendees'), { target: { value: '10' } });
    } else if (change === 'equipment') {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Projector' }));
    } else if (change === 'blocked') {
      fireEvent.click(screen.getByRole('switch'));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
    await act(async () => pending.resolve(oldResult));

    expect(screen.queryByText('Old room explanation.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain availability' })).toBeInTheDocument();
    expect(screen.getByText(['room', 'time', 'attendees', 'blocked'].includes(change) ? 'Unavailable' : 'Available')).toBeInTheDocument();
  });

  it('discards a stale rejection after a new check', async () => {
    const pending = deferredExplanation();
    vi.spyOn(provider, 'mockExplain').mockReturnValueOnce(pending.promise);
    render(<App />);
    checkAndExplain();
    fireEvent.click(screen.getByRole('button', { name: '10:30–11:30' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
    await act(async () => pending.reject(new Error('Delayed provider failure')));
    expect(screen.queryByText('Unexpected error while generating explanation.')).not.toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('keeps a newer request loading when the previous request completes', async () => {
    const old = deferredExplanation();
    const current = deferredExplanation();
    vi.spyOn(provider, 'mockExplain')
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(current.promise);
    render(<App />);
    checkAndExplain();
    fireEvent.click(screen.getByRole('button', { name: '10:30–11:30' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
    const explain = screen.queryByRole('button', { name: 'Explain availability' });
    expect(explain).not.toBeNull();
    fireEvent.click(explain!);
    await act(async () => old.resolve(oldResult));
    expect(screen.getByText('Generating mock explanation…')).toBeInTheDocument();
    expect(screen.queryByText('Old room explanation.')).not.toBeInTheDocument();
    await act(async () => current.resolve({
      ok: true,
      response: { explanation: 'The current interval overlaps an existing booking.' },
      error: null,
    }));
    expect(screen.getByText('The current interval overlaps an existing booking.')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});
