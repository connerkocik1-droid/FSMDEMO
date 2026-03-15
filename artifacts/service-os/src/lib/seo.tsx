export function softwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ServiceOS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Field service management software with AI dispatch, GPS tracking, invoicing, scheduling, CRM, and referral network for service businesses.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "349",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "150",
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
