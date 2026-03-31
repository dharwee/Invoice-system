import { z } from 'zod';

const LineItemSchema = z.object({
  description: z.string().optional().nullable(),
  quantity: z.union([z.number(), z.string()]).optional().nullable(),
  unit_price: z.union([z.number(), z.string()]).optional().nullable(),
  line_total: z.union([z.number(), z.string()]).optional().nullable(),
}).loose();

const ExtractionSchema = z.object({
  vendor_name: z.string().optional().nullable(),
  invoice_number: z.string().optional().nullable(),
  invoice_date: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  total_amount: z.union([z.number(), z.string()]).optional().nullable(),
  tax_amount: z.union([z.number(), z.string()]).optional().nullable(),
  line_items: z.array(LineItemSchema).default([]),
});

export { ExtractionSchema };