import { Slot } from 'expo-router';

import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

export default function ToolsLayout() {
  return (
    <ProtectedRoute>
      <Slot />
    </ProtectedRoute>
  );
}
