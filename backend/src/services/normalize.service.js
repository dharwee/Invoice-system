import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)


const CURRENCY_MAP = {
    '$': 'USD', '€': 'EUR', '£': 'GBP', 'Rs': 'INR', '₹': 'INR',
    'USD': 'USD', 'EUR': 'EUR', 'GBP': 'GBP', 'INR': 'INR', 'CAD': 'CAD', 'AUD': 'AUD',
  };
  
  const DATE_FORMATS = [
    'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'DD-MMM-YY', 'MMM D, YYYY',
    'YYYYMMDD', 'DD-MM-YYYY', 'D-MMM-YY', 'MMM DD YYYY',
  ];
  
  function normalizeDate(raw) {
    if (!raw) return { value: null, error: 'missing_date' };
    for (const fmt of DATE_FORMATS) {
      const d = dayjs(raw, fmt, true);
      if (d.isValid()) return { value: d.format('YYYY-MM-DD'), error: null };
    }
    const d = dayjs(raw); // fuzzy fallback
    if (d.isValid()) return { value: d.format('YYYY-MM-DD'), error: null };
    return { value: raw, error: 'unparseable_date' };
  }
  
  function normalizeCurrency(raw) {
    if (!raw) return { value: null, error: 'missing_currency' };
    const trimmed = raw.trim();
    const mapped = CURRENCY_MAP[trimmed];
    if (mapped) return { value: mapped, error: null };
    return { value: trimmed, error: 'unrecognized_currency' };
  }
  
  function normalizeAmount(raw) {
    if (raw === null || raw === undefined) return null;
    let str = String(raw).trim();
    const negative = str.startsWith('(') && str.endsWith(')');
    str = str.replace(/[()$€£₹\s,]/g, '').replace(/Rs/g, '');
    if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(str)) {
      str = str.replace(/\./g, '').replace(',', '.');
    }
    const num = parseFloat(str);
    if (isNaN(num)) return null;
    return negative ? -num : num;
  }
  
  function normalizeLineItems(rawItems) {
    if (!Array.isArray(rawItems)) return [];
    return rawItems.map(item => ({
      description: item.description || item.desc || item.name || null,
      quantity: normalizeAmount(item.quantity ?? item.qty ?? item.count) ?? null,
      unit_price: normalizeAmount(item.unit_price ?? item.price ?? item.unitPrice ?? item.rate) ?? null,
      line_total: normalizeAmount(item.line_total ?? item.total ?? item.amount ?? item.lineTotal) ?? null,
    }));
  }
  
  function normalizeExtraction(raw) {
    const dateResult = normalizeDate(raw.invoice_date);
    const currencyResult = normalizeCurrency(raw.currency);
    return {
      vendor_name: raw.vendor_name || null,
      invoice_number: raw.invoice_number || null,
      invoice_date: dateResult.value,
      currency: currencyResult.value,
      total_amount: normalizeAmount(raw.total_amount),
      tax_amount: normalizeAmount(raw.tax_amount),
      line_items: normalizeLineItems(raw.line_items || []),
      _normalizationErrors: [dateResult.error, currencyResult.error].filter(Boolean),
    };
  }
  
  export { normalizeDate, normalizeCurrency, normalizeAmount, normalizeLineItems, normalizeExtraction };