import { Slot } from 'expo-router';

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

export default function AnalyzeLayout() {
  return (
    <ProtectedRoute>
      <Slot />
    </ProtectedRoute>
  );
}
