import { describe, expect, it } from 'vitest';

import { HeaderAnalyzer } from './header.analyzer.js';

describe('HeaderAnalyzer', () => {
  const analyzer = new HeaderAnalyzer();

  it('maps phone-related headers to phone semantic type', () => {
    const result = analyzer.analyze(['Mobile Number', 'Email Address', 'Sales Rep']);

    const phone = result.columns.find((c) => c.originalHeader === 'Mobile Number');
    const email = result.columns.find((c) => c.originalHeader === 'Email Address');
    const owner = result.columns.find((c) => c.originalHeader === 'Sales Rep');

    expect(phone?.semanticType).toBe('phone');
    expect(email?.semanticType).toBe('email');
    expect(owner?.semanticType).toBe('leadOwner');
  });

  it('detects duplicate headers', () => {
    const result = analyzer.analyze(['Email', 'email', 'Name']);
    expect(result.duplicateHeaders).toContain('email');
  });

  it('marks unknown headers', () => {
    const result = analyzer.analyze(['xyz_custom_field']);
    expect(result.unusedColumns).toContain('xyz_custom_field');
  });
});
