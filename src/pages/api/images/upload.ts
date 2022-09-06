/**
 * POST "/api/images/upload" endpoint.
 *
 * TODO: file size limit, image only filter, and security.
 * TODO: remove warning "API resolved without sending a response for /api/images, this may result in stalled requests."
 */
import { createRouter } from 'next-connect';
import multer from 'multer';
import type { NextApiRequest, NextApiResponse } from 'next';
import { init, cleanup, uploadFile } from '@services/s3';

/**
 * Api router.
 */
const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

/**
 * Form multipart handler.
 */
const handleFileUpload = multer({
  storage: multer.memoryStorage(),
}).fields([
  { name: 'original', maxCount: 1 },
  { name: 'resized', maxCount: 1 },
]);

/**
 * Process files upload.
 */
apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  return handleFileUpload(req, res, async (err) => {
    const uploadedFiles: any = req['files'];

    let originalFile, resizedFile;
    if (
      'original' in uploadedFiles &&
      Array.isArray(uploadedFiles['original']) &&
      uploadedFiles['original'].length
    ) {
      originalFile = uploadedFiles['original'][0];
    }
    if (
      'resized' in uploadedFiles &&
      Array.isArray(uploadedFiles['resized']) &&
      uploadedFiles['resized'].length
    ) {
      resizedFile = uploadedFiles['resized'][0];
    }

    if (!originalFile || !resizedFile) {
      res.status(400).json({
        status: 'failed',
        error: 'No files uploaded.',
      });
    }

    const id = new Date().valueOf();
    const originalFilename = originalFile.originalname;
    const originalS3Name = `${id}-A_${originalFilename}`;
    const resizedS3Name = `${id}-B_${originalFilename}`;

    await init();
    try {
      await uploadFile(originalS3Name, originalFile.buffer);
      await uploadFile(resizedS3Name, resizedFile.buffer);
    } finally {
      await cleanup();
    }

    res.status(200).json({
      status: 'success',
      data: {
        filename: originalFilename,
        original: {
          s3Name: originalS3Name,
          mimeType: originalFile.mimetype,
          size: originalFile.size,
        },
        resized: {
          s3Name: resizedS3Name,
          mimeType: resizedFile.mimetype,
          size: resizedFile.size,
        },
      },
    });
  });
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

/**
 * API config.
 */
export const config = {
  api: {
    bodyParser: false, // Prevent NextJs parsing, let body as stream.
  },
};
