import { body } from 'express-validator';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .matches(emailRegex)
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .matches(emailRegex)
    .withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const invoiceValidation = [
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  body('products.*.name').trim().notEmpty().withMessage('Product name is required'),
  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Product quantity must be at least 1'),
  body('products.*.rate')
    .isFloat({ min: 0 })
    .withMessage('Product rate must be a positive number'),
];
