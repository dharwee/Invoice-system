import OpenAI from 'openai';
import fs from 'fs';
import config from '../config/index.js';
import { ExtractionSchema } from '../schemas/extraction.schema.js';

const client = new OpenAI({ apiKey: config.openaiApiKey });

async function extractWithGPTText(text, promptText) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: promptText },
      { role: 'user', content: `Extract invoice data from the following text. Return valid JSON only.\n\n${text}` },
    ],
    response_format: { type: 'json_object' },
  });
  const raw = JSON.parse(response.choices[0].message.content);
  return ExtractionSchema.parse(raw);
}

async function extractWithGPTImage(imagePaths, promptText) {
  const imageContent = imagePaths.map(p => ({
    type: 'image_url',
    image_url: { url: `data:image/png;base64,${fs.readFileSync(p).toString('base64')}` },
  }));

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: promptText },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract invoice data from these images. Return valid JSON only.' },
          ...imageContent,
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });
  const raw = JSON.parse(response.choices[0].message.content);
  return ExtractionSchema.parse(raw);
}

export { extractWithGPTText, extractWithGPTImage };