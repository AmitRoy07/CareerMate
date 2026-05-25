export type VaultDocumentKind = 'aadhaar' | 'pan' | 'resume' | 'certificate' | 'marksheet' | 'offer' | 'other';

export interface VaultDocument {
  id: string;
  name: string;
  kind: VaultDocumentKind;
  localUri: string;
  mimeType: string;
  size?: number;
  createdAt: string;
  cloudUri?: string | null;
  syncedAt?: string | null;
}

