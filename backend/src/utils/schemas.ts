import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Alert Schemas
export const createAlertSchema = z.object({
  coinId: z.string().min(1, 'Coin ID is required'),
  condition: z.enum(['above', 'below']),
  targetPrice: z.number().positive('Target price must be a positive number'),
});

// Portfolio Schemas
export const portfolioPositionSchema = z.object({
  coinId: z.string().min(1, 'Coin ID is required'),
  quantity: z.number().positive('Quantity must be a positive number'),
  purchasePrice: z.number().positive('Purchase price must be a positive number'),
});
