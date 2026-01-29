import { MongoClient } from 'mongodb';
import { exit } from 'process';
import { Account } from 'src/modules/accounts/accounts.db';
import { legacyUser } from './interface/legacy-user';
import { v4 as uuidv4 } from 'uuid';
import { SearchLegacy } from 'scripts/interface/searches';
import { TraqeerAccountPlan } from 'src/modules/subscriptions/subscription.db';
import { config } from './config-loader';
import { Routine, RoutineStatus, RoutineType } from 'src/modules/routines/routines.db';

const sourceClient = new MongoClient(config.source.uri);
const destClient = new MongoClient(config.destination.uri);

const sourceCollection = sourceClient.db(config.source.database).collection<legacyUser>('users');
const searchesCollection = sourceClient
  .db(config.source.database)
  .collection<SearchLegacy>('searches');

const accountCollection = destClient
  .db(config.destination.database)
  .collection<Account>('accounts');

const routineCollection = destClient
  .db(config.destination.database)
  .collection<Routine>('routines');

void main();

async function main() {
  const users = await sourceCollection.find<legacyUser>({}).toArray();

  const accountUsers = users.filter(user => {
    if (user.isAgency || user.role === 'admin') {
      return false;
    }
    return true;
  });

  const accountsToInsert = await Promise.all(
    accountUsers.map(async (user): Promise<Account> => {
      const accountId = uuidv4();
      const searches = await searchesCollection.find<SearchLegacy>({ userId: user._id }).toArray();
      return {
        _id: accountId,
        name: user.name ?? user.email.split('@')[0],
        plan:
          user.subscriptionPlan === 'external'
            ? 'starter'
            : (user.subscriptionPlan as TraqeerAccountPlan),
        allowedUsers: user.agencyId ? [user._id, user.agencyId] : [user._id],
        settings: {
          notifications: {
            weeklyEmail: user.weeklyEmail ?? false,
          },
          usernames: mapUsernames(searches),
          socialAccounts: [],
          language: mapLanguage(user.language),
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }),
  );

  const routines = accountsToInsert.map((account: Account): Routine => {
    return {
      _id: uuidv4(),
      accountId: account._id,
      lastRunAt: null,
      type: RoutineType.GOOGLE,
      status: RoutineStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const result = await accountCollection.insertMany(accountsToInsert);
  const routineResult = await routineCollection.insertMany(routines);

  console.log('Total Filtered Users: ', accountUsers.length);
  console.log('Inserted Accounts: ', result.insertedCount);
  console.log('Inserted Routines: ', routineResult.insertedCount);

  exit(0);
}

function mapLanguage(language: string | undefined) {
  switch (language) {
    case 'en':
      return 'en';
    case 'pt':
      return 'pt';
    default:
      return 'es';
  }
}

function mapUsernames(searches: SearchLegacy[]): string[] {
  return searches.map(search => search.term);
}
