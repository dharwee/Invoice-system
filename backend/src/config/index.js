import 'dotenv/config';

export default {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  openaiApiKey: process.env.OPENAI_API_KEY,
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1',
    bucketName: process.env.S3_BUCKET_NAME,
  },
};