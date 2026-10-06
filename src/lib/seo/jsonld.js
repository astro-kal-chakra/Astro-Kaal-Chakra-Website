import { siteConfig } from "@/config/site";

const abs = (path) => new URL(path, siteConfig.url).toString();

const ORG_ID = abs("/#organization");

/** Brand identity: lets Google show the logo and link official profiles in the knowledge panel. */
export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: siteConfig.name,
  alternateName: siteConfig.name.replace(/-/g, " "),
  url: siteConfig.url,
  logo: { "@type": "ImageObject", url: abs(siteConfig.logo), width: 512, height: 512 },
  image: abs(siteConfig.ogImage),
  description: siteConfig.description,
  email: siteConfig.supportEmail,
  contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: siteConfig.supportEmail, availableLanguage: ["English", "Hindi"] }],
  ...(siteConfig.socialLinks.length ? { sameAs: siteConfig.socialLinks } : {}),
});

/** Site name in Google results, plus the site search (astrologer search). */
export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": abs("/#website"),
  name: siteConfig.name,
  alternateName: siteConfig.name.replace(/-/g, " "),
  url: siteConfig.url,
  inLanguage: "en-IN",
  publisher: { "@id": ORG_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${abs("/astrologers")}?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

export const astrologerJsonLd = (a, locale) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: a.name,
  jobTitle: "Astrologer",
  url: abs(`/astrologers/${a.slug}`),
  knowsLanguage: a.languages,
  knowsAbout: a.specialties,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: a.rating,
    reviewCount: a.reviewCount,
    bestRating: 5,
  },
});

export const faqJsonLd = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const breadcrumbJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});

export const articleJsonLd = ({ title, description, path, datePublished, dateModified }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  url: abs(path),
  datePublished,
  dateModified: dateModified || datePublished,
  image: abs(siteConfig.ogImage),
  author: { "@id": ORG_ID },
  publisher: { "@type": "Organization", "@id": ORG_ID, name: siteConfig.name, logo: { "@type": "ImageObject", url: abs(siteConfig.logo) } },
});
