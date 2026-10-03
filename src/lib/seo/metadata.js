import { siteConfig } from "@/config/site";
import { localeTags } from "@/config/locale";

/**
 * Build a Metadata object with canonical URL, Open Graph and Twitter tags.
 * @param {{ locale: string, path: string, title: string|object, description?: string, image?: string, noIndex?: boolean, type?: string }} p
 *   `path` is the site path, e.g. "/astrologers".
 */
export function buildMetadata({ locale = "en", path = "/", title, description, image, noIndex = false, type = "website" }) {
  const plainTitle = typeof title === "string" ? title : title?.absolute;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: plainTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: (localeTags[locale] || "en-IN").replace("-", "_"),
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title: plainTitle, description },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
