"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Download, Languages, Moon, ShieldAlert, ShieldCheck, Sun, Trash2, TriangleAlert } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { LanguageToggle } from "@/features/translate/components/LanguageToggle";
import { userService } from "@/lib/api/services/user.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAccountResource } from "../hooks/useAccountResource";
import { formatShortDate } from "../lib/format";
import { AccountSwitch, AccountTextarea } from "./AccountControls";
import { AccountShell } from "./AccountShell";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const DELETE_REASONS = ["not_useful", "too_expensive", "privacy", "another_account", "bad_experience", "other"];
const CONFIRM_WORD = "DELETE";

function OptionButton({ active, onClick, icon: Icon, children, lang }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      lang={lang}
      className={cn(
        "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors",
        active ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-gold-500 dark:bg-brand-800 dark:text-gold-300" : "border-line hover:bg-surface-muted"
      )}
    >
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
      {active && <Check className="size-4" aria-hidden />}
    </button>
  );
}

function SettingsSection({ title, description, children, className }) {
  return (
    <Card as="section" className={cn("p-5", className)}>
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function LanguageSetting() {
  return (
    <SettingsSection title="Language" description="Choose the language for the website.">
      <LanguageToggle variant="block" className="max-w-sm" />
    </SettingsSection>
  );
}

function ThemeSetting() {
  const { theme, toggleTheme } = useTheme();
  return (
    <SettingsSection title="Appearance" description="Switch between light and dark mode.">
      <div role="radiogroup" aria-label="Appearance" className="flex gap-2">
        <OptionButton active={theme === "light"} onClick={() => theme !== "light" && toggleTheme()} icon={Sun}>
          Light
        </OptionButton>
        <OptionButton active={theme === "dark"} onClick={() => theme !== "dark" && toggleTheme()} icon={Moon}>
          Dark
        </OptionButton>
      </div>
    </SettingsSection>
  );
}

function PrivacySetting() {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const { data, status, reload, mutate } = useAccountResource(() => userService.getPrivacy());
  const [savingConsent, setSavingConsent] = useState(false);
  const [requesting, setRequesting] = useState(false);
  // A new export can be requested 24 h after the last one (time captured once per visit)
  const [openedAt] = useState(() => Date.now());

  const setConsent = async (value) => {
    setSavingConsent(true);
    mutate((p) => ({ ...p, marketingConsent: value }));
    try {
      await userService.updatePrivacy({ marketingConsent: value });
      toast({ type: "success", title: value ? "Marketing consent given" : "Marketing consent withdrawn" });
    } catch {
      mutate((p) => ({ ...p, marketingConsent: !value }));
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setSavingConsent(false);
    }
  };

  const requestExport = async () => {
    setRequesting(true);
    try {
      const updated = await userService.requestDataExport();
      mutate((p) => ({ ...p, ...(updated || { dataExportRequestedAt: new Date().toISOString() }) }));
      toast({ type: "success", title: "Request received. We'll email you a download link." });
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <SettingsSection title="Privacy & data" description="Your data is processed as per India's Digital Personal Data Protection Act, 2023.">
      {status === "error" ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted p-3 text-sm" role="alert">
          <span>{"Couldn't load this"}</span>
          <Button size="sm" variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-line">
          <div className="flex items-start justify-between gap-4 pb-4">
            <div>
              <p id="marketing-label" className="font-medium">
                Marketing communication
              </p>
              <p className="text-sm text-muted">Allow us to send you offers and promotions by SMS, email and push. You can withdraw consent anytime.</p>
            </div>
            {status === "loading" ? (
              <Skeleton className="h-6 w-11 rounded-full" />
            ) : (
              <AccountSwitch
                checked={Boolean(data?.marketingConsent)}
                onChange={setConsent}
                disabled={savingConsent}
                label="Marketing communication"
              />
            )}
          </div>

          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Download my data</p>
              <p className="text-sm text-muted">
                {data?.dataExportRequestedAt
                  ? `Requested on ${formatShortDate(data.dataExportRequestedAt, locale)}. We'll email a download link within 72 hours.`
                  : "Get a copy of your profile, birth details, sessions and transactions."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={requestExport}
              loading={requesting}
              disabled={status !== "success" || (data?.dataExportRequestedAt && openedAt - new Date(data.dataExportRequestedAt).getTime() < 86400000)}
              className="shrink-0"
            >
              <Download className="size-4" aria-hidden /> Request download
            </Button>
          </div>

          <div className="pt-4">
            <p className="flex gap-2 rounded-xl bg-surface-muted p-3 text-sm text-muted">
              <ShieldCheck className="size-5 shrink-0 text-brand-500" aria-hidden />
              For your safety, chats and calls may be reviewed by our trust &amp; safety team if they are reported or flagged. Astrologers never see your phone number.
            </p>
            <LocaleLink
              href={routes.legal("privacy-policy")}
              className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400"
            >
              Read our Privacy Policy →
            </LocaleLink>
          </div>
        </div>
      )}
    </SettingsSection>
  );
}

function DeleteAccountModal({ open, onClose }) {
  const locale = SITE_LOCALE;
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const balance = user?.walletBalance ?? 0;

  const close = () => {
    if (busy) return;
    setReason("");
    setFeedback("");
    setConfirmation("");
    setError(null);
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) return setError("Select a reason");
    if (confirmation !== CONFIRM_WORD) return;
    setBusy(true);
    try {
      await userService.deleteAccount({ reason, feedback: feedback.trim(), confirmation });
      await logout();
      toast({ id: "account-deleted", type: "success", title: "Your account has been deleted" });
      router.replace("/");
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Delete your account?" dismissible={!busy} className="sm:max-w-lg">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="flex gap-2 rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300" role="alert">
          <TriangleAlert className="size-5 shrink-0" aria-hidden />
          <div className="space-y-1">
            <p>{"This can't be undone. Your profile, birth profiles, saved kundlis and chat history will be erased. Invoices are retained as required by law."}</p>
            {balance > 0 && <p className="font-semibold">{`You have ${formatCurrency(balance, locale)} in your wallet. It will be forfeited and cannot be refunded after deletion.`}</p>}
          </div>
        </div>

        <Field label="Why are you leaving?" htmlFor="del-reason" error={error}>
          <Select
            id="del-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
          >
            <option value="">Select a reason</option>
            {DELETE_REASONS.map((r) => (
              <option key={r} value={r}>
                {t(`account.settings.reasons.${r}`)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={
            <>
              Anything else? <span className="font-normal text-muted">(optional)</span>
            </>
          }
          htmlFor="del-feedback"
        >
          <AccountTextarea
            id="del-feedback"
            rows={3}
            className="min-h-20"
            maxLength={500}
            value={feedback}
            placeholder="Your feedback helps us improve"
            onChange={(e) => setFeedback(e.target.value)}
          />
        </Field>

        <Field label="Type DELETE to confirm" htmlFor="del-confirm" hint="Type the word DELETE in capital letters.">
          <Input
            id="del-confirm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={CONFIRM_WORD}
            className="tabular-nums tracking-widest"
          />
        </Field>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={busy} disabled={confirmation !== CONFIRM_WORD}>
            <Trash2 className="size-4" aria-hidden /> Delete permanently
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function SettingsView() {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <AccountShell title="Settings" subtitle="Language, appearance and privacy.">
      <div className="max-w-3xl space-y-4">
        <LanguageSetting />
        <ThemeSetting />
        <PrivacySetting />

        <SettingsSection title="Delete account" description="Permanently delete your account, birth details, saved profiles and session history." className="border-red-500/30">
          <Button variant="outline" className="border-red-500/40 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onClick={() => setDeleteOpen(true)}>
            <ShieldAlert className="size-4" aria-hidden /> Delete my account
          </Button>
        </SettingsSection>
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </AccountShell>
  );
}
