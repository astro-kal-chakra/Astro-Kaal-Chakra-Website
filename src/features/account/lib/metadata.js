import "server-only";
import { label as t } from "@/lib/labels";

/** Localised <title> for account pages: export const generateMetadata = accountMetadata("profile"); */
export const accountMetadata =
  (key) =>
  async ({ params }) => {
    const { lang } = await params;
    return { title: t(`account.meta.${key}`) };
  };
