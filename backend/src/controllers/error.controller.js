import prisma from '../utils/prisma.js';
import { mapErrorDocument, extractValidationErrors } from '../mappers/error.mapper.js';
import { getPagination } from '../utils/http.js';

async function listErrors(req, res, next) {
  try {
    const { limit, skip } = getPagination(req.query);

    const docs = await prisma.document.findMany({
      where: {
        OR: [
          { status: 'failed' },
          { status: 'processed_with_errors' },
        ],
      },
      include: {
        extractedData: {
          select: {
            vendorName: true, invoiceNumber: true,
            confidenceScore: true, validationErrors: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const formatted = docs.map(mapErrorDocument);

    res.json(formatted);
  } catch (err) { next(err); }
}

async function errorAnalytics(req, res, next) {
  try {
    const errorDocs = await prisma.document.findMany({
      where: { OR: [{ status: 'failed' }, { status: 'processed_with_errors' }] },
      include: { extractedData: { select: { validationErrors: true } } },
    });

    const allErrors = errorDocs.flatMap(extractValidationErrors);

    const breakdown = allErrors.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});

    const missingFieldCounts = allErrors
      .filter(e => e.type === 'missing_field')
      .reduce((acc, e) => { acc[e.field] = (acc[e.field] || 0) + 1; return acc; }, {});

    const mostMissingFields = Object.entries(missingFieldCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([field, count]) => ({ field, count }));

    res.json({
      total_error_invoices: errorDocs.length,
      error_breakdown: breakdown,
      most_missing_fields: mostMissingFields,
    });
  } catch (err) { next(err); }
}

export { listErrors, errorAnalytics };