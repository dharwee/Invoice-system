import prisma from '../utils/prisma.js';

function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

async function getAnalytics(req, res, next) {
  try {
    const [allDocs, today] = await Promise.all([
      prisma.document.findMany({
        where: { status: { not: 'pending' } },
        include: { extractedData: { select: { confidenceScore: true } } },
      }),
      prisma.document.count({
        where: {
          status: { not: 'pending' },
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    const total = allDocs.length;
    const failed = allDocs.filter(d => d.status === 'failed').length;
    const processedDocs = allDocs.filter(d => d.extractedData);
    const scores = processedDocs.map(d => d.extractedData.confidenceScore);
    const timings = allDocs.filter(d => d.processingTimeMs).map(d => d.processingTimeMs);

    const avgConfidence = average(scores);
    const avgProcessingTimeMs = average(timings);
    const successRate = total ? ((total - failed) / total) * 100 : 0;

    const high = scores.filter(s => s >= 0.9).length;
    const medium = scores.filter(s => s >= 0.7 && s < 0.9).length;
    const low = scores.filter(s => s < 0.7).length;
    const pct = n => scores.length ? parseFloat(((n / scores.length) * 100).toFixed(1)) : 0;
    const failedOrErrored = failed + allDocs.filter(d => d.status === 'processed_with_errors').length;

    res.json({
      total_processed: total,
      success_rate: parseFloat(successRate.toFixed(1)),
      avg_processing_time_ms: Math.round(avgProcessingTimeMs),
      avg_confidence_score: parseFloat(avgConfidence.toFixed(4)),
      confidence_distribution: {
        high:   { range: '90-100%', count: high,   percentage: pct(high) },
        medium: { range: '70-89%',  count: medium, percentage: pct(medium) },
        low:    { range: '0-69%',   count: low,    percentage: pct(low) },
      },
      total_invoices: total,
      processed_today: today,
      failed_or_errored: failedOrErrored,
    });
  } catch (err) { next(err); }
}

export { getAnalytics };