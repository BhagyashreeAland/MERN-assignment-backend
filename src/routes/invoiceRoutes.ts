import { Router } from 'express';
import {
  createInvoice,
  generatePDF,
  getInvoices,
  getInvoiceById,
} from '../controllers/invoiceController';
import { protect } from '../middleware/auth';
import { invoiceValidation } from '../middleware/validation';

const router = Router();

router.use(protect);

router.post('/', invoiceValidation, createInvoice);
router.post('/generate-pdf', invoiceValidation, generatePDF);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

export default router;
