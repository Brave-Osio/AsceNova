import { describe, expect, it } from 'vitest';
import { PRIVACY_CONTACT_EMAIL, TERMS_SECTIONS } from './terms';

const allText = JSON.stringify(TERMS_SECTIONS);

describe('terms content', () => {
  it('has sections A to J in order', () => {
    expect(TERMS_SECTIONS.map((s) => s.heading.slice(0, 2))).toEqual(['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.']);
  });

  it('contains no em dashes', () => {
    expect(allText).not.toContain('\u2014');
  });

  it('does not invent a contact when none is configured', () => {
    expect(PRIVACY_CONTACT_EMAIL).toBeUndefined();
    expect(allText).toContain('No privacy contact has been configured');
    expect(allText).not.toMatch(/[\w.-]+@[\w.-]+\.\w+/);
  });

  it('flags retention, security and acceptance gaps instead of claiming them', () => {
    const gapTitles = TERMS_SECTIONS.flatMap((s) => s.blocks).filter((b) => b.kind === 'gap');
    expect(gapTitles.length).toBeGreaterThanOrEqual(3);
    expect(allText).toContain('no self-service');
    expect(allText).toContain('not certified');
  });
});
