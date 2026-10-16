// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ChallengePicker from './ChallengePicker';
import { describeObjective } from '../challengeInfo';
import type { ChallengeTemplate } from '../../../types/challenge.types';

afterEach(cleanup);

const CATALOG: ChallengeTemplate[] = [
  { id: 'a', title: 'Iron Week', description: 'Train hard.', icon: 'X', metric: 'WORKOUTS_COMPLETED', targetValue: 5, periodDays: 7, xpReward: 150 },
  { id: 'b', title: 'Hydrate', description: 'Drink water.', icon: 'Y', metric: 'WATER_GOAL_HITS', targetValue: 1, periodDays: 7, xpReward: 0 },
];

function Harness() {
  const [value, setValue] = useState('a');
  return <ChallengePicker label="Challenge" catalog={CATALOG} value={value} onChange={setValue} />;
}

describe('describeObjective', () => {
  it('derives criteria from the template metric and target only', () => {
    expect(describeObjective(CATALOG[0])).toBe('Complete 5 workouts');
    expect(describeObjective(CATALOG[1])).toBe('Hit your water goal on 1 day');
  });
});

describe('ChallengePicker', () => {
  it('always shows the selected challenge details (touch-friendly) with real data', () => {
    render(<Harness />);
    expect(screen.getByText('Selected challenge')).toBeTruthy();
    expect(screen.getByText('Train hard.')).toBeTruthy();
    expect(screen.getByText(/\+150 XP/)).toBeTruthy();
  });

  it('omits the reward row when the template has no XP reward, and updates on tap', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /Hydrate/ }));
    expect(screen.getByText('Drink water.')).toBeTruthy();
    expect(screen.queryByText(/XP when you complete/)).toBeNull();
  });

  it('opens a hover preview for another challenge and closes it on leave', () => {
    render(<Harness />);
    const hydrate = screen.getByRole('button', { name: /Hydrate/ });
    fireEvent.pointerEnter(hydrate, { pointerType: 'mouse' });
    expect(screen.getByRole('tooltip').textContent).toContain('Drink water.');
    fireEvent.pointerLeave(hydrate);
    // AnimatePresence keeps the node briefly while it fades out; the trigger no longer references it.
    expect(hydrate.getAttribute('aria-describedby')).toBeNull();
  });

  it('ignores touch pointers for the hover popover', () => {
    render(<Harness />);
    fireEvent.pointerEnter(screen.getByRole('button', { name: /Hydrate/ }), { pointerType: 'touch' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
