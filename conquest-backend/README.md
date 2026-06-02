cc
REST API for the Conquest app — tracks personal achievements, groups, and tags.

## Tech Stack

- **Java 21** + **Spring Boot 3.5**
- **PostgreSQL 16** — persistent storage
- **Flyway** — versioned schema migrations
- **Keycloak 26** — identity provider (OAuth2/OIDC)
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

## Auth Flow

Keycloak acts as the identity provider. The API is a stateless OAuth2 resource server — it validates JWTs using the Keycloak realm's issuer URI (no key files needed).

On every authenticated request, `UserRequestFilter` extracts the `sub` (Keycloak user ID), `name`, and `email` claims from the token and calls `userService.getOrCreateUser(...)` to keep a local user record in sync.

**Public routes** (no token required):
- `POST /v1/auth/sign-in`
- `/public/**`
- `/swagger-ui/**`, `/v3/api-docs/**`

All other routes require a valid Bearer token.

## API

| Controller              | Base path         | Responsibility            |
|-------------------------|-------------------|---------------------------|
| `AchievementController` | `/v1/achievements` | CRUD for achievements     |
| `GroupController`       | `/v1/groups`       | CRUD for groups           |
| `TagController`         | `/v1/tags`         | CRUD for tags             |

Full request/response schemas are available in the Swagger UI.

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
