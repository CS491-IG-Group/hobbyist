/* Hobbies: broad categories (e.g. TV, Gaming, Swimming, Working out). */
CREATE TABLE IF NOT EXISTS public.hobbies (
    id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE   /* URL-friendly name, e.g. tv, gaming, working-out */
);
