import { describe, it, expect } from 'vitest';
import { askCoach } from './coachService';

describe('coachService.askCoach', () => {
  it('matches workout frequency questions', async () => {
    const response = await askCoach('Can I workout every day?');
    expect(response.toLowerCase()).toContain('recover');
  });

  it('matches protein questions', async () => {
    const response = await askCoach('How much protein should I eat?');
    expect(response.toLowerCase()).toContain('protein');
  });

  it('matches fat loss questions', async () => {
    const response = await askCoach('How do I lose fat?');
    expect(response.toLowerCase()).toContain('deficit');
  });

  it('matches muscle gain questions', async () => {
    const response = await askCoach('How do I gain muscle?');
    expect(response.toLowerCase()).toContain('surplus');
  });

  it('is case-insensitive when matching keywords', async () => {
    const response = await askCoach('HOW MUCH PROTEIN SHOULD I EAT');
    expect(response.toLowerCase()).toContain('protein');
  });

  it('falls back to a generic response for unmatched questions', async () => {
    const response = await askCoach('What is the meaning of life?');
    expect(response).toContain('Great question');
  });
});
