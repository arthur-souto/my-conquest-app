# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the database (required before running the app)
docker compose up -d

# Run the application
./mvnw spring-boot:run

# Build (skip tests)
./mvnw package -DskipTests

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=ConquestBackendApplicationTests

# Compile only
./mvnw compile
```

API docs are available at `http://localhost:8080/swagger-ui.html` when the app is running.

## Architecture

Spring Boot 3.5 / Java 21 REST API with stateless JWT authentication.

**Package structure** (`com.my_conquest.conquest_backend`):
- `entity/` — JPA entities (`User`, `Permission`)
- `repository/` — Spring Data JPA repositories
- `service/` — Business logic (`AuthService`, `TokenService`)
- `dtos/` — Request/response records (`LoginRequest`, `LoginResponse`)
- `config/` — Spring configuration (`SecurityConfig`, `CorsConfig`)

**Database**: PostgreSQL via Docker (`docker-compose.yml`). Schema is managed by Flyway migrations in `src/main/resources/db/migration/`. Hibernate is set to `validate` (never auto-DDL) — all schema changes must go through versioned SQL migration files.

**Auth flow**: RSA key-pair JWT (keys in `certs/`). `TokenService` issues 24-hour tokens signed with the private key (`certs/private_pkcs8.pem`). `SecurityConfig` validates tokens using the public key (`certs/public.pem`) and extracts roles from the `roles` claim with `ROLE_` prefix. Method-level security is enabled via `@EnableMethodSecurity`. Public routes: `POST /v1/auth/sign-in` and `/public/**`.

**Authorization model**: Permissions are stored per-user in the `permissions` table (one row per role). The `roles` JWT claim is a list of permission names (e.g., `["ADMIN", "USER"]`). The initial admin user is seeded by `V3__insert_admin_user.sql`.

**CORS**: Hardcoded allowed origins in `CorsConfig` (`http://localhost:3000`, `https://seudominio.com`). The frontend URL env var (`FRONTEND_URL`) is referenced in `application.yaml` but not yet wired into `CorsConfig`.

**Environment variables** (all have defaults for local dev):
| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/conquest_db` | Database connection |
| `DB_USERNAME` | `conquest_dev` | DB user |
| `DB_PASSWORD` | `1234` | DB password |
| `JWT_PUBLIC_KEY` | `file:certs/public.pem` | RSA public key path |
| `JWT_PRIVATE_KEY` | `file:certs/private_pkcs8.pem` | RSA private key path |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend origin |
| `INCLUDE_ERROR_DETAILS` | `false` | Include stack traces in error responses |
| `JPA_SHOW_SQL` | `false` | Log SQL queries |

## Notes

- `AuthService.signIn()` is currently a stub (empty body) — the login flow is not yet implemented.
- `CorsConfig` allowed origins are hardcoded; consider injecting `${app.frontend.url}` to align with the config property.
- Lombok is used project-wide for boilerplate (`@Builder`, `@Getter`/`@Setter`, `@RequiredArgsConstructor`).
