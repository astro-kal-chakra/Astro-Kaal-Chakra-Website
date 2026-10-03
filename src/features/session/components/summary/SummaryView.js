"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, Clock, Heart, LifeBuoy, MessageCircle, Phone, RotateCcw, Star, Video, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { sessionService } from "@/lib/api/services/session.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { RatingStars } from "@/components/ui/RatingStars";
import { REVIEW_MAX_LENGTH } from "../../lib/sessionEvents";
import { SessionScreenState } from "../SessionParts";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const MODE_ICONS = { chat: MessageCircle, video: Video, voice: Phone };

function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset>
      <legend className="sr-only">Rating</legend>
      <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            onMouseEnter={() => setHover(n)}
            className="cursor-pointer rounded-full p-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
          >
            <input
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            <span className="sr-only">{t(`session.summary.ratingLabels.${n}`)}</span>
            <Star
              className={cn(
                "size-10 transition-transform",
                n <= shown ? "scale-105 fill-gold-500 text-gold-500" : "text-line dark:text-brand-700"
              )}
              aria-hidden
            />
          </label>
        ))}
      </div>
      <p className="mt-1 h-5 text-center text-sm font-medium text-muted" aria-live="polite">
        {shown ? t(`session.summary.ratingLabels.${shown}`) : ""}
      </p>
    </fieldset>
  );
}

function ReviewForm({ sessionId, astrologer, initialReview }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState(initialReview);
  const [error, setError] = useState("");

  if (review) {
    return (
      <div className="flex flex-col items-center py-2 text-center" role="status">
        <CheckCircle2 className="size-12 text-online" aria-hidden />
        <p className="mt-3 text-lg font-semibold">Thanks for your feedback!</p>
        <p className="mt-1 text-sm text-muted">{`Your review helps others find the right astrologer and helps ${astrologer.name} improve.`}</p>
        <RatingStars value={review.rating} size={20} className="mt-3" />
        {review.text && <p className="mt-2 max-w-sm text-sm italic text-muted">“{review.text}”</p>}
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      setReview(await sessionService.submitReview(sessionId, { rating, text: text.trim() }));
    } catch {
      toast({ type: "error", title: "Something went wrong", message: "Please try again. If the problem continues, contact support." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-center text-lg font-semibold">{`How was your session with ${astrologer.name}?`}</h2>
      <div className="mt-3">
        <StarRatingInput
          value={rating}
          onChange={(n) => {
            setRating(n);
            setError("");
          }}
        />
        {error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
      <label htmlFor="review-text" className="mt-4 block text-sm font-medium">
        Write a review <span className="font-normal text-muted">(optional)</span>
      </label>
      <textarea
        id="review-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, REVIEW_MAX_LENGTH))}
        maxLength={REVIEW_MAX_LENGTH}
        placeholder="What did you like? Was the guidance helpful?"
        aria-describedby="review-count"
        className="mt-1.5 w-full resize-none rounded-xl border border-line bg-surface p-3 text-base text-fg placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <p id="review-count" className="text-right text-xs text-muted">
        {text.length}/{REVIEW_MAX_LENGTH}
      </p>
      <p className="mt-1 text-xs text-muted">{"Reviews are public and shown with your first name only. Don't include contact details."}</p>
      <Button type="submit" size="lg" className="mt-4 w-full" loading={submitting}>
        Submit review
      </Button>
    </form>
  );
}

function FollowButton({ astrologer }) {
  const { toast } = useToast();
  const [following, setFollowing] = useState(Boolean(astrologer.isFollowing));
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      const next = !following;
      await astrologerService.follow(astrologer.id, next);
      setFollowing(next);
      if (next) toast({ type: "success", title: `You're now following ${astrologer.name}` });
    } catch {
      toast({ type: "error", title: "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="outline" size="lg" onClick={toggle} loading={busy} aria-pressed={following} className="w-full">
      <Heart className={cn("size-4", following && "fill-red-500 text-red-500")} aria-hidden />
      {following ? "Following" : "Follow"}
    </Button>
  );
}

export function SummaryView({ sessionId }) {
  const locale = SITE_LOCALE;
  const [data, setData] = useState(undefined);

  useEffect(() => {
    let alive = true;
    sessionService
      .getSummary(sessionId)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [sessionId]);

  if (data === undefined) return <SessionScreenState loading />;
  if (!data?.session) {
    return <SessionScreenState title="Session not found" text="This session doesn't exist or has expired. You can start a new consultation any time." />;
  }

  const s = data.session;
  const a = s.astrologer;
  const ModeIcon = MODE_ICONS[s.mode] || MessageCircle;
  const started = Boolean(s.startedAt) && (s.duration || 0) > 0;
  const free = s.isFree && !s.charged;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-lg px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
        <div className="text-center">
          <Badge tone="success">
            <CheckCircle2 className="size-3.5" aria-hidden />
            Session completed
          </Badge>
          <h1 className="mt-3 font-display text-2xl font-semibold">Session summary</h1>
          {s.endReason && s.endReason !== "user" && (
            <p className="mt-1 text-sm text-muted">{t(`session.summary.reason.${s.endReason}`, { name: a.name })}</p>
          )}
        </div>

        <Card className="mt-5 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={a.avatarUrl} name={a.name} size={56} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{a.name}</p>
              <p className="flex items-center gap-1 text-sm text-muted">
                <ModeIcon className="size-3.5" aria-hidden />
                {t(`session.modes.${s.mode}`)}
                {s.endedAt && (
                  <>
                    <span aria-hidden>·</span>
                    {formatDate(s.endedAt, locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </>
                )}
              </p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface-muted p-3">
              <dt className="flex items-center justify-center gap-1 text-xs text-muted">
                <Clock className="size-3.5" aria-hidden /> Duration
              </dt>
              <dd className="mt-0.5 font-bold tabular-nums">{formatDuration(s.duration || 0)}</dd>
            </div>
            <div className="rounded-xl bg-surface-muted p-3">
              <dt className="flex items-center justify-center gap-1 text-xs text-muted">
                <Wallet className="size-3.5" aria-hidden /> Charged
              </dt>
              <dd className="mt-0.5 font-bold">
                {free ? <span className="text-online">FREE</span> : formatCurrency(s.charged || 0, locale)}
              </dd>
            </div>
            <div className="rounded-xl bg-surface-muted p-3">
              <dt className="flex items-center justify-center gap-1 text-xs text-muted">
                <CalendarClock className="size-3.5" aria-hidden /> Rate
              </dt>
              <dd className="mt-0.5 font-bold">
                {formatCurrency(s.ratePerMin, locale)}
                <span className="text-xs font-normal text-muted">/min</span>
              </dd>
            </div>
          </dl>
          {s.isFree && s.charged > 0 && (
            <p className="mt-3 text-xs text-muted">{`Includes your ${Math.round((s.freeSeconds || 0) / 60)} free minutes. Only the time after that was charged.`}</p>
          )}
          {s.endBalance != null && (
            <p className="mt-3 text-sm text-muted">
              Wallet balance now:{" "}
              <span className="font-semibold text-fg">{formatCurrency(s.endBalance, locale)}</span>
            </p>
          )}
        </Card>

        <Card className="mt-4 p-5">
          {started ? (
            <ReviewForm sessionId={sessionId} astrologer={a} initialReview={data.review} />
          ) : (
            <p className="text-center text-sm text-muted">{"This session didn't start, so you were not charged."}</p>
          )}
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <ButtonLink href={`${routes.consult}?astrologer=${a.slug}&mode=${s.mode}`} size="lg" variant="gold" className="w-full">
            <RotateCcw className="size-4" aria-hidden />
            Rebook
          </ButtonLink>
          <FollowButton astrologer={a} />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <LocaleLink href={routes.astrologers} className="font-semibold text-brand-600 hover:underline dark:text-gold-400">
            Browse astrologers
          </LocaleLink>
          <LocaleLink href={routes.support} className="inline-flex items-center gap-1 text-muted hover:text-fg">
            <LifeBuoy className="size-4" aria-hidden />
            Report a problem with this session
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
