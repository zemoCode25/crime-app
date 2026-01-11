import { BigQuery } from '@google-cloud/bigquery';

// Validate required environment variables
if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
  throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set');
}
if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
  throw new Error('GOOGLE_CLOUD_PRIVATE_KEY is not set');
}
if (!process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
  throw new Error('GOOGLE_CLOUD_CLIENT_EMAIL is not set');
}

const credentials = {
  project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
  private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
};

export const bigquery = new BigQuery({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

export const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET || 'crime_analytics');