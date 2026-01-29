export interface LegacyResult {
  _id: string;
  searchId: string;
  userId: string;
  socialAccountId: string | undefined;
  url: string;
  status: 'deindexed' | 'detected' | 'removed';
  detectedAt: Date;
}
