cc
REST API for the Conquest app — tracks personal achievements, groups, and tags.

## Tech Stack

- **Java 21** + **Spring Boot 3.5**
- **PostgreSQL 16** — persistent storage
- **Flyway** — versioned schema migrations
- **Keycloak 26** — identity provider (OAuth2/OIDC)
- **Cloudflare R2** — object storage for images and PDFs (S3-compatible)
- **AWS SDK v2** — S3 client used to interact with R2
- **Springdoc OpenAPI** — auto-generated API docs
- **Lombok** — boilerplate reduction

## Services & Ports

| Service    | Port   |
|------------|--------|
| API        | `8081` |
| Keycloak   | `8080` |
| PostgreSQL | `5432` |

## Getting Started

**Prerequisites:** Docker, Java 21, Maven wrapper (`./mvnw`)

```bash
# 1. Start PostgreSQL and Keycloak
docker compose up -d

# 2. Run the API
./mvnw spring-boot:run
```

API docs: `http://localhost:8081/swagger-ui.html`

## Environment Variables

All variables have defaults for local development.

| Variable             | Default                                          | Purpose                        |
|----------------------|--------------------------------------------------|--------------------------------|
| `DB_URL`             | `jdbc:postgresql://localhost:5432/conquest_db`   | Database connection URL        |
| `DB_USERNAME`        | `conquest_dev`                                   | Database user                  |
| `DB_PASSWORD`        | `1234`                                           | Database password              |
| `KEYCLOAK_URI`       | `http://localhost:8080/realms/conquest_realm`    | Keycloak realm issuer URI      |
| `FRONTEND_URL`       | `http://localhost:5173`                          | Allowed CORS origin            |
| `INCLUDE_ERROR_DETAILS` | `false`                                       | Include stack traces in errors |
| `JPA_SHOW_SQL`       | `true`                                           | Log SQL queries                |
| `USERNAME_KEYCLOAK`  | `admin`                                          | Keycloak bootstrap admin user  |
| `PASSWORD_KEYCLOAK`  | `admin`                                          | Keycloak bootstrap admin pass  |
| `R2_ACCOUNT_ID`      | *(required)*                                     | Cloudflare account ID          |
| `R2_ACCESS_KEY`      | *(required)*                                     | R2 API access key              |
| `R2_SECRET_KEY`      | *(required)*                                     | R2 API secret key              |
| `R2_BUCKET_IMAGES`   | *(required)*                                     | R2 bucket name for images      |
| `R2_BUCKET_PDFS`     | *(required)*                                     | R2 bucket name for PDFs        |
| `R2_PUBLIC_URL_IMAGES` | *(required)*                                   | Public base URL for image bucket |
| `R2_PUBLIC_URL_PDFS` | *(required)*                                     | Public base URL for PDF bucket |

## Auth Flow

Keycloak acts as the identity provider. The API is a stateless OAuth2 resource server — it validates JWTs using the Keycloak realm's issuer URI (no key files needed).

On every authenticated request, `UserRequestFilter` extracts the `sub` (Keycloak user ID), `name`, and `email` claims from the token and calls `userService.getOrCreateUser(...)` to keep a local user record in sync.

**Public routes** (no token required):
- `POST /v1/auth/sign-in`
- `/public/**`
- `/swagger-ui/**`, `/v3/api-docs/**`

All other routes require a valid Bearer token.

## API

| Controller              | Base path          | Responsibility            |
|-------------------------|--------------------|---------------------------|
| `AchievementController` | `/v1/achievements` | CRUD for achievements     |
| `GroupController`       | `/v1/groups`       | CRUD for groups           |
| `TagController`         | `/v1/tags`         | CRUD for tags             |
| `StorageController`     | `/storage`         | Presigned upload URLs     |

Full request/response schemas are available in the Swagger UI.

## Storage (Cloudflare R2)

File uploads are handled via **presigned PUT URLs** — the client uploads directly to R2, the API never proxies the file bytes.

Two separate buckets are used:

| Bucket | Purpose |
|--------|---------|
| `R2_BUCKET_IMAGES` | User-uploaded images (e.g. achievement evidence photos) |
| `R2_BUCKET_PDFS`   | User-uploaded PDF documents |

**Upload flow:**

1. Client calls `GET /storage/image/presigned-url?fileName=...&type=...` (or `/pdf/presigned-url`).
2. API returns a `uploadUrl` (signed, valid for 5 minutes) and a `publicUrl` (permanent URL after upload).
3. Client PUTs the file directly to R2 using `uploadUrl`.
4. Client saves `publicUrl` when creating the related resource.

Object keys follow the pattern `{type}/{userId}/{timestamp}-{fileName}`.

R2 is configured in the `r2` Spring profile (`application-r2.yml`) and is always active via `spring.profiles.include: r2`. Credentials are injected through `R2Properties` (`prefix: r2`) — no defaults are provided, so all seven `R2_*` variables must be set in production.

## Database

Schema is managed exclusively via Flyway migrations in `src/main/resources/db/migration/`. Hibernate is set to `validate` — it will never auto-create or alter tables.

| Migration | Description               |
|-----------|---------------------------|
| `V1__`    | Creates the `users` table |
| `V2__`    | Creates achievement tables |

## Security Headers

Every response includes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Common Commands

```bash
./mvnw package -DskipTests   # Build JAR
./mvnw test                  # Run all tests
./mvnw compile               # Compile only
```
