"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * rgb strings. Dark = a deep night sky (many soft glowing stars).
 * Light = a warm "dawn sky": fewer, crisper stars, more sparkles in amber/gold and a
 * peach–gold nebula (no cool tones) — soft glowing dots on cream read as dust, so light mode avoids them.
 */
const PALETTES = {
  light: {
    stars: ["217,119,6", "234,88,12", "194,65,12", "202,138,4"],
    nebula: [["251,146,60", 0.15], ["252,211,77", 0.15], ["253,186,116", 0.12]],
    line: "180,83,9",
    lineAlpha: 0.38,
    glow: "251,146,60",
    glowAlpha: 0.12,
    starAlpha: 0.95,
    meteor: "217,119,6",
    halo: 0.08, // tight glow: crisp points, not blurry specks
    show: 0.55, // share of stars drawn
    sparkle: 0.45, // share of near/mid stars with a 4-point sparkle
  },
  dark: {
    stars: ["253,186,116", "252,211,77", "255,237,213", "255,255,255"],
    nebula: [["251,138,60", 0.16], ["252,211,77", 0.09], ["139,92,246", 0.15]],
    line: "253,186,116",
    lineAlpha: 0.3,
    glow: "253,186,116",
    glowAlpha: 0.12,
    starAlpha: 0.9,
    meteor: "255,237,213",
    halo: 0.22,
    show: 1,
    sparkle: 0.2,
  },
};

/** Round glow, pre-rendered once per colour (much cheaper than canvas shadowBlur every frame). */
function makeSprite(rgb, halo) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.16, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.4, `rgba(${rgb},${halo})`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/**
 * Night-sky background: drifting nebula glow, three depth layers of twinkling stars (the
 * brightest with a four-point sparkle), occasional shooting stars, pointer parallax and a
 * soft glow that lights up and links the stars near the pointer (mouse or touch).
 * Plain canvas, no library. Fewer stars on small screens, paused when the tab is hidden
 * (and, when `contained`, while scrolled out of view), a still sky for reduced motion.
 * @param {{ contained?: boolean, density?: number, darkOnly?: boolean, className?: string }} p
 *   default: fixed to the viewport (cost doesn't grow with page length) — page backgrounds.
 *   `contained`: fills its positioned parent (e.g. a hero). `density` scales the star count.
 *   `darkOnly`: draws (and runs) only while the dark theme is on.
 */
export function ParticleField({ contained = false, density = 1, darkOnly = false, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const host = contained ? canvas.parentElement : null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, active: false };
    const parallax = { x: 0, y: 0 };
    let w = 0;
    let h = 0;
    let stars = [];
    let meteors = [];
    let nextMeteor = 0;
    let raf = 0;
    let visible = true;
    let palette = PALETTES.light;
    let sprites = [];

    const readTheme = () => {
      palette = document.documentElement.classList.contains("dark") ? PALETTES.dark : PALETTES.light;
      sprites = palette.stars.map((rgb) => makeSprite(rgb, palette.halo));
    };

    const makeStar = (sw, sh) => {
      const z = Math.random() < 0.55 ? 0.3 + Math.random() * 0.25 : Math.random() < 0.7 ? 0.55 + Math.random() * 0.25 : 0.8 + Math.random() * 0.2;
      return {
        x: Math.random() * sw,
        y: Math.random() * sh,
        z, // depth: far stars are small, dim, slow and move least with parallax
        r: 0.7 + z * 1.9,
        c: Math.floor(Math.random() * 4),
        pick: Math.random(), // compared with palette.show / palette.sparkle, so a theme switch needs no rebuild
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.02,
        drift: (Math.random() - 0.5) * 0.12,
      };
    };

    /**
     * Size the canvas to its box. Existing stars are kept and rescaled — never re-randomised —
     * so a resize (incl. the phone address bar showing/hiding while scrolling) can't make the sky "jump".
     * @returns {boolean} whether the size actually changed
     */
    const resize = () => {
      const nw = contained ? host.clientWidth : window.innerWidth;
      const nh = contained ? host.clientHeight : window.innerHeight;
      if (!nw || !nh || (nw === w && nh === h)) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: sharp enough, cheap on 3x phones
      canvas.width = Math.round(nw * dpr);
      canvas.height = Math.round(nh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stars.length) {
        const sx = nw / w;
        const sy = nh / h;
        for (const s of stars) {
          s.x *= sx;
          s.y *= sy;
        }
      }
      w = nw;
      h = nh;
      // by screen area: ~60 stars on phones, up to ~170 on large desktops — only top up / trim on big changes
      const count = Math.round(Math.min(170, Math.max(60, (w * h) / 7500)) * density);
      if (!stars.length || Math.abs(count - stars.length) / stars.length > 0.3) {
        while (stars.length < count) stars.push(makeStar(w, h));
        stars.length = Math.min(stars.length, count);
      }
      return true;
    };

    const drawNebula = (t) => {
      const R = Math.max(w, h) * 0.55;
      const base = [
        [0.18, 0.22],
        [0.85, 0.35],
        [0.5, 0.88],
      ];
      palette.nebula.forEach(([rgb, a], i) => {
        const x = base[i][0] * w + Math.sin(t * 0.00012 + i * 2.1) * w * 0.07;
        const y = base[i][1] * h + Math.cos(t * 0.0001 + i * 1.7) * h * 0.06;
        const g = ctx.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, `rgba(${rgb},${a})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
    };

    const drawSparkle = (x, y, len, alpha, angle, rgb) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = `rgba(${rgb},${alpha})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
      ctx.moveTo(0, -len);
      ctx.lineTo(0, len);
      ctx.stroke();
      ctx.restore();
    };

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5;
      const speed = 7 + Math.random() * 4;
      meteors.push({
        x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
        y: Math.random() * h * 0.35,
        vx: (fromLeft ? 1 : -1) * speed,
        vy: speed * 0.45,
        life: 1,
      });
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      drawNebula(t);

      const small = w < 640;
      const REACH = small ? 120 : 170;
      // ease the parallax towards the pointer (in px; near stars move most)
      const tx = pointer.active ? (pointer.x - w / 2) * -0.04 : 0;
      const ty = pointer.active ? (pointer.y - h / 2) * -0.04 : 0;
      parallax.x += (tx - parallax.x) * 0.05;
      parallax.y += (ty - parallax.y) * 0.05;

      // soft glow following the pointer
      if (pointer.active) {
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, REACH * 1.2);
        g.addColorStop(0, `rgba(${palette.glow},${palette.glowAlpha})`);
        g.addColorStop(1, `rgba(${palette.glow},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      const near = [];
      for (const s of stars) {
        if (!reduced) {
          s.y -= 0.04 + s.z * 0.12; // slow rise, nearer stars faster
          s.x += s.drift * s.z;
          if (s.y < -12) {
            s.y = h + 12;
            s.x = Math.random() * w;
          }
          if (s.x < -12) s.x = w + 12;
          if (s.x > w + 12) s.x = -12;
          s.phase += s.speed;
        }
        if (s.pick > palette.show) continue; // light mode draws fewer stars
        const x = s.x + parallax.x * s.z;
        const y = s.y + parallax.y * s.z;
        let a = palette.starAlpha * (0.25 + 0.75 * s.z) * (0.45 + 0.55 * Math.abs(Math.sin(s.phase)));
        if (pointer.active) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          if (d < REACH) {
            a = Math.min(1, a + 0.5 * (1 - d / REACH)); // stars light up near the pointer
            if (s.z > 0.5) near.push({ x, y, d });
          }
        }
        const size = s.r * 4;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[s.c], x - size, y - size, size * 2, size * 2);
        // 4-point sparkle on a share of the nearer stars (more of them in light mode)
        if (s.z > 0.6 && s.pick < palette.show * palette.sparkle) {
          drawSparkle(x, y, s.r * (2.6 + 1.6 * Math.abs(Math.sin(s.phase))), a * 0.85, s.phase * 0.2, palette.stars[s.c]);
        }
      }
      ctx.globalAlpha = 1;

      // constellation: link the bright stars around the pointer
      if (near.length > 1) {
        ctx.lineWidth = 0.7;
        const LINK = small ? 80 : 110;
        for (let i = 0; i < near.length; i++) {
          for (let j = i + 1; j < near.length; j++) {
            const d = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y);
            if (d > LINK) continue;
            const fade = (1 - d / LINK) * (1 - Math.max(near[i].d, near[j].d) / REACH);
            ctx.strokeStyle = `rgba(${palette.line},${(palette.lineAlpha * fade).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(near[i].x, near[i].y);
            ctx.lineTo(near[j].x, near[j].y);
            ctx.stroke();
          }
        }
      }

      // shooting stars
      if (!reduced) {
        if (t > nextMeteor) {
          if (nextMeteor) spawnMeteor();
          nextMeteor = t + 3500 + Math.random() * 5500;
        }
        meteors = meteors.filter((m) => m.life > 0 && m.x > -200 && m.x < w + 200 && m.y < h + 200);
        for (const m of meteors) {
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 0.012;
          const tail = 16;
          const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
          g.addColorStop(0, `rgba(${palette.meteor},${(0.9 * m.life).toFixed(3)})`);
          g.addColorStop(1, `rgba(${palette.meteor},0)`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
          ctx.stroke();
        }
      }
    };

    const loop = (t) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (darkOnly && palette !== PALETTES.dark) {
        ctx.clearRect(0, 0, w, h); // light theme: nothing drawn, no frame loop
        return;
      }
      if (reduced) draw(0);
      else if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      // canvas-relative, so a contained field works wherever it sits on the page
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= w && pointer.y <= h;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (resize()) start();
      }, 100);
    };

    readTheme();
    resize();
    start();
    const themeObserver = new MutationObserver(() => {
      readTheme();
      start();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Contained: follow the host's size, and only animate while it's on screen.
    const sizeObserver = contained ? new ResizeObserver(onResize) : null;
    sizeObserver?.observe(host);
    const viewObserver = contained
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else cancelAnimationFrame(raf);
        })
      : null;
    viewObserver?.observe(host);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onLeave, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    if (!contained) window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      themeObserver.disconnect();
      sizeObserver?.disconnect();
      viewObserver?.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [contained, density, darkOnly]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      // size-full: the canvas always fills its box (CSS stretches it while a resize settles — never a gap)
      className={cn("pointer-events-none size-full", contained ? "absolute inset-0" : "fixed inset-0 -z-10", className)}
    />
  );
}
