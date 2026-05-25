import { Slot } from 'expo-router';

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

export default function ResumeLayout() {
  return (
    <ProtectedRoute>
      <Slot />
    </ProtectedRoute>
  );
}
