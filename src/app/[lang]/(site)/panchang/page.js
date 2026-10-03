import { routes } from "@/config/routes";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { PanchangTool } from "@/features/tools/components/PanchangTool";
import { ToolPageLayout } from "@/features/tools/components/ToolPageLayout";
import { DEFAULT_CITY } from "@/features/tools/lib/constants";
import { IST, isoDateIn } from "@/features/tools/lib/format";
import { toolMetadata } from "@/features/tools/lib/page";

// Re-render hourly so "today" rolls over (IST) without a redeploy.
export const revalidate = 3600;

export const generateMetadata = toolMetadata("panchang", routes.panchang);

export default async function PanchangPage({ params }) {
  const { lang } = await params;
  const today = isoDateIn(new Date(), IST);
  // Server-render today's Panchang for the default city so the content is crawlable.
  const initialData = await astroToolsService.getPanchang({ date: today, place: DEFAULT_CITY });
  return (
    <ToolPageLayout lang={lang} ns="panchang" navKey="panchang" path={routes.panchang}>
      <PanchangTool initialData={initialData} initialDate={today} defaultCity={DEFAULT_CITY} />
    </ToolPageLayout>
  );
}
