import { describe, it, expect } from 'vitest';
import { getDisplayName, isStale } from './dashboard-utils';

describe('getDisplayName', () => {
  it('returns empty string when user is null', () => {
    expect(getDisplayName(null)).toBe('');
  });

  it('uses full_name from Google OAuth metadata when present', () => {
    const user = { user_metadata: { full_name: 'Milan Budhathoki' } };
    expect(getDisplayName(user)).toBe('Milan');
  });

  it('derives name from email local part when no metadata exists', () => {
    const user = { email: 'milan.budhatho1@example.com' };
    expect(getDisplayName(user)).toBe('Milan');
  });

  it('returns "there" when nothing usable exists', () => {
    const user = { email: '' };
    expect(getDisplayName(user)).toBe('there');
  });
});

describe('isStale', () => {
  it('returns false if status is not "Applied"', () => {
    const app = { status: 'Interview', created_at: new Date().toISOString() };
    expect(isStale(app)).toBe(false);
  });

  it('returns false if applied less than 21 days ago', () => {
    const app = { status: 'Applied', created_at: new Date().toISOString() };
    expect(isStale(app)).toBe(false);
  });

  it('returns true if applied 21+ days ago', () => {
    const oldDate = new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString();
    const app = { status: 'Applied', created_at: oldDate };
    expect(isStale(app)).toBe(true);
  });
});