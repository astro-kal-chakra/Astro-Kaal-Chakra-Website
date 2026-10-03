"use client";

import { useState } from "react";
import { Download, Save } from "lucide-react";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/context/AuthProvider";

/** Save to account / download PDF — both gated behind login via requireAuth. */
export function KundliSaveActions({ input }) {
  const { toast } = useToast();
  const { requireAuth } = useAuth();
  const [busy, setBusy] = useState(null); // "save" | "pdf" | null

  const run = (kind, task) =>
    requireAuth(async () => {
      setBusy(kind);
      try {
        await task();
      } catch {
        toast({ type: "error", title: "Something went wrong. Please try again." });
      } finally {
        setBusy(null);
      }
    }, "save");

  const save = () =>
    run("save", async () => {
      await astroToolsService.saveKundli(input);
      toast({ type: "success", title: "Kundli saved", message: "You can find it later in your account under Saved Kundlis." });
    });

  const download = () =>
    run("pdf", async () => {
      const { url } = await astroToolsService.downloadKundliPdf(input);
      if (url) window.open(url, "_blank", "noopener");
      else toast({ type: "info", title: "PDF is being prepared", message: "PDF download will be available once our servers are connected." });
    });

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <h3 className="font-semibold">Save or download your Kundli</h3>
        <p className="mt-0.5 text-sm text-muted">Log in to save this Kundli to your account and download a printable PDF.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={save} loading={busy === "save"} disabled={Boolean(busy)}>
          {busy !== "save" && <Save className="size-4" aria-hidden />} Save Kundli
        </Button>
        <Button variant="outline" onClick={download} loading={busy === "pdf"} disabled={Boolean(busy)}>
          {busy !== "pdf" && <Download className="size-4" aria-hidden />} Download PDF
        </Button>
      </div>
    </Card>
  );
}
