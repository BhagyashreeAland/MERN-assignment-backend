import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct {
  name: string;
  quantity: number;
  rate: number;
  total: number;
  gst: number;
}

export interface IInvoice extends Document {
  user: Types.ObjectId;
  invoiceNumber: string;
  products: IProduct[];
  subtotal: number;
  totalGst: number;
  grandTotal: number;
  invoiceDate: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true },
    gst: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    products: {
      type: [productSchema],
      required: true,
      validate: [(val: IProduct[]) => val.length > 0, 'At least one product is required'],
    },
    subtotal: { type: Number, required: true },
    totalGst: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    invoiceDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
