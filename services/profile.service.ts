import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { isSupabaseConfigured, supabase } from './supabase';

const localAvatarKey = 'careermate:local-avatar';

export async function pickProfileImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to upload a profile image.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 0.82,
  });

  if (result.canceled) return null;
  return result.assets[0];
}

export async function getLocalAvatar() {
  return AsyncStorage.getItem(localAvatarKey);
}

export async function saveProfileAvatar(userId: string | undefined, uri: string) {
  if (!isSupabaseConfigured || !userId) {
    await AsyncStorage.setItem(localAvatarKey, uri);
    return uri;
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${userId}/avatar.${extension}`;

  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  await supabase.from('users_profile').upsert({
    id: userId,
    avatar_url: data.publicUrl,
    updated_at: new Date().toISOString(),
  });

  return data.publicUrl;
}

