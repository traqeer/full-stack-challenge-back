export interface Config {
  source: {
    uri: string;
    database: string;
  };
  destination: {
    uri: string;
    database: string;
  };
  stripe: {
    secretKey: string;
    shouldUpdateStripe: boolean;
  };
  batchSize: number;
}
