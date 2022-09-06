# Browser Image Compressor

This is a tool to test and compare [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression).

## Setup

1. Install dependencies

   ```
   npm install
   ```

2. Setup environment

   ```
   # File `.env` or `.env.local`
   S3_BUCKET=s3-bucket
   S3_DIRECTORY=/directory/for/images
   ```

3. Setup [AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

4. Run server

   ```
   npm run dev
   ```

5. Open [http://localhost:3000/](http://localhost:3000/) or use Postman with [postman_collection.json](./postman_collection.json).

## TODO:

### Base:

- UI:
  - Components:
    - file input ✔
    - compressor ✔
    - upload ✔
  - Page:
    - home (compress & upload) ✔
- API:
  - upload ✔
  - list ✔
  - view image ✔
  - postman ✔
- Service:
  - s3
    - list ✔
    - upload ✔
    - download ✔

### Future:

- Test
- Docker
- Database
- Drag and Drop input file
- List image
- Image comparison
