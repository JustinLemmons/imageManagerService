# Image Manager Service

A full-stack application where users can upload images, generate images via AI, and manage their collection. Image binaries are stored in AWS S3 with metadata persisted in MongoDB, served through a Spring Boot backend with an Angular frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 4, Spring WebFlux |
| Image Storage | AWS S3 (object storage) |
| Metadata Storage | MongoDB |
| AI | HuggingFace Inference API (FLUX.1-schnell) |
| Frontend | Angular 19, Bootstrap 5 |

## Architecture

```
Angular UI (localhost:4200)
        │
        ▼
Spring Boot API (localhost:8080)
    ├── Upload/Delete → AWS S3 (binary storage)
    ├── Metadata      → MongoDB (filename, size, content type, S3 key)
    └── Generate      → HuggingFace API → S3
```

When an image is retrieved, the backend returns a presigned S3 URL valid for 1 hour, so the frontend loads images directly from S3 without proxying through the backend.

## Prerequisites

- Java 21
- Maven
- Node.js & npm
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB running locally (`brew services start mongodb-community`)
- HuggingFace API token
- AWS account with an S3 bucket and an IAM user with scoped S3 permissions
- AWS CLI configured locally (`aws configure`)

## Configuration

`application.properties` is gitignored and must be created manually at:

```
backend/image-manager-service/src/main/resources/application.properties
```

Add the following keys:

```properties
spring.application.name=image-manager-service
spring.data.mongodb.uri=mongodb://localhost:27017/image_manager

huggingFace.token=
huggingFace.url=https://router.huggingface.co
huggingFace.model=black-forest-labs/FLUX.1-schnell
huggingFace.uri=/nscale/v1/images/generations

aws.region=
aws.s3.bucketName=

spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

AWS credentials are **not** stored in `application.properties`. The AWS SDK automatically resolves credentials from `~/.aws/credentials` configured via `aws configure`.

## AWS IAM Setup

Create an IAM user with a custom inline policy scoped to your S3 bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

Then run `aws configure` with the IAM user's access key to set up local credentials.

## Running the App

**Backend**
```bash
cd backend/image-manager-service
./mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
ng serve
```

Frontend runs on `http://localhost:4200`, backend on `http://localhost:8080`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload` | Upload an image (multipart/form-data) |
| GET | `/images` | Get all image IDs |
| GET | `/images/{id}` | Get presigned S3 URL for image by ID |
| DELETE | `/images/{id}` | Delete image from S3 and MongoDB |
| POST | `/generate-image` | Generate an image via HuggingFace AI |

### Generate Image Request Body
```json
{
  "prompt": "a sunset over the ocean"
}
```

## Project Structure

```
imageManagerService/
├── backend/image-manager-service/
│   └── src/main/java/.../
│       ├── config/         # CORS, MongoDB, S3, WebClient beans
│       ├── controller/     # REST endpoints
│       ├── service/        # Business logic (upload, generate)
│       ├── dao/            # S3 data access (upload, presign, delete)
│       ├── entity/         # ImageMetadata document
│       ├── repository/     # MongoDB repository
│       └── dto/            # Request/response types
└── frontend/src/app/
    ├── components/
    │   ├── upload-image/         # File picker and upload flow
    │   ├── generate-image/       # AI prompt and save flow
    │   └── confirm-delete-modal/ # Deletion confirmation
    └── services/
        └── image.service.ts      # HTTP calls to backend
```
