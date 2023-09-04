import express from 'express';

import { checkRequestFormat } from '../../../lib/middleware/checkRequestFormat';
import { createTenant, getTenant, updateTenant, deleteTenant } from '../controllers';

const router = express.Router();

router.post('/', checkRequestFormat, createTenant);
router.get('/:id', getTenant);
router.patch('/:id', checkRequestFormat, updateTenant);
router.delete('/:id', deleteTenant);

export default router;
