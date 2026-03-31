"use client";

import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActivatePrompt, useCreatePrompt, usePrompts } from "@/features/prompts/hooks";

type PromptProps = {
  title?: string;
  versionPlaceholder?: string;
  promptPlaceholder?: string;
  helperText?: string;
};

export function Prompt({
  title = "Create New Prompt Version",
  versionPlaceholder = "e.g. v2.1-optimized",
  promptPlaceholder = "Enter system instructions here...",
  helperText = "This will be saved as inactive. Test it via reprocess before activating.",
}: PromptProps) {
  const [open, setOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [promptText, setPromptText] = useState("");

  const promptsQuery = usePrompts();
  const createPromptMutation = useCreatePrompt();
  const activatePromptMutation = useActivatePrompt();

  const prompts = promptsQuery.data ?? [];
  const activePromptId = useMemo(
    () => prompts.find((prompt) => prompt.isActive)?.id,
    [prompts],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-white/5 bg-[#141518] p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prompt Management</h2>
          <p className="mt-1 text-white/60">Create, review, and activate prompt versions.</p>
        </div>
        <Button
          className="bg-[#8F8AFF] text-[#171823] hover:bg-[#8F8AFF]/90"
          onClick={() => setOpen(true)}
        >
          Add Prompt
        </Button>
      </div>

      <div className="space-y-2">
        {prompts.length === 0 ? (
          <p className="text-sm text-white/55">No prompt versions found.</p>
        ) : (
          prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-xl border border-white/10 bg-[#111216] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {prompt.version}
                    {prompt.isActive ? (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                        Active
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {new Date(prompt.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-white/20 bg-[#1A1C22] text-white hover:bg-[#222632] hover:text-white"
                  disabled={prompt.id === activePromptId || activatePromptMutation.isPending}
                  onClick={async () => {
                    await activatePromptMutation.mutateAsync(prompt.id);
                  }}
                >
                  {prompt.id === activePromptId ? "Activated" : "Activate"}
                </Button>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-white/70">{prompt.promptText}</p>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton
        className="max-w-2xl gap-5 border border-white/10 bg-[#17181C] p-6 text-white shadow-2xl"
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="text-4xl font-semibold tracking-tight text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-xs font-medium tracking-[0.16em] text-white/50">VERSION LABEL</label>
          <Input
            value={versionLabel}
            onChange={(event) => setVersionLabel(event.target.value)}
            placeholder={versionPlaceholder}
            className="h-11 border-white/10 bg-black/75 text-base text-white placeholder:text-white/25 focus-visible:border-[#8F8AFF]/60"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium tracking-[0.16em] text-white/50">PROMPT TEXT</label>
          <textarea
            value={promptText}
            onChange={(event) => setPromptText(event.target.value)}
            placeholder={promptPlaceholder}
            className="min-h-56 w-full resize-y rounded-lg border border-white/10 bg-black/75 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#8F8AFF]/60"
          />
        </div>

        <DialogDescription className="text-xs text-white/45">{helperText}</DialogDescription>

        <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl border-t border-white/5 bg-transparent px-6 py-4">
          <Button
            variant="ghost"
            className="text-white/75"
            onClick={() => setOpen(false)}
            disabled={createPromptMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await createPromptMutation.mutateAsync({
                version: versionLabel,
                prompt_text: promptText,
              });
              setVersionLabel("");
              setPromptText("");
              setOpen(false);
            }}
            disabled={createPromptMutation.isPending || !versionLabel.trim() || !promptText.trim()}
            className="bg-[#8F8AFF] px-6 font-semibold text-[#171823] hover:bg-[#8F8AFF]/90"
          >
            {createPromptMutation.isPending ? "Creating..." : "Create Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </section>
  );
}
