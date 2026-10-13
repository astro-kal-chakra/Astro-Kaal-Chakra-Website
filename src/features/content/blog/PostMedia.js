"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { env } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { BlogCover } from "./BlogCover";

const urlOf = (v) => (typeof v === "string" ? v : v?.url || v?.src || "");

/** Relative backend paths (e.g. /uploads/x.jpg) are served by the API host. */
function absolute(src) {
  if (!src || /^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  if (env.apiUrl && src.startsWith("/")) return new URL(src, new URL(env.apiUrl).origin).toString();
  return src;
}

/** Only backend uploads are configured for next/image optimisation; anything else is shown as-is. */
function optimizable(src) {
  try {
    return Boolean(env.apiUrl) && new URL(src).host === new URL(env.apiUrl).host && new URL(src).pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

/**
 * A post's media, from whatever the dashboard set: a video (`video`/`videoUrl`/`coverVideo`),
 * an image (`coverImage`), or nothing.
 * @returns {{ type: "video", src: string, poster: string, youtubeId: string|null } | { type: "image", src: string } | null}
 */
export function postMedia(post) {
  const image = absolute(urlOf(post?.coverImage));
  const video = absolute(urlOf(post?.video || post?.videoUrl || post?.coverVideo));
  if (video) return { type: "video", src: video, poster: image, youtubeId: video.match(YOUTUBE)?.[1] || null };
  if (image) return { type: "image", src: image };
  return null;
}

/**
 * Cover area of a blog card. Video → poster with a centred play button (plays inline when `interactive`);
 * image → the image; neither → the illustrated gradient cover (BlogCover), as before.
 */
export function PostMedia({ post, size = "md", interactive = false, priority = false, className }) {
  const media = postMedia(post);
  const [playing, setPlaying] = useState(false);
  const box = cn("relative overflow-hidden bg-surface-muted", size === "lg" ? "aspect-[16/10]" : "aspect-[16/9]", className);

  if (!media) return <BlogCover cover={post.cover} size={size} className={className} />;

  const picture = (src) => (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      unoptimized={!optimizable(src)}
      sizes={size === "lg" ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
      className="object-cover"
    />
  );

  if (media.type === "image") return <div className={box}>{picture(media.src)}</div>;

  // Video, playing inline
  if (playing) {
    return (
      <div className={cn(box, "bg-black")}>
        {media.youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=1&rel=0`}
            title={post.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <video src={media.src} poster={media.poster || undefined} controls autoPlay playsInline className="absolute inset-0 size-full object-contain" />
        )}
      </div>
    );
  }

  // Video, not playing: poster (image or the illustrated cover) + centred play button
  const poster = media.poster ? picture(media.poster) : <BlogCover cover={post.cover} size={size} className="absolute inset-0 aspect-auto size-full" />;
  const playIcon = (
    <span className="relative flex size-16 items-center justify-center rounded-full bg-white/95 text-brand-700 shadow-xl ring-4 ring-white/30 transition group-hover/media:scale-110 sm:size-20">
      <Play className="ml-1 size-7 fill-current sm:size-9" aria-hidden />
    </span>
  );

  if (!interactive) {
    return (
      <div className={box}>
        {poster}
        <span className="absolute inset-0 flex items-center justify-center bg-black/15">{playIcon}</span>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${post.title}`} className={cn(box, "group/media block w-full text-left")}>
      {poster}
      <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover/media:bg-black/30">{playIcon}</span>
    </button>
  );
}
