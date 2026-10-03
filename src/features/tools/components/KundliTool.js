"use client";

import { useRef, useState } from "react";
import { Pencil, ScrollText } from "lucide-react";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EMPTY_BIRTH } from "../lib/constants";
import { isoDateIn } from "../lib/format";
import { validateBirth } from "../lib/validate";
import { BirthFields } from "./BirthFields";
import { KundliCharts } from "./KundliCharts";
import { KundliDasha } from "./KundliDasha";
import { KundliBasic, KundliPlanets } from "./KundliDetails";
import { KundliSaveActions } from "./KundliSaveActions";
import { MockNotice } from "./MockNotice";
import { ToolTabs, useToolTabs } from "./ToolTabs";
import { label as t } from "@/lib/labels";

const TABS = ["basic", "charts", "planets", "dasha"];

export function KundliTool() {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_BIRTH);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [kundli, setKundli] = useState(null);
  const [tab, setTab] = useState("basic");
  const [today] = useState(() => isoDateIn(new Date()));
  const ids = useToolTabs();
  const resultsRef = useRef(null);
  const formRef = useRef(null);

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validateBirth(form, { today });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const result = await astroToolsService.generateKundli(form);
      setKundli(result);
      setTab("basic");
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch {
      toast({ type: "error", title: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const panels = {
    basic: () => <KundliBasic kundli={kundli} />,
    charts: () => <KundliCharts kundli={kundli} />,
    planets: () => <KundliPlanets kundli={kundli} />,
    dasha: () => <KundliDasha dasha={kundli.dasha} />,
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card as="section" ref={formRef} aria-labelledby="kundli-form-title" className="p-5 sm:p-6 lg:sticky lg:top-20">
        <h2 id="kundli-form-title" className="mb-4 font-display text-lg font-semibold">
          Enter birth details
        </h2>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <BirthFields idPrefix="kundli" value={form} onChange={update} errors={errors} maxDate={today} />
          <Button type="submit" variant="gold" size="lg" loading={loading} className="w-full">
            Generate Kundli
          </Button>
        </form>
      </Card>

      <section ref={resultsRef} aria-live="polite" className="min-w-0 scroll-mt-20 space-y-4">
        {!kundli ? (
          <Card className="border-dashed">
            <EmptyState icon={ScrollText} title="Your Kundli" description="Fill in your birth details to see your charts, planets and dasha here." />
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">
                {kundli.input.name ? `Kundli of ${kundli.input.name}` : "Your Kundli"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="lg:hidden"
              >
                <Pencil className="size-4" aria-hidden /> Edit details
              </Button>
            </div>
            <MockNotice show={kundli.isMock} />
            <ToolTabs
              tabs={TABS.map((id) => ({ id, label: t(`tools.kundli.tabs.${id}`) }))}
              active={tab}
              onChange={setTab}
              label="Kundli sections"
              ids={ids}
            />
            {TABS.map((id) => (
              <div key={id} role="tabpanel" id={ids.panelId(id)} aria-labelledby={ids.tabId(id)} hidden={tab !== id} tabIndex={0}>
                {tab === id && panels[id]()}
              </div>
            ))}
            <KundliSaveActions input={kundli.input} />
          </>
        )}
      </section>
    </div>
  );
}
