import { describe, it, expect } from 'vitest';
import {
  isRateLimited,
  isValidJobDescription,
  truncateJobDescription,
  parseAnalysisResponse,
  getAnalysisCacheKey,
} from './analyze-utils';

describe('isRateLimited', () => {
  it('returns false when under the limit', () => {
    expect(isRateLimited(5, 10)).toBe(false);
  });

  it('returns true when count equals the limit', () => {
    expect(isRateLimited(10, 10)).toBe(true);
  });

  it('returns true when count exceeds the limit', () => {
    expect(isRateLimited(15, 10)).toBe(true);
  });
});

describe('isValidJobDescription', () => {
  it('returns false for empty string', () => {
    expect(isValidJobDescription('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isValidJobDescription('   ')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isValidJobDescription(null)).toBe(false);
    expect(isValidJobDescription(undefined)).toBe(false);
  });

  it('returns true for real text', () => {
    expect(isValidJobDescription('Backend engineer role...')).toBe(true);
  });
});

describe('truncateJobDescription', () => {
  it('leaves short text unchanged', () => {
    expect(truncateJobDescription('short text', 100)).toBe('short text');
  });

  it('cuts text down to maxLength', () => {
    const longText = 'a'.repeat(200);
    expect(truncateJobDescription(longText, 100)).toHaveLength(100);
  });
});

describe('parseAnalysisResponse', () => {
  it('parses plain JSON', () => {
    const raw = '{"matchScore": 8}';
    expect(parseAnalysisResponse(raw)).toEqual({ matchScore: 8 });
  });

  it('strips ```json code fences before parsing', () => {
    const raw = '```json\n{"matchScore": 7}\n```';
    expect(parseAnalysisResponse(raw)).toEqual({ matchScore: 7 });
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAnalysisResponse('not json')).toThrow();
  });
});

describe('getAnalysisCacheKey', () => {
  it('returns the same key for the same inputs', () => {
    const key1 = getAnalysisCacheKey('Backend Intern', 'Acme', 'Some job description');
    const key2 = getAnalysisCacheKey('Backend Intern', 'Acme', 'Some job description');
    expect(key1).toBe(key2);
  });

  it('returns a different key when the job description changes', () => {
    const key1 = getAnalysisCacheKey('Backend Intern', 'Acme', 'Description A');
    const key2 = getAnalysisCacheKey('Backend Intern', 'Acme', 'Description B');
    expect(key1).not.toBe(key2);
  });

  it('is prefixed with ai-analysis:', () => {
    const key = getAnalysisCacheKey('Backend Intern', 'Acme', 'desc');
    expect(key.startsWith('ai-analysis:')).toBe(true);
  });
});