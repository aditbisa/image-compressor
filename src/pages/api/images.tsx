import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { createRouter } from "next-connect";
import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: file size limit, image only filter, and security.
// TODO: this api give warning "API resolved without sending a response for /api/images, this may result in stalled requests."

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
  { name: "file", maxCount: 1 },
  { name: "result", maxCount: 1 },
]);

/**
 * POST /api/images
 * Process files upload.
 */
apiRoute.post((req: NextApiRequest, res: NextApiResponse) => {
  return handleFileUpload(req, res, (err) => {
    const file = req["files"]["file"][0];
    const result = req["files"]["result"][0];

    res.status(200).json({
      status: "success",
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
    console.error(err.stack);
    res.status(500).end({ error: "Server error! Sorry 😢" });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: "Method Not Allowed" });
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
