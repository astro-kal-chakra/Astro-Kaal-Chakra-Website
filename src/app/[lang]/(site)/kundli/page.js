import { routes } from "@/config/routes";
import { KundliTool } from "@/features/tools/components/KundliTool";
import { ToolPageLayout } from "@/features/tools/components/ToolPageLayout";
import { toolMetadata } from "@/features/tools/lib/page";

export const generateMetadata = toolMetadata("kundli", routes.kundli);

export default async function KundliPage({ params }) {
  const { lang } = await params;
  return (
    <ToolPageLayout lang={lang} ns="kundli" navKey="kundli" path={routes.kundli}>
      <KundliTool />
    </ToolPageLayout>
  );
}
