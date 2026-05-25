import { BriefcaseBusiness, Cloud, FileLock2, FilePlus2, LockKeyhole, Trash2, WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GlassIcon } from '@/components/ui/GlassIcon';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  deleteVaultDocument,
  importVaultDocument,
  isVaultCloudPlanActive,
  listVaultDocuments,
  setVaultCloudPlanActive,
  syncVaultDocuments,
} from '@/services/vault.service';
import { useAuth } from '@/store/userStore';
import type { VaultDocument, VaultDocumentKind } from '@/types/vault.types';

const documentKinds: { label: string; value: VaultDocumentKind }[] = [
  { label: 'Aadhaar', value: 'aadhaar' },
  { label: 'PAN', value: 'pan' },
  { label: 'Certificate', value: 'certificate' },
  { label: 'Marksheet', value: 'marksheet' },
  { label: 'Offer', value: 'offer' },
  { label: 'Other', value: 'other' },
];

export default function VaultScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [cloudPlan, setCloudPlan] = useState(false);
  const [selectedKind, setSelectedKind] = useState<VaultDocumentKind>('aadhaar');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [docs, active] = await Promise.all([listVaultDocuments(), isVaultCloudPlanActive()]);
    setDocuments(docs);
    setCloudPlan(active);
  }

  async function handleImport() {
    try {
      setBusy(true);
      await importVaultDocument(selectedKind);
      await refresh();
    } catch (error) {
      Alert.alert('Could not add document', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleCloud() {
    const next = !cloudPlan;
    await setVaultCloudPlanActive(next);
    setCloudPlan(next);
    Alert.alert(next ? 'Vault Plus enabled' : 'Vault Plus disabled', next ? 'Cloud sync is unlocked. Payment integration should be connected before release.' : 'Your vault is local-only again.');
  }

  async function handleSync() {
    try {
      setBusy(true);
      const synced = await syncVaultDocuments(user?.id);
      setDocuments(synced);
      Alert.alert('Vault synced', 'Your documents are available for cloud restore.');
    } catch (error) {
      Alert.alert('Sync unavailable', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteVaultDocument(id);
    await refresh();
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <GlassIcon icon={FileLock2} tone="blue" size={76} />
        <Text variant="label" style={{ color: colors.primary }}>Private Document Vault</Text>
        <Text variant="title">DigiLocker-style vault</Text>
        <Text variant="muted">Documents stay on this device by default. They are not uploaded unless you enable the $1/month Vault Plus cloud plan.</Text>
      </View>

      <Card style={{ backgroundColor: colors.navy, borderWidth: 0 }}>
        <View style={styles.privacyRow}>
          <LockKeyhole color={colors.onNavy} size={24} />
          <View style={styles.flex}>
            <Text variant="heading" style={{ color: colors.onNavy }}>Local-first privacy</Text>
            <Text style={{ color: colorScheme === 'dark' ? colors.muted : '#DBE1FF' }}>Offline access works because files are copied into the app’s private storage.</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text variant="heading">Add Document</Text>
        <View style={styles.chips}>
          {documentKinds.map((kind) => (
            <Pressable
              key={kind.value}
              onPress={() => setSelectedKind(kind.value)}
              style={[styles.chip, { backgroundColor: selectedKind === kind.value ? colors.primary : colors.surfaceLow, borderColor: colors.border }]}>
              <Text style={{ color: selectedKind === kind.value ? '#FFFFFF' : colors.text, fontFamily: 'PlusJakartaSans_700Bold' }}>{kind.label}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Import PDF or image" icon={FilePlus2} loading={busy} onPress={handleImport} />
      </Card>

      <Card>
        <View style={styles.planHeader}>
          <GlassIcon icon={Cloud} tone="green" size={50} />
          <View style={styles.flex}>
            <Text variant="heading">Vault Plus</Text>
            <Text variant="muted">$1/month for encrypted cloud backup and restore.</Text>
          </View>
        </View>
        <Button title={cloudPlan ? 'Disable cloud plan' : 'Enable $1/month cloud plan'} variant={cloudPlan ? 'secondary' : 'primary'} onPress={handleToggleCloud} />
        <Button title="Sync to cloud" icon={Cloud} variant="secondary" disabled={!cloudPlan || busy} loading={busy} onPress={handleSync} />
      </Card>

      <View style={styles.sectionHeader}>
        <Text variant="heading">My Documents</Text>
        <Text variant="muted">{documents.length} stored locally</Text>
      </View>

      {documents.length === 0 ? (
        <Card>
          <WifiOff color={colors.primary} size={26} />
          <Text variant="heading">No documents yet</Text>
          <Text variant="muted">Add Aadhaar, PAN, certificates, offer letters, or marksheets for quick offline access.</Text>
        </Card>
      ) : null}

      {documents.map((document) => (
        <Card key={document.id}>
          <View style={styles.documentRow}>
            <GlassIcon icon={BriefcaseBusiness} tone="cyan" size={48} />
            <View style={styles.flex}>
              <Text variant="heading" style={styles.documentTitle}>{document.name}</Text>
              <Text variant="muted">{document.kind.toUpperCase()} | {formatBytes(document.size)} | {document.syncedAt ? 'Cloud synced' : 'Local only'}</Text>
            </View>
            <Pressable onPress={() => handleDelete(document.id)}>
              <Trash2 color={colors.danger} size={22} />
            </Pressable>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

function formatBytes(size?: number) {
  if (!size) return 'Unknown size';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  documentRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  documentTitle: { fontSize: 17, lineHeight: 24 },
  flex: { flex: 1 },
  hero: { gap: 8 },
  planHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  privacyRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  sectionHeader: { gap: 2 },
});

