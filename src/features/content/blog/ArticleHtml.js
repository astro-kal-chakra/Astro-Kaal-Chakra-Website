/**
 * An article written in the dashboard's rich-text editor: the API sends sanitised HTML (only safe tags and
 * styles; embeds limited to YouTube / Vimeo players), so it is rendered as written — headings, text sizes,
 * lists, colours, and images / videos in the middle of the text. Styles: `.article-html` in globals.css.
 */
export function ArticleHtml({ html }) {
  return <div className="article-html" dangerouslySetInnerHTML={{ __html: html }} />;
}
