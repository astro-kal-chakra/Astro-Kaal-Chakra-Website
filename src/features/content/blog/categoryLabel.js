import { label as t } from "@/lib/labels";

/**
 * Display name for a blog category. Known categories use the translated label; a category created
 * in the dashboard that the website has no label for (e.g. "Basics") shows its own name instead of
 * the raw lookup key.
 */
export function blogCategoryLabel(category) {
  if (!category) return "";
  const key = `content.blog.categories.${category}`;
  const value = t(key);
  if (value !== key) return value;
  return String(category)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
