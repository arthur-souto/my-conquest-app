CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    keycloak_id UUID UNIQUE,
    profile_image VARCHAR(512)
);
