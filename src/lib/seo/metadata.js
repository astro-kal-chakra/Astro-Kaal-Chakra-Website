import { siteConfig } from "@/config/site";
import { localeTags } from "@/config/locale";

/**
 * Build a Metadata object with canonical URL, Open Graph and Twitter tags.
 * @param {{ locale: string, path: string, title: string|object, description?: string, image?: string, noIndex?: boolean, type?: string }} p
 *   `path` is the site path, e.g. "/astrologers".
 */
export function buildMetadata({ locale = "en", path = "/", title, description, image, noIndex = false, type = "website" }) {
  const plainTitle = typeof title === "string" ? title : title?.absolute;
  const images = [{ url: image || siteConfig.ogImage, width: 1200, height: 630, alt: plainTitle || siteConfig.name }];

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
      images,
    },
    twitter: { card: "summary_large_image", title: plainTitle, description, images: images.map((i) => i.url) },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
