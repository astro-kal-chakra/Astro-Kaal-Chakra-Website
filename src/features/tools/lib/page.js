import { buildMetadata } from "@/lib/seo/metadata";
import { label as t } from "@/lib/labels";

/** generateMetadata factory for a tool page: title/description come from tools.<ns>.meta*. */
export function toolMetadata(ns, path) {
  return async function generateMetadata({ params }) {
    const { lang } = await params;
    return buildMetadata({
      locale: lang,
      path,
      title: t(`tools.${ns}.metaTitle`),
      description: t(`tools.${ns}.metaDescription`),
    });
  };
}
