export function softwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ServiceOS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "All-in-one field service management software. Manage leads, jobs, invoices, and more.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0",
      offerCount: "4",
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

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  author?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author || "ServiceOS Team",
    },
    publisher: {
      "@type": "Organization",
      name: "ServiceOS",
    },
    ...(post.image ? { image: post.image } : {}),
  };
}

export function offerSchema(tier: string, price: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `ServiceOS ${tier}`,
    price: price.toString(),
    priceCurrency: "USD",
    priceValidUntil: new Date(
      new Date().getFullYear() + 1,
      0,
      1
    ).toISOString().split("T")[0],
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: "ServiceOS",
    },
  };
}
