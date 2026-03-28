# Local Image Upload (No S3) Guide

This project now supports local image uploads with static file serving from `/uploads`.

## What Was Added

- Backend endpoint: `POST /api/upload`
- Static file serving: `GET /uploads/<filename>`
- Local storage config with secure validation and file-size limits
- Frontend demo page route: `/image-upload-demo`
- Organizer profile document upload now stored locally: `POST /api/organizer/profile/upload-document`
- Organizer application document upload now stored locally: `POST /api/organizer/upload-documents/:applicationId`
- Withdrawal supporting document upload now stored locally: `POST /api/withdrawal-requests/upload-document`

## Backend Core Implementation

### 1) Static serving from uploads folder

File: `Backend/app.js`

```js
const uploadDirName = process.env.UPLOAD_DIR || "uploads";
const uploadDirPath = path.resolve(process.cwd(), uploadDirName);

app.use(
  "/uploads",
  express.static(uploadDirPath, {
    index: false,
  }),
);
```

### 2) Upload middleware (multer disk storage)

File: `Backend/config/localUpload.js`

```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDirPath, { recursive: true });
    cb(null, uploadDirPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    cb(null, uniqueName);
  },
});
```

### 3) Upload endpoint

File: `Backend/Routes/upload.js`

```js
router.post("/upload", singleImageUploadMiddleware, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No image file uploaded. Use form-data with field name 'image'.",
    });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const imageFullUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;

  return res.status(201).json({
    message: "Image uploaded successfully",
    imageUrl,
    imageFullUrl,
    filename: req.file.filename,
  });
});
```

## Validation and Security Basics

- Allowed image types: `jpg`, `jpeg`, `png`, `gif`, `webp`
- Type checks use both MIME type and extension
- Max size: `MAX_IMAGE_SIZE_MB` (default `5`)
- Organizer document max size: `MAX_DOCUMENT_SIZE_MB` (default `10`)
- Unique filename strategy avoids collisions
- Clear error responses for invalid type, missing file, oversized file, and storage failures

## Environment Variables

In `Backend/.env`:

```env
UPLOAD_DIR=uploads
MAX_IMAGE_SIZE_MB=5
```

## Frontend Demo

- Route: `http://localhost:5173/image-upload-demo`
- File: `Frontend/src/Pages/ImageUploadDemo.jsx`
- Upload request uses `FormData` with field name `image`
- Uploaded items are rendered immediately from returned URLs

## Run Locally

### 1) Install dependencies

```bash
cd Backend
npm install
cd ../Frontend
npm install
```

### 2) Start backend

```bash
cd Backend
npm run dev
```

Server runs on `http://localhost:3001` by default.

### 3) Start frontend

```bash
cd Frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4) Test upload endpoint directly (optional)

Use Postman or curl with `multipart/form-data`:

- Method: `POST`
- URL: `http://localhost:3001/api/upload`
- Form field: `image` (file)

Expected success response:

```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/1712345678901-uuid.jpg",
  "imageFullUrl": "http://localhost:3001/uploads/1712345678901-uuid.jpg",
  "filename": "1712345678901-uuid.jpg",
  "mimetype": "image/jpeg",
  "size": 12345
}
```

## Common Error Responses

- `400`: Missing file or invalid file type
- `413`: File exceeds size limit
- `500`: Storage write failure
