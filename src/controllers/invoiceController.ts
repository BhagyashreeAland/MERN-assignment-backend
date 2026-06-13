import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Invoice, IProduct } from '../models/Invoice';
import { AuthRequest } from '../middleware/auth';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';
import { generateInvoicePDF } from '../utils/generatePDF';

const GST_RATE = 0.18;

const calculateProductTotals = (products: { name: string; quantity: number; rate: number }[]): IProduct[] => {
  return products.map((p) => {
    const total = p.quantity * p.rate;
    const gst = total * GST_RATE;
    return {
      name: p.name,
      quantity: p.quantity,
      rate: p.rate,
      total,
      gst,
    };
  });
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const { products } = req.body;

    const calculatedProducts = calculateProductTotals(products);
    const subtotal = calculatedProducts.reduce((sum, p) => sum + p.total, 0);
    const totalGst = calculatedProducts.reduce((sum, p) => sum + p.gst, 0);
    const grandTotal = subtotal + totalGst;

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber: generateInvoiceNumber(),
      products: calculatedProducts,
      subtotal,
      totalGst,
      grandTotal,
      invoiceDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully.',
      data: invoice,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating invoice.' });
  }
};

export const generatePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const { products } = req.body;

    const calculatedProducts = calculateProductTotals(products);
    const subtotal = calculatedProducts.reduce((sum, p) => sum + p.total, 0);
    const totalGst = calculatedProducts.reduce((sum, p) => sum + p.gst, 0);
    const grandTotal = subtotal + totalGst;

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber: generateInvoiceNumber(),
      products: calculatedProducts,
      subtotal,
      totalGst,
      grandTotal,
      invoiceDate: new Date(),
    });

    const pdfBuffer = await generateInvoicePDF(invoice, req.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.setHeader('X-Invoice-Id', invoice._id.toString());
    res.setHeader('X-Invoice-Number', invoice.invoiceNumber);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ success: false, message: 'Server error while generating PDF.' });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching invoices.' });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found.' });
      return;
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching invoice.' });
  }
};
