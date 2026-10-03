import { routes } from "@/config/routes";
import { NumerologyTool } from "@/features/tools/components/NumerologyTool";
import { ToolPageLayout } from "@/features/tools/components/ToolPageLayout";
import { toolMetadata } from "@/features/tools/lib/page";

export const generateMetadata = toolMetadata("numerology", routes.numerology);

export default async function NumerologyPage({ params }) {
  const { lang } = await params;
  return (
    <ToolPageLayout lang={lang} ns="numerology" navKey="numerology" path={routes.numerology}>
      <NumerologyTool />
    </ToolPageLayout>
  );
}
