import { MongoClient } from 'mongodb';
import { config } from './config-loader';
import { BlacklistedDomain } from 'src/modules/google-scanner/google-blacklist.db';
import { LegacyBlacklist } from './interface/legacy-blacklist';
import { exit } from 'process';

const sourceClient = new MongoClient(
  'mongodb://mongo:FLMQsPFPhGqBJPTNlDbqElGxhTUjijYG@maglev.proxy.rlwy.net:24258/',
);
const destClient = new MongoClient(config.destination.uri);

const sourceCollection = sourceClient
  .db(config.source.database)
  .collection<LegacyBlacklist>('blacklist');
const destCollection = destClient
  .db(config.destination.database)
  .collection<BlacklistedDomain>('google_blacklist');
void main();

async function main() {
  try {
    const documents = await sourceCollection.find({}).toArray();

    const transformedDocuments = documents.map(doc => {
      let domain = doc.domain;
      try {
        if (typeof domain === 'string' && domain.startsWith('http')) {
          domain = new URL(domain).hostname;
        }
      } catch (e) {
        console.error(`Error parsing domain ${domain}: ${e}`);
      }
      return {
        _id: doc._id,
        domain,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
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
