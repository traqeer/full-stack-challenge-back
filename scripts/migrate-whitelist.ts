import { MongoClient } from 'mongodb';
import { exit } from 'process';
import { config } from './config-loader';
import { WhitelistedDomain } from 'src/modules/google-scanner/google-whitelist.db';
import { WhitelistLegacy } from './interface/legacy-whitelist';

const sourceClient = new MongoClient(config.source.uri);
const destClient = new MongoClient(config.destination.uri);

const sourceCollection = sourceClient
  .db(config.source.database)
  .collection<WhitelistLegacy>('whitelisted_domains');
const destCollection = destClient
  .db(config.destination.database)
  .collection<WhitelistedDomain>('google_whitelist');

void main();

async function main() {
  try {
    const now = new Date();
    const total = await sourceCollection.countDocuments({});

    console.log(`Found ${total} domains to migrate`);

    await destCollection.deleteMany({});

    const documents = await sourceCollection.find({}).toArray();

    const transformedDocuments = documents.map(doc => {
      let domain = doc.domain;
      try {
        // Si es una URL, extrae el hostname
        if (typeof domain === 'string' && domain.startsWith('http')) {
          domain = new URL(domain).hostname;
        }
      } catch {
        // Si falla, deja el valor original
      }
      return {
        _id: doc._id,
        domain,
        reason: doc.description || 'Migrated from preview',
        createdAt: now,
        updatedAt: now,
      };
    });

    await destCollection.insertMany(transformedDocuments, { ordered: false });

    console.log(`Done! Migrated ${transformedDocuments.length} domains`);
  } finally {
    await sourceClient.close();
    await destClient.close();
  }

  exit(0);
}
