import {
  getAllProducts,
  getProductById,
  insertProduct,
  insertProductsBatch,
  updateProduct,
  deleteProduct,
  deleteProductsByCategory,
  getProductByName,
  updateProductStock
} from '../models/productModel.mjs';

export const getProducts = async (req, res) => {
  try {
    const data = await getAllProducts();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const item = await getProductById(req.params.id);
    if (!item) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(item);
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductByNameController = async (req, res) => {
  try {
    const items = await getProductByName(req.params.name);
    if (items.length === 0) return res.status(404).json({ message: "No match found" });
    return res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching products by name:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addProduct = async (req, res) => {
  try {
    const payload = req.body;

    // Batch insert
    if (Array.isArray(payload)) {
      const inserted = await insertProductsBatch(payload);
      return res.status(201).json({ message: `${inserted.length} product(s) created`, products: inserted });
    }

    // Single insert
    const created = await insertProduct(payload);
    return res.status(201).json({ message: "Product created", product: created });

  } catch (err) {
    console.error("Error adding product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const patchProduct = async (req, res) => {
  try {
    const existing = await getProductById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const updated = { ...existing, ...req.body };

    if (updated.quantity < 0) {
      return res.status(400).json({ message: `Not enough stock. Only ${existing.quantity} left.` });
    }

    const result = await updateProduct(req.params.id, updated);
    return res.status(200).json(result);

  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const putProduct = async (req, res) => {
  try {
    const existing = await getProductById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const { name, quantity, price, category } = req.body;

    if ([name, quantity, price, category].some(v => v === undefined)) {
      return res.status(400).json({ message: "PUT requires all fields: name, quantity, price, category" });
    }

    const updatedProduct = { name, quantity, price, category };
    const result = await updateProduct(req.params.id, updatedProduct);

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in PUT product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStock = async (req, res) => {
  try {
    const item = await getProductById(req.params.id);
    if (!item) return res.status(404).json({ message: "Product not found" });

    const qty = item.quantity + req.body.change;
    if (qty < 0) return res.status(400).json({ message: `Not enough stock. Only ${item.quantity} left.` });

    const updated = await updateProductStock(req.params.id, qty);
    return res.status(200).json(updated);

  } catch (err) {
    console.error("Error updating stock:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { confirm } = req.query;
    const existing = await getProductById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    if (existing.quantity > 0 && confirm !== "true") {
      return res.status(400).json({
        message: "Product cannot be deleted while quantity > 0. Add ?confirm=true to force deletion.",
        currentQuantity: existing.quantity
      });
    }

    await deleteProduct(req.params.id);
    return res.status(200).json({ message: "Product deleted", deleted: existing });

  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { confirm } = req.query;

    if (confirm !== "true") {
      return res.status(400).json({ message: "Use ?confirm=true to perform deletion" });
    }

    const all = await getAllProducts();
    const matching = all.filter(p => p.category.toLowerCase() === category.toLowerCase());

    if (matching.length === 0) return res.status(404).json({ message: `No products found in category '${category}'` });

    await deleteProductsByCategory(category);
    return res.status(200).json({ message: `${matching.length} product(s) deleted in category '${category}'`, deleted: matching });

  } catch (err) {
    console.error("Error deleting products by category:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
