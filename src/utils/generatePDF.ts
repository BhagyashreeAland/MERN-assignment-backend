import PDFDocument from 'pdfkit';
import { IInvoice } from '../models/Invoice';
import { IUser } from '../models/User';

const formatCurrency = (amount: number): string => {
  return `₹ ${amount.toFixed(2)}`;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const generateInvoicePDF = (invoice: IInvoice, user: IUser): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 100;

      // Header
      doc.fontSize(24).fillColor('#1e40af').text('TAX INVOICE', 50, 50, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#6b7280').text('Invoice Generator Application', { align: 'center' });
      doc.moveDown(1.5);

      // Invoice details box
      const boxY = doc.y;
      doc.rect(50, boxY, pageWidth, 70).stroke('#e5e7eb');

      doc.fontSize(10).fillColor('#374151');
      doc.text(`Invoice No: ${invoice.invoiceNumber}`, 60, boxY + 15);
      doc.text(`Date: ${formatDate(invoice.invoiceDate)}`, 60, boxY + 35);
      doc.text(`Billed To: ${user.name}`, 300, boxY + 15);
      doc.text(`Email: ${user.email}`, 300, boxY + 35);

      doc.y = boxY + 90;

      // Table header
      const tableTop = doc.y;
      const colWidths = [180, 80, 100, 100, 80];
      const headers = ['Product Name', 'Qty', 'Rate', 'Total', 'GST (18%)'];
      const headerColors = '#1e40af';

      doc.rect(50, tableTop, pageWidth, 25).fill(headerColors);
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');

      let xPos = 55;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop + 8, { width: colWidths[i], align: i > 0 ? 'right' : 'left' });
        xPos += colWidths[i];
      });

      // Table rows
      let rowY = tableTop + 30;
      doc.font('Helvetica').fillColor('#374151').fontSize(9);

      invoice.products.forEach((product, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(50, rowY - 5, pageWidth, 22).fill(bgColor);

        xPos = 55;
        const rowData = [
          product.name,
          String(product.quantity),
          formatCurrency(product.rate),
          formatCurrency(product.total),
          formatCurrency(product.gst),
        ];

        rowData.forEach((cell, i) => {
          doc.fillColor('#374151').text(cell, xPos, rowY, { width: colWidths[i], align: i > 0 ? 'right' : 'left' });
          xPos += colWidths[i];
        });

        rowY += 22;
      });

      // Summary section
      rowY += 20;
      const summaryX = 350;

      doc.rect(summaryX - 10, rowY - 5, 205, 90).stroke('#e5e7eb');

      doc.fontSize(10).fillColor('#374151');
      doc.text('Subtotal:', summaryX, rowY, { width: 100 });
      doc.text(formatCurrency(invoice.subtotal), summaryX + 100, rowY, { width: 85, align: 'right' });

      doc.text('Total GST (18%):', summaryX, rowY + 20, { width: 100 });
      doc.text(formatCurrency(invoice.totalGst), summaryX + 100, rowY + 20, { width: 85, align: 'right' });

      doc.moveTo(summaryX, rowY + 45).lineTo(summaryX + 185, rowY + 45).stroke('#1e40af');

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e40af');
      doc.text('Grand Total:', summaryX, rowY + 55, { width: 100 });
      doc.text(formatCurrency(invoice.grandTotal), summaryX + 100, rowY + 55, { width: 85, align: 'right' });

      // Footer
      doc.font('Helvetica').fontSize(8).fillColor('#9ca3af');
      doc.text('This is a computer-generated invoice. No signature required.', 50, doc.page.height - 60, {
        align: 'center',
        width: pageWidth,
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
