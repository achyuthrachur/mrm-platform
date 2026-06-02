import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the RoleProvider hook
vi.mock('@/components/features/shell/RoleProvider', () => ({
  useRole: vi.fn(),
}));

import { useRole } from '@/components/features/shell/RoleProvider';
import { usePermissions } from './usePermissions';

const mockUseRole = vi.mocked(useRole);

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('owner role', () => {
    beforeEach(() => {
      mockUseRole.mockReturnValue({ role: 'owner', setRole: vi.fn(), currentUser: 'Sarah Chen' });
    });

    it('can run tests', () => {
      const perms = usePermissions();
      expect(perms.canRunTests).toBe(true);
    });

    it('cannot approve frequency', () => {
      const perms = usePermissions();
      expect(perms.canApproveFrequency).toBe(false);
    });

    it('cannot review findings', () => {
      const perms = usePermissions();
      expect(perms.canReviewFindings).toBe(false);
    });

    it('cannot view all models', () => {
      const perms = usePermissions();
      expect(perms.canViewAllModels).toBe(false);
    });
  });

  describe('mrm role', () => {
    beforeEach(() => {
      mockUseRole.mockReturnValue({
        role: 'mrm',
        setRole: vi.fn(),
        currentUser: 'Marcus Williams',
      });
    });

    it('cannot run tests', () => {
      const perms = usePermissions();
      expect(perms.canRunTests).toBe(false);
    });

    it('can approve frequency', () => {
      const perms = usePermissions();
      expect(perms.canApproveFrequency).toBe(true);
    });

    it('can review findings', () => {
      const perms = usePermissions();
      expect(perms.canReviewFindings).toBe(true);
    });

    it('can view all models', () => {
      const perms = usePermissions();
      expect(perms.canViewAllModels).toBe(true);
    });
  });
});
