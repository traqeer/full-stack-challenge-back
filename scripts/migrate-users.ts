import { MongoClient } from 'mongodb';
import { exit } from 'process';
import { User, UserRole, UserStatus } from 'src/modules/users/users.db';
import { legacyUser } from './interface/legacy-user';
import { config } from './config-loader';

const sourceClient = new MongoClient(config.source.uri);
const destClient = new MongoClient(config.destination.uri);

const sourceCollection = sourceClient.db(config.source.database).collection<legacyUser>('users');
const userCollection = destClient.db(config.destination.database).collection<User>('users');

void main();

async function main() {
  const users = await sourceCollection.find<legacyUser>({}).toArray();

  const usersWithoutAgency = users.filter(user => {
    return !user.isAgency;
  });

  const result = await userCollection.insertMany(
    usersWithoutAgency.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name ?? user.email.split('@')[0],
      password: user.password,
      role: user.role === 'admin' ? UserRole.ADMIN : UserRole.ACCOUNT,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.password ? UserStatus.ACTIVE : UserStatus.GOOGLE_AUTH,
      deletedAt: null,
    })),
  );

  console.log('Total Filtered Users: ', usersWithoutAgency.length);
  console.log('Inserted Users: ', result.insertedCount);

  exit(0);
}
