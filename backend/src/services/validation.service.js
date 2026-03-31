const REQUIRED_FIELDS = ['vendor_name', 'invoice_number', 'invoice_date', 'total_amount', 'currency'];
const DEDUCTIONS = {
  missing_field: 0.15,
  math_mismatch: 0.20,
  unparseable_date: 0.10,
  incomplete_line_item: 0.05,
  unrecognized_currency: 0.05,
};

function computeConfidenceScore(normalized) {
  let score = 1.0;
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!normalized[field] && normalized[field] !== 0) {
      score -= DEDUCTIONS.missing_field;
      errors.push({ type: 'missing_field', field });
    }
  }

  if (normalized._normalizationErrors.includes('unparseable_date')) {
    score -= DEDUCTIONS.unparseable_date;
    errors.push({ type: 'unparseable_date' });
  }

  if (normalized._normalizationErrors.includes('unrecognized_currency')) {
    score -= DEDUCTIONS.unrecognized_currency;
    errors.push({ type: 'unrecognized_currency' });
  }

  if (normalized.line_items.length > 0 && normalized.total_amount !== null) {
    const sum = normalized.line_items.reduce((acc, i) => acc + (i.line_total || 0), 0);
    if (Math.abs(sum - normalized.total_amount) > 0.02) {
      score -= DEDUCTIONS.math_mismatch;
      errors.push({ type: 'math_mismatch', computed_sum: +sum.toFixed(2), stated_total: normalized.total_amount });
    }
  }

  for (const item of normalized.line_items) {
    if (item.quantity === null || item.unit_price === null || item.line_total === null) {
      score -= DEDUCTIONS.incomplete_line_item;
      errors.push({ type: 'incomplete_line_item' });
      break;
    }
  }

  return { confidence_score: Math.max(0, parseFloat(score.toFixed(4))), validation_errors: errors };
}

export { computeConfidenceScore };