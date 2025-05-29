import { defaultBadges } from '../badges';

describe('badges', () => {
  it('should have unique badge ids', () => {
    const ids = defaultBadges.map(b => b.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it('should have required fields for each badge', () => {
    for (const badge of defaultBadges) {
      expect(badge.id).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.category).toBeTruthy();
      expect(badge.requirements).toBeTruthy();
    }
  });

  it('should have correct requirement types', () => {
    const validTypes = ['count', 'streak', 'profile', 'ai', 'session_type', 'duration', 'weekly'];
    for (const badge of defaultBadges) {
      expect(validTypes).toContain(badge.requirements.type);
    }
  });
});
