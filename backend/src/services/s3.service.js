import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import config from '../config/index.js';

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

async function uploadPDF(buffer, originalFilename) {
  const key = `invoices/${Date.now()}-${originalFilename.replace(/\s+/g, '_')}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: config.aws.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    },
  });

  await upload.done();
  return key;
}

async function downloadPDF(key) {
  const command = new GetObjectCommand({ Bucket: config.aws.bucketName, Key: key });
  const response = await s3.send(command);

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export { uploadPDF, downloadPDF };