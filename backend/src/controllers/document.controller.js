import prisma from '../utils/prisma.js';
import { processDocument, reprocessDocument } from '../services/extraction.service.js';
import { uploadPDF } from '../services/s3.service.js';
import { mapDocumentSummary, mapUploadDocumentResult } from '../mappers/document.mapper.js';
import { getPagination, toPositiveInt } from '../utils/http.js';
import { computeConfidenceScore } from '../services/validation.service.js';

const INCLUDE_FULL = {
  extractedData: {
    include: {
      lineItems: true,
      promptVersion: { select: { id: true, version: true } },
    },
  },
};

async function uploadDocuments(req, res, next) {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    const results = await Promise.all(
      files.map(async (file) => {
        const s3Key = await uploadPDF(file.buffer, file.originalname);
        const doc = await prisma.document.create({
          data: { filename: file.originalname, filePath: s3Key, status: 'pending' },
        });
        await processDocument(doc.id);
        const updated = await prisma.document.findUnique({
          where: { id: doc.id },
          include: { extractedData: true },
        });
        return mapUploadDocumentResult(updated);
      })
    );

    res.status(201).json(results);
  } catch (err) {
    next(err);
  }
}

async function listDocuments(req, res, next) {
  try {
    const { status, hasErrors } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const where = {};
    if (status) where.status = status;
    if (hasErrors === 'true') where.extractedData = { validationErrors: { not: '[]' } };

    const [docs, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: { extractedData: { select: { vendorName: true, invoiceNumber: true, confidenceScore: true, validationErrors: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    const formatted = docs.map(mapDocumentSummary);

    res.json({ data: formatted, total, page, limit });
  } catch (err) {
    next(err);
  }
}

async function getDocument(req, res, next) {
  try {
    const id = toPositiveInt(req.params.id, NaN);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid document id' });
    const doc = await prisma.document.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

async function patchDocument(req, res, next) {
  try {
    const docId = toPositiveInt(req.params.id, NaN);
    if (Number.isNaN(docId)) return res.status(400).json({ error: 'Invalid document id' });
    const fields = req.body;

    const existing = await prisma.extractedData.findUnique({ where: { documentId: docId }, include: { lineItems: true } });
    if (!existing) return res.status(404).json({ error: 'Extracted data not found' });

    const merged = {
      vendor_name: fields.vendor_name ?? existing.vendorName,
      invoice_number: fields.invoice_number ?? existing.invoiceNumber,
      invoice_date: fields.invoice_date ?? existing.invoiceDate,
      currency: fields.currency ?? existing.currency,
      total_amount: fields.total_amount ?? existing.totalAmount,
      tax_amount: fields.tax_amount ?? existing.taxAmount,
      line_items: existing.lineItems,
      _normalizationErrors: [],
    };
    const { confidence_score, validation_errors } = computeConfidenceScore(merged);

    const updated = await prisma.extractedData.update({
      where: { documentId: docId },
      data: {
        vendorName: merged.vendor_name,
        invoiceNumber: merged.invoice_number,
        invoiceDate: merged.invoice_date,
        currency: merged.currency,
        totalAmount: typeof merged.total_amount === 'number' ? merged.total_amount : parseFloat(merged.total_amount) || null,
        taxAmount: typeof merged.tax_amount === 'number' ? merged.tax_amount : parseFloat(merged.tax_amount) || null,
        confidenceScore: confidence_score,
        validationErrors: validation_errors,
      },
    });

    res.json({ ...updated, confidence_score, validation_errors });
  } catch (err) {
    next(err);
  }
}

async function reprocessDocumentEndpoint(req, res, next) {
  try {
    const docId = toPositiveInt(req.params.id, NaN);
    if (Number.isNaN(docId)) return res.status(400).json({ error: 'Invalid document id' });
    const { prompt_version_id } = req.body;
    const parsedPromptId = prompt_version_id ? toPositiveInt(prompt_version_id, NaN) : null;
    const result = await reprocessDocument(docId, Number.isNaN(parsedPromptId) ? null : parsedPromptId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export { uploadDocuments, listDocuments, getDocument, patchDocument, reprocessDocumentEndpoint };