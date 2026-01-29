export interface LegacyBlacklist {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  domain: string;
  status: 'deindexed' | 'removed';
}
