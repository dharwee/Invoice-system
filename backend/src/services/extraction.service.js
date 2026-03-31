import prisma from '../utils/prisma.js';
import { extractTextFromPDF, convertPDFToImages } from './pdf.service.js';
import { extractWithGPTText, extractWithGPTImage } from './openai.service.js';
import { normalizeExtraction } from './normalize.service.js';
import { computeConfidenceScore } from './validation.service.js';
import { downloadPDF } from './s3.service.js';

const TEXT_MIN_LENGTH = 50;

async function runPipeline(document, promptVersion) {
  const pdfBuffer = await downloadPDF(document.filePath);

  const text = await extractTextFromPDF(pdfBuffer);
  const isTextUsable = text.trim().length > TEXT_MIN_LENGTH;

  let rawGPTResult;
  if (isTextUsable) {
    rawGPTResult = await extractWithGPTText(text, promptVersion.promptText);
  } else {
    const imagePaths = await convertPDFToImages(pdfBuffer);
    rawGPTResult = await extractWithGPTImage(imagePaths, promptVersion.promptText);
  }

  const normalized = normalizeExtraction(rawGPTResult);
  const { confidence_score, validation_errors } = computeConfidenceScore(normalized);
  const status = validation_errors.length > 0 ? 'processed_with_errors' : 'processed';

  return { normalized, confidence_score, validation_errors, status, rawText: text };
}

async function saveExtractionResult(documentId, result, promptVersionId, processingTimeMs, rawText) {
  const normalizedLineItems = (result.normalized.line_items ?? []).map((item) => ({
    description: item.description ?? null,
    quantity: item.quantity ?? null,
    unitPrice: item.unitPrice ?? item.unit_price ?? null,
    lineTotal: item.lineTotal ?? item.line_total ?? null,
  }));

  await prisma.$transaction(async (tx) => {
    await tx.document.update({
      where: { id: documentId },
      data: {
        status: result.status,
        rawText,
        processingTimeMs,
        processedAt: new Date(),
      },
    });

    const existing = await tx.extractedData.findUnique({ where: { documentId } });
    const extractionData = {
      vendorName: result.normalized.vendor_name,
      invoiceNumber: result.normalized.invoice_number,
      invoiceDate: result.normalized.invoice_date,
      currency: result.normalized.currency,
      totalAmount: result.normalized.total_amount,
      taxAmount: result.normalized.tax_amount,
      confidenceScore: result.confidence_score,
      validationErrors: result.validation_errors,
      promptVersionId,
      lineItems: { create: normalizedLineItems },
    };

    if (existing) {
      await tx.lineItem.deleteMany({ where: { extractedDataId: existing.id } });
      await tx.extractedData.update({ where: { documentId }, data: extractionData });
    } else {
      await tx.extractedData.create({ data: { documentId, ...extractionData } });
    }
  });
}

async function markDocumentProcessing(documentId) {
  await prisma.document.update({ where: { id: documentId }, data: { status: 'processing' } });
}

async function markDocumentFailed(documentId, processingTimeMs = null) {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'failed',
      processedAt: new Date(),
      ...(processingTimeMs === null ? {} : { processingTimeMs }),
    },
  });
}

async function resolvePrompt(promptVersionId) {
  if (promptVersionId) {
    return prisma.promptVersion.findUniqueOrThrow({ where: { id: promptVersionId } });
  }
  return prisma.promptVersion.findFirstOrThrow({ where: { isActive: true } });
}

async function executeExtraction(documentId, promptVersionId = null) {
  await markDocumentProcessing(documentId);
  const startTime = Date.now();

  try {
    const document = await prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    const prompt = await resolvePrompt(promptVersionId);
    const result = await runPipeline(document, prompt);
    const ms = Date.now() - startTime;
    await saveExtractionResult(documentId, result, prompt.id, ms, result.rawText);
    return { result, prompt };
  } catch (err) {
    await markDocumentFailed(documentId, Date.now() - startTime);
    throw err;
  }
}

async function processDocument(documentId) {
  const { result } = await executeExtraction(documentId);
  return result;
}

async function reprocessDocument(documentId, promptVersionId) {
  try {
    await executeExtraction(documentId, promptVersionId ?? null);

    return await prisma.extractedData.findUnique({
      where: { documentId },
      include: { lineItems: true, promptVersion: { select: { id: true, version: true } } },
    });
  } catch (err) {
    throw err;
  }
}

export { processDocument, reprocessDocument };