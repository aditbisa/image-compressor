/**
 * GET "/api/images/list" endpoint.
 *
 * TODO: index files with database to open feature:
 * - Store file in s3 using uuid to prevent overriding.
 * - Link between original file and the result file.
 */
import { createRouter } from 'next-connect';
import type { NextApiRequest, NextApiResponse } from 'next';
import { init, cleanup, ListFilesOuput, listFiles } from '@services/s3';

/**
 * Api router.
 */
const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

/**
 * Response json interface.
 */
interface ListResponse {
  status: string;
  error?: any;
  data?: ListFilesOuput;
}

/**
 * Process request list.
 */
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const pageToken = (req.query['page'] as string) || '';
  let files: ListFilesOuput;

  await init();
  try {
    files = await listFiles(pageToken);
  } finally {
    await cleanup();
  }

  const result: ListResponse = {
    status: 'success',
    data: files,
  };
  res.status(200).json(result);
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
