import express from 'express';

import { getProducts, getProduct, addProduct, editProduct, deleteProduct, deleteAllProducts } from '../controllers';
import { isAuth } from '../../../lib/middleware/isAuth';
import { validationSchema as ProductValidation } from './products.validation';
// import { validateRequestData } from '../../../lib/middleware/validateRequestData';

const router = express.Router();

router.get('/', isAuth, getProducts);
router.get('/:productId', isAuth, getProduct);

//validateRequestData takes 'FormData' because of file attached to multipart form
// router.post('/', isAuth, validateRequestData(ProductValidation, 'FormData'), addProduct);
// router.put('/:productId', isAuth, validateRequestData(ProductValidation, 'FormData'), editProduct);

router.delete('/:productId', isAuth, deleteProduct);
router.delete('/', isAuth, deleteAllProducts);

export default router;
