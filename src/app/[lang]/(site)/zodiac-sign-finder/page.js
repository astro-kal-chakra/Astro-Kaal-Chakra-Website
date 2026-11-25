import { routes } from "@/config/routes";
import { ToolPageLayout } from "@/features/tools/components/ToolPageLayout";
import { ZodiacFinderTool } from "@/features/tools/components/ZodiacFinderTool";
import { ZodiacGuide } from "@/features/tools/components/ZodiacGuide";
import { toolMetadata } from "@/features/tools/lib/page";

export const generateMetadata = toolMetadata("zodiac", routes.zodiacFinder);

export default async function ZodiacFinderPage({ params }) {
  const { lang } = await params;
  return (
    // The H1 is the most-searched question ("what is my zodiac sign by date of birth"); the guide answers the rest
    <ToolPageLayout lang={lang} ns="zodiac" navKey="zodiacFinder" path={routes.zodiacFinder} heading="What Is My Zodiac Sign? Find It by Date of Birth">
      <ZodiacFinderTool />
      <ZodiacGuide />
    </ToolPageLayout>
  );
}
