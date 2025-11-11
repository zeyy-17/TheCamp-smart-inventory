import { z } from "zod";

// Product validation schema
export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-'.&()]+$/, "Product name contains invalid characters"),
  category: z
    .string()
    .min(1, "Category is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(1000000, "Quantity must be less than 1,000,000"),
  reorderPoint: z
    .number()
    .int("Reorder point must be a whole number")
    .min(0, "Reorder point cannot be negative")
    .max(100000, "Reorder point must be less than 100,000"),
});

// Purchase order validation schema
export const purchaseOrderSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-'.&()]+$/, "Product name contains invalid characters"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(1000000, "Quantity must be less than 1,000,000"),
  supplier: z
    .string()
    .trim()
    .min(1, "Supplier name is required")
    .max(100, "Supplier name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-'.&(),]+$/, "Supplier name contains invalid characters"),
  deliveryDate: z
    .date()
    .min(new Date(), "Delivery date must be in the future"),
});

// Forecast adjustment validation schema
export const forecastSchema = z.object({
  newForecast: z
    .number()
    .min(-100, "Forecast cannot be less than -100%")
    .max(500, "Forecast cannot exceed 500%"),
  effectiveDate: z
    .date()
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Effective date cannot be in the past"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
export type ForecastFormData = z.infer<typeof forecastSchema>;
