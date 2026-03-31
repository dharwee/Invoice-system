import prisma from '../src/utils/prisma.js';

async function main() {
  await prisma.promptVersion.upsert({
    where: { version: 'v1.0' },
    update: {},
    create: {
      version: 'v1.0',
      isActive: true,
      promptText: `You are an invoice data extraction assistant. Extract the following fields from the invoice and return ONLY a valid JSON object with no extra text:
{
  "vendor_name": string,
  "invoice_number": string,
  "invoice_date": string,
  "currency": string (symbol or code),
  "total_amount": number or string,
  "tax_amount": number or string or null,
  "line_items": [
    { "description": string, "quantity": number, "unit_price": number, "line_total": number }
  ]
}
If a field is not found, set it to null. Do not include any explanation.`,
    },
  });
  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());