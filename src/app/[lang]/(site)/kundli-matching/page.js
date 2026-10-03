import { routes } from "@/config/routes";
import { MatchingTool } from "@/features/tools/components/MatchingTool";
import { ToolPageLayout } from "@/features/tools/components/ToolPageLayout";
import { toolMetadata } from "@/features/tools/lib/page";

export const generateMetadata = toolMetadata("matching", routes.kundliMatching);

export default async function KundliMatchingPage({ params }) {
  const { lang } = await params;
  return (
    <ToolPageLayout
      lang={lang}
      ns="matching"
      navKey="kundliMatching"
      path={routes.kundliMatching}
      cta={{ titleKey: "tools.matching.ctaTitle", textKey: "tools.matching.ctaText" }}
    >
      <MatchingTool />
    </ToolPageLayout>
  );
}
