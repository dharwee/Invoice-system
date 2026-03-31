import prisma from '../utils/prisma.js';
import { toPositiveInt } from '../utils/http.js';

async function createPrompt(req, res, next) {
  try {
    const { version, prompt_text } = req.body;
    if (!version || !prompt_text) return res.status(400).json({ error: 'version and prompt_text are required' });
    const prompt = await prisma.promptVersion.create({
      data: { version, promptText: prompt_text, isActive: false },
    });
    res.status(201).json(prompt);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Version label already exists' });
    next(err);
  }
}

async function listPrompts(req, res, next) {
  try {
    const prompts = await prisma.promptVersion.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(prompts);
  } catch (err) { next(err); }
}

async function getPromptsDropdown(req, res, next) {
  try {
    const prompts = await prisma.promptVersion.findMany({
      select: { id: true, version: true, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(prompts);
  } catch (err) { next(err); }
}

async function activatePrompt(req, res, next) {
  try {
    const id = toPositiveInt(req.params.id, NaN);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid prompt id' });
    const updated = await prisma.$transaction(async (tx) => {
      await tx.promptVersion.updateMany({ data: { isActive: false } });
      return tx.promptVersion.update({ where: { id }, data: { isActive: true } });
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Prompt not found' });
    next(err);
  }
}

export { createPrompt, listPrompts, getPromptsDropdown, activatePrompt };