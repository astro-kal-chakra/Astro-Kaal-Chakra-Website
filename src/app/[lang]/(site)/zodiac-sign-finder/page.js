import { routes } from "@/config/routes";
import { ToolPageLayout } from "@/features/tools/components/ToolPageLayout";
import { ZodiacFinderTool } from "@/features/tools/components/ZodiacFinderTool";
import { toolMetadata } from "@/features/tools/lib/page";

export const generateMetadata = toolMetadata("zodiac", routes.zodiacFinder);

export default async function ZodiacFinderPage({ params }) {
  const { lang } = await params;
  return (
    <ToolPageLayout lang={lang} ns="zodiac" navKey="zodiacFinder" path={routes.zodiacFinder}>
      <ZodiacFinderTool />
    </ToolPageLayout>
  );
}
