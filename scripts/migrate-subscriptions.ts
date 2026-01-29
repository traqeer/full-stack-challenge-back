import { MongoClient } from 'mongodb';
import { exit } from 'process';
import {
  Subscription,
  SubscriptionProvider,
  SubscriptionStatus,
  TraqeerPlan,
} from 'src/modules/subscriptions/subscription.db';
import { v4 as uuidv4 } from 'uuid';
import { legacyUser } from './interface/legacy-user';
import Stripe from 'stripe';
import { config } from './config-loader';

const stripe = new Stripe(config.stripe.secretKey);

const sourceClient = new MongoClient(config.source.uri);
const destClient = new MongoClient(config.destination.uri);

const sourceCollection = sourceClient.db(config.source.database).collection<legacyUser>('users');
const subscriptionCollection = destClient
  .db(config.destination.database)
  .collection<Subscription>('subscriptions');

void main();

async function main() {
  const users = await sourceCollection.find<legacyUser>({}).toArray();

  await Promise.all(
    users.map(async user => {
      if (user.subscriptionPlan === 'external') {
        await handleExternalSubscription(user);
        return;
      }

      if (user.stripeSubscriptionId && user.stripeCustomerId && user.subscriptionStatus) {
        await handleStripeSubscription(user);
        return;
      }

      console.log('Imposible to handle subscription for user : ', user.email, user._id);
      return;
    }),
  );
  console.log('migrated subscriptions for ', users.length, ' users');
  exit(0);
}

async function handleExternalSubscription(user: legacyUser) {
  const subscriptionUuid = uuidv4();

  await subscriptionCollection.insertOne({
    _id: subscriptionUuid,
    plan: 'starter',
    userId: user._id,
    status: SubscriptionStatus.ACTIVE,
    provider: SubscriptionProvider.EXTERNAL,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    metadata: null,
  });
}

async function handleStripeSubscription(user: legacyUser) {
  const subscriptionUuid = uuidv4();
  try {
    if (config.stripe.shouldUpdateStripe) {
      await stripe.subscriptions.update(user.stripeSubscriptionId!, {
        metadata: {
          userId: user._id,
          databaseSubscriptionId: subscriptionUuid,
        },
      });
    }

    await subscriptionCollection.insertOne({
      _id: subscriptionUuid,
      plan: user.subscriptionPlan as TraqeerPlan,
      userId: user._id,
      status: SubscriptionStatus.ACTIVE,
      provider: SubscriptionProvider.EXTERNAL,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      metadata: {
        stripeSubscriptionId: user.stripeSubscriptionId!,
        customerId: user.stripeCustomerId!,
      },
    });
    console.log('migrated subscription for user : ', user.email, user._id);
  } catch {
    console.log('Error updating stripe subscription, database subscription not created');
  }
}
