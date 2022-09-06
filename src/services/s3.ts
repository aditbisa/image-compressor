/**
 * A wrapper service to help with s3 client.
 * Its assume the bucket and the directory is ready and the aws credentials have READ/WRITE access to it.
 *
 * TODO: Filtering?
 *   S3 list command only able filter by prefix, which is used for directory name.
 *   If you need more flexibility, index the files using database.
 *
 * TODO: Error handling.
 */
import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';

/**
 * Config.
 */
const S3_BUCKET = process.env.S3_BUCKET;
const DIRECTORY = process.env.S3_DIRECTORY;
const PAGE_SIZE = 5;

/**
 * S3 client instance.
 */
let client: S3Client;

/**
 * Call this before doing the work.
 */
export async function init() {
  if (!client) {
    client = new S3Client({});
  }
}

/**
 * Call this after all the work, even when its fail.
 */
export async function cleanup() {
  if (client) {
    client.destroy();
  }
}

/**
 * Return interface for `listFiles()`.
 */
export interface ListFilesOuput {
  data: {
    filename: string;
    lastModified: Date;
    fileSize: number;
  }[];
  currentPageToken: string;
  nextPageToken: string;
  itemCount: number;
  pageSize: number;
}

/**
 * List files stored in s3.
 */
export async function listFiles(pageToken?: string): Promise<ListFilesOuput> {
  if (!client) {
    throw 'S3 client not initialized';
  }
  const prefix = DIRECTORY.replace(/^\/|\/$/, '') + '/';

  const params: ListObjectsV2CommandInput = {
    Bucket: S3_BUCKET,
    MaxKeys: PAGE_SIZE,
    Prefix: prefix,
    StartAfter: prefix, // Remove '.' directory
  };
  if (pageToken) {
    params.ContinuationToken = pageToken;
  }
  // console.log('ListObjectsV2CommandInput:', params);

  let result: ListObjectsV2CommandOutput;
  try {
    result = await client.send(new ListObjectsV2Command(params));
    // console.log('ListObjectsV2Command result:', result);
  } catch (error) {
    console.error('ListObjectsV2Command error:', error);
    throw error;
  }

  const output: ListFilesOuput = {
    currentPageToken: pageToken || '',
    nextPageToken: result.NextContinuationToken || '',
    itemCount: result.KeyCount || 0,
    pageSize: result.MaxKeys || 0,
    data: (result.Contents || []).map((obj) => {
      return {
        filename: obj.Key?.substring(prefix.length) || '',
        lastModified: obj.LastModified || new Date(0),
        fileSize: obj.Size || 0,
      };
    }),
  };
  return output;
}

/**
 * Upload file to s3.
 */
export async function uploadFile(name: string, data: any) {
  if (!client) {
    throw 'S3 client not initialized';
  }
  const prefix = DIRECTORY.replace(/^\/|\/$/, '') + '/';

  const params: PutObjectCommandInput = {
    Bucket: S3_BUCKET,
    Key: prefix + name,
    Body: data,
  };
  // console.log('PutObjectCommandInput:', params);

  const result: PutObjectCommandOutput = await client.send(
    new PutObjectCommand(params)
  );
  // console.log('PutObjectCommandOutput:', result);
}

/**
 * Return interface for `downloadFile()`.
 */
export interface DownloadFileOutput {
  contentLength: number;
  contentType: string;
  content: any; // ReadableStream
}

/**
 * Download file from s3.
 */
export async function downloadFile(
  filename: string
): Promise<DownloadFileOutput> {
  if (!client) {
    throw 'S3 client not initialized';
  }
  const prefix = DIRECTORY.replace(/^\/|\/$/, '') + '/';

  const params: GetObjectCommandInput = {
    Bucket: S3_BUCKET,
    Key: prefix + filename,
  };
  // console.log('GetObjectCommandInput:', params);

  const result: GetObjectCommandOutput = await client.send(
    new GetObjectCommand(params)
  );
  // console.log('GetObjectCommandOutput:', result);

  const output: DownloadFileOutput = {
    contentLength: result.ContentLength || 0,
    contentType: result.ContentType || '',
    content: result.Body,
  };
  return output;
}
