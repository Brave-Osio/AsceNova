// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import LeaderboardTable from './LeaderboardTable';
import type { LeaderboardRowData } from '../hooks/useLeaderboard';

afterEach(cleanup);

const makeRows = (count: number): LeaderboardRowData[] =>
  Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    name: `User ${i + 1}`,
    rank: 'Gold',
    xp: 1000 - i,
    streak: i,
    isCurrentUser: i === 11,
  }));

const visibleNames = () => screen.getAllByText(/^User \d+/).map((el) => el.textContent?.replace('YOU', '').trim());

describe('LeaderboardTable pagination', () => {
  it('shows at most 10 rows per page and keeps global positions across pages', () => {
    render(<LeaderboardTable rows={makeRows(25)} />);
    expect(visibleNames()).toHaveLength(10);
    expect(visibleNames()[0]).toBe('User 1');
    expect(screen.getByText(/Page 1 of 3/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(visibleNames()[0]).toBe('User 11');
    // Rank numbering continues instead of restarting at 1.
    expect(screen.getByLabelText('Position 11')).toBeTruthy();
    expect(screen.queryByLabelText('Position 1')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(visibleNames()).toHaveLength(5);
    expect(screen.getByText(/Page 3 of 3/)).toBeTruthy();
  });

  it('disables Previous on the first page and Next on the last page', () => {
    render(<LeaderboardTable rows={makeRows(25)} />);
    const prev = screen.getByRole('button', { name: /prev/i }) as HTMLButtonElement;
    const next = screen.getByRole('button', { name: /next/i }) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    fireEvent.click(next);
    fireEvent.click(next);
    expect(prev.disabled).toBe(false);
    expect(next.disabled).toBe(true);
  });

  it('renders wing decorations only for the top three positions', () => {
    const { container } = render(<LeaderboardTable rows={makeRows(10)} />);
    const rowsWithWings = Array.from(container.querySelectorAll('svg[aria-hidden="true"]')).filter((svg) =>
      svg.querySelector('linearGradient'),
    );
    // Two wings (left + right) for each of the three podium rows.
    expect(rowsWithWings).toHaveLength(6);
  });

  it('lets the rows-per-page size be changed', () => {
    render(<LeaderboardTable rows={makeRows(25)} />);
    fireEvent.change(screen.getByLabelText(/rows per page/i), { target: { value: '25' } });
    expect(visibleNames()).toHaveLength(25);
    expect(screen.getByText(/Page 1 of 1/)).toBeTruthy();
  });

  it('shows an empty state and a loading state without pagination controls', () => {
    const { rerender } = render(<LeaderboardTable rows={[]} />);
    expect(screen.getByText(/No one is on the leaderboard yet/)).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: /leaderboard pages/i })).toBeNull();
    rerender(<LeaderboardTable rows={[]} isLoading />);
    expect(within(document.body).getByLabelText('Loading leaderboard')).toBeTruthy();
  });

  it('shows a single page without enabling either control for 10 or fewer rows', () => {
    render(<LeaderboardTable rows={makeRows(10)} />);
    expect(screen.getByText(/Page 1 of 1/)).toBeTruthy();
    expect((screen.getByRole('button', { name: /next/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});
