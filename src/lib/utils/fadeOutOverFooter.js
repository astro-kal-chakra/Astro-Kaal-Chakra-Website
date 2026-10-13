/**
 * Fades a fixed, full-screen page background (zodiac wheel, starfield) out while the site footer is on
 * screen — the footer has its own animation, so the two would otherwise overlap — and back in when the
 * footer scrolls away. Uses inline opacity, so any opacity set by classes comes back untouched.
 * @param {HTMLElement} el
 * @returns {() => void} cleanup
 */
export function fadeOutOverFooter(el) {
  const footer = document.querySelector("footer");
  if (!el || !footer || !("IntersectionObserver" in window)) return () => {};
  el.style.transition = "opacity 600ms ease";
  const io = new IntersectionObserver(([entry]) => {
    el.style.opacity = entry.isIntersecting ? "0" : "";
  });
  io.observe(footer);
  return () => io.disconnect();
}
