function mapDocumentSummary(document) {
  const validationErrors = Array.isArray(document.extractedData?.validationErrors)
    ? document.extractedData.validationErrors
    : [];

  return {
    id: document.id,
    filename: document.filename,
    status: document.status,
    vendor_name: document.extractedData?.vendorName ?? null,
    invoice_number: document.extractedData?.invoiceNumber ?? null,
    confidence_score: document.extractedData?.confidenceScore ?? null,
    error_count: validationErrors.length,
    created_at: document.createdAt,
  };
}

function mapUploadDocumentResult(document) {
  return {
    id: document.id,
    filename: document.filename,
    status: document.status,
    confidence_score: document.extractedData?.confidenceScore ?? null,
  };
}

export { mapDocumentSummary, mapUploadDocumentResult };
