import { pool } from "../config/db.mjs";

const allowedCategories = ["Clothes", "Accessories", "Shoes", "Jewelry", "Test"];

function validateFields(product, requireAllFields = false) {
  const errors = [];

  if (requireAllFields || product.name !== undefined) {
    if (!product.name || typeof product.name !== "string" || product.name.trim() === "") {
      errors.push("Name is required.");
    }
  }

  if (product.quantity !== undefined) {
    product.quantity = Number(product.quantity);
    if (isNaN(product.quantity)) errors.push("Quantity must be a number.");
    else if (product.quantity < 0) errors.push("Quantity must be >= 0.");
  } else if (requireAllFields) {
    errors.push("Quantity is required.");
  }

  if (product.price !== undefined) {
    product.price = Number(product.price);
    if (isNaN(product.price)) errors.push("Price must be a number.");
    else if (product.price <= 0) errors.push("Price must be > 0.");
  } else if (requireAllFields) {
    errors.push("Price is required.");
  }

  if (product.category !== undefined) {
    if (typeof product.category !== "string" || !allowedCategories.includes(product.category)) {
      errors.push(`Category must be one of: ${allowedCategories.join(", ")}`);
    }
  } else if (requireAllFields) {
    errors.push("Category is required.");
  }

  return errors;
}

// Duplicate name check
async function checkDuplicateName(name, excludeId = null) {
  let q = `SELECT id FROM products WHERE LOWER(name) = LOWER($1)`;
  const params = [name];

  if (excludeId) {
    q += " AND id <> $2";
    params.push(excludeId);
  }

  const { rows } = await pool.query(q, params);
  return rows.length > 0;
}

export async function validateProduct(req, res, next) {
  const payload = req.body;
  const isPost = req.method === "POST";
  const requireAll = isPost;

  // Batch POST
  if (Array.isArray(payload)) {
    if (!isPost) {
      return res.status(400).json({
        message: "Batch updates are not allowed. Use POST for arrays."
      });
    }

    const allErrors = [];

    for (let idx = 0; idx < payload.length; idx++) {
      const product = payload[idx];
      const errors = validateFields(product, true);

      if (await checkDuplicateName(product.name)) {
        errors.push("A product with this name already exists.");
      }

      if (errors.length > 0) {
        allErrors.push({ index: idx, errors });
      }
    }

    if (allErrors.length > 0) {
      return res.status(400).json({ message: "Validation failed", details: allErrors });
    }

    return next();
  }

  // Single product
  const errors = validateFields(payload, requireAll);

  let excludeId = null;
  if (req.params.id) excludeId = req.params.id;

  if (payload.name && await checkDuplicateName(payload.name, excludeId)) {
    errors.push("A product with this name already exists.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
