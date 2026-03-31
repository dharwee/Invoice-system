"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPatch, apiPost } from "@/lib/api/client";

export type PromptItem = {
  id: number;
  version: string;
  promptText: string;
  isActive: boolean;
  createdAt: string;
};

export type PromptDropdownItem = {
  id: number;
  version: string;
  isActive: boolean;
};

export function usePrompts() {
  return useQuery({
    queryKey: ["prompts"],
    queryFn: () => apiGet<PromptItem[]>("/prompts"),
  });
}

export function usePromptDropdown() {
  return useQuery({
    queryKey: ["prompts", "dropdown"],
    queryFn: () => apiGet<PromptDropdownItem[]>("/prompts/dropdown"),
  });
}

export function useCreatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { version: string; prompt_text: string }) =>
      apiPost<PromptItem>("/prompts", payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

export function useActivatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiPatch(`/prompts/${id}/activate`),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["prompts"] });
      await qc.invalidateQueries({ queryKey: ["prompts", "dropdown"] });
    },
  });
}
