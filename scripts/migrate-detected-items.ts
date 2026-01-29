import { MongoClient, MongoServerError } from 'mongodb';
import { exit } from 'process';
import { v4 as uuidv4 } from 'uuid';
import { LegacyResult } from './interface/legacy-results';
import { config } from './config-loader';
import { Account } from 'src/modules/accounts/accounts.db';

// MongoDB Clients
const sourceClient = new MongoClient(config.source.uri);
const destClient = new MongoClient(config.destination.uri);

interface DetectedItem {
  _id: string;
  identifier: string;
  accountId: string;
  source: string;
  type: string;
  status: 'pending' | 'deindexed' | 'removed';
  groupId: string;
  metadata: {
    originalSearchId?: string;
    originalId?: string;
    url: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

// MongoDB Collections
const sourceCollection = sourceClient
  .db(config.source.database)
  .collection<LegacyResult>('results');

const accountCollection = destClient
  .db(config.destination.database)
  .collection<Account>('accounts');

const detectedItemsCollection = destClient
  .db(config.destination.database)
  .collection<DetectedItem>('detected_items');

// Helper Functions
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return 'unknown';
  }
}

function getStatus(
  status: 'detected' | 'deindexed' | 'removed',
): 'pending' | 'deindexed' | 'removed' {
  if (status === 'deindexed') return 'deindexed';
  if (status === 'removed') return 'removed';
  return 'pending';
}

function mapLegacyResultToDetectedItem(item: LegacyResult, accountId: string): DetectedItem {
  return {
    _id: uuidv4(),
    identifier: item.url,
    accountId: accountId,
    source: 'google',
    type: 'organic',
    status: getStatus(item.status),
    groupId: extractDomain(item.url),
    metadata: {
      originalSearchId: item.searchId,
      originalId: item._id,
      url: item.url,
    },
    createdAt: item.detectedAt,
    updatedAt: item.detectedAt,
    deleted: false,
  };
}

async function processResults(
  results: LegacyResult[],
): Promise<{ processed: DetectedItem[]; errors: string[] }> {
  const errors: string[] = [];
  const processed: DetectedItem[] = [];

  await Promise.all(
    results.map(async result => {
      try {
        const account = await accountCollection.findOne({
          allowedUsers: { $in: [result.userId] },
        });

        if (!account) {
          errors.push(`Account not found for result: ${result._id} userId: ${result.userId}`);
          return;
        }

        processed.push(mapLegacyResultToDetectedItem(result, account._id));
      } catch (err) {
        errors.push(
          `Error processing ${result._id}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }),
  );

  return { processed, errors };
}

async function main() {
  const CONCURRENT_BATCHES = 3;
  const resultsToMigrate = await sourceCollection.countDocuments({});
  const batches = Math.ceil(resultsToMigrate / config.batchSize);

  console.log(`Starting migration of ${resultsToMigrate} items in ${batches} batches`);
  console.log(`Processing ${CONCURRENT_BATCHES} batches concurrently\n`);

  let totalProcessed = 0;
  let totalErrors = 0;

  for (let i = 0; i < batches; i += CONCURRENT_BATCHES) {
    const currentBatchPromises: Promise<{ processed: DetectedItem[]; errors: string[] }>[] = [];

    // Create concurrent batch promises
    for (let j = 0; j < CONCURRENT_BATCHES && i + j < batches; j++) {
      const skip = (i + j) * config.batchSize;
      const batchPromise = sourceCollection
        .find({})
        .skip(skip)
        .limit(config.batchSize)
        .toArray()
        .then(processResults);

      currentBatchPromises.push(batchPromise);
    }

    // Process current batch group
    const batchResults = await Promise.all(currentBatchPromises);

    for (const { processed, errors } of batchResults) {
      if (processed.length > 0) {
        try {
          await detectedItemsCollection.insertMany(processed, { ordered: false });
          totalProcessed += processed.length;
        } catch (err) {
          const mongoError = err as MongoServerError;
          // If it's a duplicate key error, some documents might have been inserted
          if (mongoError.code === 11000) {
            // Count successful inserts from the result
            const bulkResult = mongoError.result as { insertedCount?: number };
            if (bulkResult?.insertedCount) {
              totalProcessed += bulkResult.insertedCount;
            }
            // Log duplicate key errors but don't count them as errors
            const writeErrors = (mongoError.writeErrors as Array<unknown>)?.length || 0;
            console.log(`Skipped ${writeErrors} duplicate entries`);
          } else {
            // For other errors, log them and count them
            console.error(`Error during batch insert: ${err}`);
            totalErrors += processed.length;
          }
        }
      }

      if (errors.length > 0) {
        errors.forEach(error => console.error(error));
        totalErrors += errors.length;
      }
    }

    const progress = Math.min(100, Math.round(((i + CONCURRENT_BATCHES) / batches) * 100));
    console.log(`Progress: ${progress}% - Processed: ${totalProcessed}, Errors: ${totalErrors}`);
  }

  console.log(`\nMigration completed:`);
  console.log(`- Total processed: ${totalProcessed}`);
  console.log(`- Total errors: ${totalErrors}`);

  await sourceClient.close();
  await destClient.close();
  exit(totalErrors > 0 ? 1 : 0);
}

void main();
