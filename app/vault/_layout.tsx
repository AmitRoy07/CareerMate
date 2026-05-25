import { Slot } from 'expo-router';

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

export default function VaultLayout() {
  return (
    <ProtectedRoute>
      <Slot />
    </ProtectedRoute>
  );
}
