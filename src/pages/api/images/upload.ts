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
  { name: 'file', maxCount: 1 },
  { name: 'result', maxCount: 1 },
]);

/**
 * Process files upload.
 */
apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  return handleFileUpload(req, res, async (err) => {
    const uploadedFiles: any = req['files'];

    let file, result;
    if (
      'file' in uploadedFiles &&
      Array.isArray(uploadedFiles['file']) &&
      uploadedFiles['file'].length
    ) {
      file = uploadedFiles['file'][0];
    }
    if (
      'result' in uploadedFiles &&
      Array.isArray(uploadedFiles['result']) &&
      uploadedFiles['result'].length
    ) {
      result = uploadedFiles['result'][0];
    }

    if (!file || !result) {
      res.status(400).json({
        status: 'failed',
        error: 'No files uploaded.',
      });
    }

    const id = new Date().valueOf();
    const originalName = `${id}-A_${file.originalname}`;
    const resultName = `${id}-B_${file.originalname}`;

    await init();
    try {
      await uploadFile(originalName, file.buffer);
      await uploadFile(resultName, result.buffer);
    } finally {
      await cleanup();
    }

    res.status(200).json({
      status: 'success',
      file: {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
      },
      result: {
        fieldname: result.fieldname,
        originalname: result.originalname,
        encoding: result.encoding,
        mimetype: result.mimetype,
        size: result.size,
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
