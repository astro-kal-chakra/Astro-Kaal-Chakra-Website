const text = (html) => html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

/**
 * The page already has the post title as its only <h1>. Authors often start the article with the title again
 * as an <h1>: drop it when it repeats the title, and turn any other <h1> into an <h2> (one h1 per page).
 */
export function normalizeHeadings(html, title) {
  if (!html) return html;
  let out = html;
  const first = out.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (first && title && text(first[1]) === text(title)) out = out.replace(first[0], "");
  return out.replace(/<h1(\b[^>]*)>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>");
}

/**
 * An article written in the dashboard's rich-text editor: the API sends sanitised HTML (only safe tags and
 * styles; embeds limited to YouTube / Vimeo players), so it is rendered as written — headings, text sizes,
 * lists, colours, and images / videos in the middle of the text. Styles: `.article-html` in globals.css.
 * `title` = the post title, used to remove a repeated <h1> (see normalizeHeadings).
 */
export function ArticleHtml({ html, title }) {
  return <div className="article-html" dangerouslySetInnerHTML={{ __html: normalizeHeadings(html, title) }} />;
}
