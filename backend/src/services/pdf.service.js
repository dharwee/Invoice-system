import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParseFn =
  typeof pdfParseModule === 'function'
    ? pdfParseModule
    : typeof pdfParseModule?.default === 'function'
      ? pdfParseModule.default
      : null;
const PDFParseClass =
  typeof pdfParseModule?.PDFParse === 'function' ? pdfParseModule.PDFParse : null;
import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';
import os from 'os';

async function extractTextFromPDF(buffer) {
  if (pdfParseFn) {
    const data = await pdfParseFn(buffer);
    return data.text || '';
  }

  if (PDFParseClass) {
    const parser = new PDFParseClass({ data: buffer });
    const data = await parser.getText();
    await parser.destroy();
    return data?.text || '';
  }

  throw new TypeError('pdf-parse module did not expose a callable parser');
}

async function convertPDFToImages(buffer) {
  const tmpPath = path.join(os.tmpdir(), `invoice_${Date.now()}.pdf`);
  fs.writeFileSync(tmpPath, buffer);

  const options = {
    density: 200,
    saveFilename: `pdf_${Date.now()}`,
    savePath: os.tmpdir(),
    format: 'png',
    width: 1700,
    height: 2200,
  };
  const convert = fromPath(tmpPath, options);
  const pages = await convert.bulk(-1);
  fs.unlinkSync(tmpPath);
  return pages.map(p => p.path).filter(Boolean);
}

export { extractTextFromPDF, convertPDFToImages };