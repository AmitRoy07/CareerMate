import { useAppSettings } from '@/store/appSettings';

export function useColorScheme() {
  return useAppSettings().colorScheme;
}
