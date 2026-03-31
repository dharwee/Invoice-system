function extractValidationErrors(document) {
  return Array.isArray(document.extractedData?.validationErrors)
    ? document.extractedData.validationErrors
    : [];
}

function mapErrorDocument(document) {
  const validationErrors = extractValidationErrors(document);
  return {
    id: document.id,
    filename: document.filename,
    status: document.status,
    vendor_name: document.extractedData?.vendorName ?? null,
    invoice_number: document.extractedData?.invoiceNumber ?? null,
    confidence_score: document.extractedData?.confidenceScore ?? null,
    error_count: validationErrors.length,
    error_types: [...new Set(validationErrors.map((e) => e.type))],
    failed_fields: validationErrors
      .filter((e) => e.type === "missing_field")
      .map((e) => e.field),
    processed_at: document.processedAt,
  };
}

export { extractValidationErrors, mapErrorDocument };
