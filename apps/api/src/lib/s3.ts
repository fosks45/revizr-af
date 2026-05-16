/**
 * S3 client — presigned URLs, object deletion.
 *
 * Bucket: SSE-KMS CMK (eu-west-2), public-access block, no replication policy.
 * Objects are DELETED immediately after processing (ADR-0008, T-025).
 * A 24-hour S3 lifecycle rule provides belt-and-braces expiry (T-026).
 *
 * Classification: C3 — S3 keys for diagnostic uploads are encrypted at rest
 * in uploaded_documents.s3_key. Never log raw S3 keys.
 */

import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const PRESIGNED_URL_TTL_SECONDS = 15 * 60; // 15 minutes — matches OpenAPI contract

let _s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3) {
    const region = process.env['AWS_REGION'] ?? process.env['AWS_DEFAULT_REGION'];
    if (!region) {
      throw new Error('AWS_REGION or AWS_DEFAULT_REGION must be set');
    }
    _s3 = new S3Client({ region });
  }
  return _s3;
}

function getBucket(): string {
  const bucket = process.env['AWS_S3_BUCKET_DIAGNOSTIC'];
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET_DIAGNOSTIC is not set');
  }
  return bucket;
}

/**
 * Generate a presigned PUT URL for direct browser-to-S3 upload.
 * The URL expires in 15 minutes (PRESIGNED_URL_TTL_SECONDS).
 *
 * Content-type is enforced in the presigned URL to prevent polyglot uploads.
 * Allowed types: application/pdf, image/jpeg, image/png.
 *
 * Returns:
 *   - url: the presigned PUT URL to return to the client
 *   - expiresAt: ISO timestamp when the URL expires
 *   - s3Key: the object key (store encrypted in uploaded_documents.s3_key)
 */
export async function generatePresignedPutUrl(
  s3Key: string,
  contentType: 'application/pdf' | 'image/jpeg' | 'image/png'
): Promise<{ url: string; expiresAt: string }> {
  const s3 = getS3Client();
  const bucket = getBucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: contentType,
    // Server-side encryption is enforced by the bucket policy (SSE-KMS CMK)
    // — no explicit SSE headers needed here; the bucket policy rejects uploads without SSE-KMS.
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: PRESIGNED_URL_TTL_SECONDS,
  });

  const expiresAt = new Date(Date.now() + PRESIGNED_URL_TTL_SECONDS * 1000).toISOString();

  return { url, expiresAt };
}

/**
 * Fetch the raw bytes of an S3 object for processing in the diagnostic worker.
 * Returns a Buffer. The object key is decrypted from uploaded_documents.s3_key
 * before being passed to this function.
 */
export async function fetchObjectBytes(s3Key: string): Promise<Buffer> {
  const s3 = getS3Client();
  const bucket = getBucket();

  const command = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error(`S3 object body is empty for key: ${s3Key}`);
  }

  // Convert the ReadableStream to a Buffer
  const chunks: Uint8Array[] = [];
  // @ts-expect-error — Body is a readable stream in the Node.js SDK
  for await (const chunk of response.Body) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks);
}

/**
 * Delete an S3 object immediately after processing.
 * This is called by the diagnostic worker (T-025) after text extraction.
 * If deletion fails, the worker retries 3 times; after 3 failures it escalates.
 *
 * Returns true on success, throws on failure (caller handles retries).
 */
export async function deleteObject(s3Key: string): Promise<void> {
  const s3 = getS3Client();
  const bucket = getBucket();

  const command = new DeleteObjectCommand({ Bucket: bucket, Key: s3Key });
  await s3.send(command);
}

/**
 * Build a deterministic S3 key for a diagnostic upload.
 * Format: `diagnostic/{userId}/{sessionId}/{fileName}`
 * The userId and sessionId are UUID-v4 so there is no collision risk.
 */
export function buildDiagnosticS3Key(
  userId: string,
  sessionId: string,
  fileName: string
): string {
  // Sanitise the filename: strip path components, limit length
  const sanitised = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
  return `diagnostic/${userId}/${sessionId}/${sanitised}`;
}
