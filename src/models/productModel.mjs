import { pool } from "../config/db.mjs";

export const getAllProducts = async () => {
  const q = `SELECT * FROM products ORDER BY name ASC`;
  const { rows } = await pool.query(q);
  return rows;
};

export const getProductById = async (id) => {
  const q = `SELECT * FROM products WHERE id = $1`;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
};

export const getProductByName = async (name) => {
  const q = `
    SELECT * FROM products
    WHERE LOWER(name) LIKE LOWER($1)
    ORDER BY name ASC
  `;
  const { rows } = await pool.query(q, [`%${name}%`]);
  return rows;
};

// Single insert
export const insertProduct = async (product) => {
  const q = `
    INSERT INTO products (name, quantity, price, category)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    product.name,
    product.quantity,
    product.price,
    product.category
  ]);
  return rows[0];
};

//Batch insert
export const insertProductsBatch = async (products) => {
  const inserted = [];

  for (const p of products) {
    const q = `
      INSERT INTO products (name, quantity, price, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(q, [
      p.name,
      p.quantity,
      p.price,
      p.category
    ]);
    inserted.push(rows[0]);
  }

  return inserted;
};

export const updateProduct = async (id, product) => {
  const q = `
    UPDATE products
    SET name=$1, quantity=$2, price=$3, category=$4
    WHERE id=$5
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    product.name,
    product.quantity,
    product.price,
    product.category,
    id
  ]);
  return rows[0] || null;
};
 
export const updateProductStock = async (id, qty) => {
  const q = `
    UPDATE products
    SET quantity=$1
    WHERE id=$2
    RETURNING *
  `;
  const { rows } = await pool.query(q, [qty, id]);
  return rows[0] || null;
};

export const deleteProduct = async (id) => {
  const q = `
    DELETE FROM products
    WHERE id=$1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
};

export const deleteProductsByCategory = async (category) => {
  const q = `
    DELETE FROM products
    WHERE category = $1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [category]);
  return rows;
};
