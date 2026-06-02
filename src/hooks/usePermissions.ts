'use client';

import { useRole } from '@/components/features/shell/RoleProvider';
import type { Permissions } from '@/types';

const MRM_PERMISSIONS: Permissions = {
  canRunTests: false,
  canApproveFrequency: true,
  canReviewFindings: true,
  canCreateFindings: true,
  canManageModels: true,
  canViewAllModels: true,
  canExportResults: true,
};

const OWNER_PERMISSIONS: Permissions = {
  canRunTests: true,
  canApproveFrequency: false,
  canReviewFindings: false,
  canCreateFindings: true,
  canManageModels: false,
  canViewAllModels: false,
  canExportResults: true,
};

export function usePermissions(): Permissions {
  const { role } = useRole();
  return role === 'mrm' ? MRM_PERMISSIONS : OWNER_PERMISSIONS;
}
