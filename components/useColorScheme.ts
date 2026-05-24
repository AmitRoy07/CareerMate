import { useAppSettings } from '@/store/appSettings';

export const useColorScheme = () => {
  const { colorScheme } = useAppSettings();
  return colorScheme;
};
