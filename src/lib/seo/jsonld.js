import { siteConfig } from "@/config/site";

const abs = (path) => new URL(path, siteConfig.url).toString();

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: abs("/icon.png"),
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
  publisher: { "@type": "Organization", name: siteConfig.name },
});
