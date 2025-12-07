DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'product_category'
    ) THEN
        CREATE TYPE product_category AS ENUM (
            'Clothes',
            'Accessories',
            'Shoes',
            'Jewelry',
            'Test'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    price NUMERIC(10,2) NOT NULL,
    category product_category NOT NULL
);

