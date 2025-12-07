import express from 'express';
import {
  getProducts,
  getProduct,
  addProduct,
  patchProduct,
  putProduct,
  removeProduct,
  removeProductsByCategory,
  getProductByNameController,
  updateStock
} from '../controllers/productController.mjs';

import { validateId } from '../middleware/validateId.mjs';
import { validateProduct } from '../middleware/validateProduct.mjs';
import { validateStockChange } from '../middleware/validateStockChange.mjs';

const router = express.Router();

router.get('/name/:name', getProductByNameController);
router.delete('/category/:category', removeProductsByCategory);
router.patch('/:id/stock', validateId, validateStockChange, updateStock);
router.get('/', getProducts);
router.get('/:id', validateId, getProduct);
router.post('/', validateProduct, addProduct);
router.patch('/:id', validateId, validateProduct, patchProduct);
router.put('/:id', validateId, validateProduct, putProduct);
router.delete('/:id', validateId, removeProduct);

export default router;
