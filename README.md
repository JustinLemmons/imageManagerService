# Image Manager Service

A full-stack application for uploading, managing, and AI-generating images. Images are stored in MongoDB and served through a Spring Boot backend, with an Angular frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 4, Spring WebFlux |
| Database | MongoDB |
| AI | HuggingFace Inference API |
| Frontend | Angular 19, Bootstrap 5 |

## Prerequisites

- Java 21
- Maven
- Node.js & npm
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB running locally
- HuggingFace API token

## Configuration

`application.properties` is gitignored and must be created manually at:

```
backend/image-manager-service/src/main/resources/application.properties
```

Add the following keys:

```properties
spring.data.mongodb.uri=

huggingFace.token=
huggingFace.model=
huggingFace.url=
huggingFace.uri=
```

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

The frontend runs on `http://localhost:4200` and the backend on `http://localhost:8080`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload` | Upload an image |
| GET | `/images` | Get all image IDs |
| GET | `/images/{id}` | Get image by ID |
| DELETE | `/images/{id}` | Delete image by ID |
| POST | `/generate-image` | Generate an image via HuggingFace AI |

### Generate Image Request Body
```json
{
  "prompt": "a sunset over the ocean"
}
```

## Planned

- **AWS S3 integration** — migrate binary image storage from MongoDB to S3, with image metadata (filename, size, content type, S3 key) remaining in MongoDB