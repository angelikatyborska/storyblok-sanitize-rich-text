import { describe, it, expect } from 'vitest';
import { greet } from '../src/index.ts';

describe('greet', () => {
  it('should return a greeting message with the provided name', () => {
    expect(greet('World')).toBe('Hello, World');
  });
});

