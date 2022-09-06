/**
 * GET "/api/images/view" endpoint.
 */
import { createRouter } from 'next-connect';
import type { NextApiRequest, NextApiResponse } from 'next';
import { init, cleanup, downloadFile, DownloadFileOutput } from '@services/s3';

/**
 * Mapping file extension with mime type.
 *
 * S3 content type return "application/octet-stream".
 * We need the actual content type for browser support.
 */
const MimeExtensionMap = {
  '.bmp': 'image/bmp',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  default: 'application/octet-stream',
};

/**
 * Api router.
 */
const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

/**
 * Process request image.
 */
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const filename = (req.query['filename'] as string) || '';

  let fileExtension = filename.substring(filename.lastIndexOf('.'));
  let fileContentType = MimeExtensionMap['default'];
  if (fileExtension in MimeExtensionMap) {
    fileContentType = MimeExtensionMap[fileExtension];
  }

  await init();
  try {
    const file: DownloadFileOutput = await downloadFile(filename);

    await new Promise(function (resolve) {
      res.setHeader('Content-Type', fileContentType);
      res.setHeader('Content-Length', file.contentLength);
      res.status(200);
      file.content.pipe(res);
      file.content.on('end', resolve);
      file.content.on('error', function (error) {
        console.error('Streaming file content error:', error);
      });
    });
  } catch (error) {
    if (error.name == 'NoSuchKey') {
      res.status(404).json({
        status: 'failed',
        error: 'File not found',
      });
    } else {
      throw error;
    }
  } finally {
    await cleanup();
  }
});

/**
 * Export the api route with fallback.
 */
export default apiRoute.handler({
  onError: (err: any, req, res) => {
    console.error('apiRoute.onError:', err.stack);
    res.status(500).json({
      status: 'error',
      error: 'Server error! Sorry 😢',
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({
      status: 'error',
      error: 'Method Not Allowed',
    });
  },
});
