import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

import { isSupabaseConfigured, supabase } from './supabase';
import type { VaultDocument, VaultDocumentKind } from '@/types/vault.types';

const vaultKey = 'careermate:vault-documents';
const premiumKey = 'careermate:vault-cloud-plan';

export async function listVaultDocuments() {
  const raw = await AsyncStorage.getItem(vaultKey);
  return raw ? (JSON.parse(raw) as VaultDocument[]) : [];
}

export async function isVaultCloudPlanActive() {
  return (await AsyncStorage.getItem(premiumKey)) === 'active';
}

export async function setVaultCloudPlanActive(active: boolean) {
  await AsyncStorage.setItem(premiumKey, active ? 'active' : 'inactive');
}

export async function importVaultDocument(kind: VaultDocumentKind) {
  const picked = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['application/pdf', 'image/*'],
  });

  if (picked.canceled) return null;

  const asset = picked.assets[0];
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const safeName = asset.name.replace(/[^\w.\- ]+/g, '_');
  const localUri = await copyToPrivateVault(asset.uri, `${id}-${safeName}`);

  const document: VaultDocument = {
    id,
    name: asset.name,
    kind,
    localUri,
    mimeType: asset.mimeType ?? 'application/octet-stream',
    size: asset.size,
    createdAt: new Date().toISOString(),
    cloudUri: null,
    syncedAt: null,
  };

  const documents = [document, ...(await listVaultDocuments())];
  await persist(documents);
  return document;
}

export async function deleteVaultDocument(id: string) {
  const documents = await listVaultDocuments();
  const target = documents.find((item) => item.id === id);
  if (target?.localUri) {
    await deletePrivateVaultFile(target.localUri);
  }
  await persist(documents.filter((item) => item.id !== id));
}

export async function syncVaultDocuments(userId: string | undefined) {
  if (!userId) throw new Error('Login is required for cloud sync.');
  if (!(await isVaultCloudPlanActive())) {
    throw new Error('Cloud sync requires the $1/month Vault Plus plan.');
  }
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Local vault still works offline.');
  }

  const documents = await listVaultDocuments();
  const synced: VaultDocument[] = [];

  for (const document of documents) {
    const file = await fetch(document.localUri);
    const blob = await file.blob();
    const path = `${userId}/${document.id}-${document.name}`;
    const { error } = await supabase.storage.from('vault-documents').upload(path, blob, {
      contentType: document.mimeType,
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from('vault-documents').getPublicUrl(path);
    const next = {
      ...document,
      cloudUri: data.publicUrl,
      syncedAt: new Date().toISOString(),
    };
    synced.push(next);

    await supabase.from('vault_documents').upsert({
      id: document.id,
      user_id: userId,
      name: document.name,
      kind: document.kind,
      mime_type: document.mimeType,
      size: document.size ?? null,
      cloud_uri: data.publicUrl,
      synced_at: next.syncedAt,
      created_at: document.createdAt,
    });
  }

  await persist(synced);
  return synced;
}

function persist(documents: VaultDocument[]) {
  return AsyncStorage.setItem(vaultKey, JSON.stringify(documents));
}

async function copyToPrivateVault(sourceUri: string, fileName: string) {
  if (Platform.OS === 'web') {
    return sourceUri;
  }

  const { Directory, File, Paths } = await import('expo-file-system');
  const vaultDir = new Directory(Paths.document, 'careermate-vault');
  if (!vaultDir.exists) {
    vaultDir.create({ intermediates: true, idempotent: true });
  }
  const localFile = new File(vaultDir, fileName);
  await new File(sourceUri).copy(localFile, { overwrite: true });
  return localFile.uri;
}

async function deletePrivateVaultFile(uri: string) {
  if (Platform.OS === 'web') return;

  const { File } = await import('expo-file-system');
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}
