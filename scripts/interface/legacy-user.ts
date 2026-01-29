import { TraqeerPlan } from 'src/modules/subscriptions/subscription.db';

export interface legacyUser {
  _id: string;
  email: string;
  name: string | undefined;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: TraqeerPlan | 'external';
  stripeCustomerId: string | undefined;
  lastLoginDate: Date;
  language: string | undefined;
  stripeSubscriptionId: string | undefined;
  subscriptionCurrentPeriodEnd: Date;
  subscriptionStatus: string;
  isAgency: boolean | undefined;
  agencyId: string | undefined;
  weeklyEmail: boolean | undefined;
}
