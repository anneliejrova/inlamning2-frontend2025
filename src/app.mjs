import express from 'express';
import productRoutes from './routes/productRoutes.mjs';
import { globalErrorHandler } from './middleware/validateGlobal.mjs';

const app = express();

app.use(express.json());

app.use('/products', productRoutes);

app.use(globalErrorHandler);

export default app;
