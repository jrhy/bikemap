import { describe, expect, it } from 'vitest';
import {
  formatDistance,
  formatElevation,
  formatGrade,
  formatSpeed,
} from './format';

describe('metric display units', () => {
  it.each([
    [formatDistance, 1609.344, '1.6 km'],
    [formatDistance, 0, '0.0 km'],
    [formatSpeed, 5, '18.0 km/h'],
    [formatElevation, 201.9, '202 m'],
    [formatElevation, -12.6, '-13 m'],
  ])('formats %s(%s) as %s', (format, value, expected) => {
    expect(format(value)).toBe(expected);
  });
});

describe('formatGrade', () => {
  it('formats positive grades with an explicit sign', () => {
    expect(formatGrade(12.4)).toBe('+12%');
  });

  it('formats negative grades with a minus sign', () => {
    expect(formatGrade(-3.6)).toBe('-4%');
  });

  it('formats flat grades without a sign', () => {
    expect(formatGrade(0.2)).toBe('0%');
  });
});
