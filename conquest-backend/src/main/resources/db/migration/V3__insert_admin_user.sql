DO $$
DECLARE
    user_id UUID;
BEGIN
    INSERT INTO users (email, name, password)
    VALUES ('arthurtavaressouto@gmail.com', 'Arthur Souto', '$2a$12$l5fAo05Kb94dLIftsY6G.OrbwrfkuUaAnalBrLizo3APZCpQhrAAi')
    RETURNING id INTO user_id;

    INSERT INTO permissions (name, id_user) VALUES ('ADMIN', user_id);
    INSERT INTO permissions (name, id_user) VALUES ('USER', user_id);
END $$;
