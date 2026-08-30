/**
 * Reusable Schema.org definitions for professional SEO.
 * These help Google understand the nature of your application and its content.
 */

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Investment Portfolio Pro",
    "url": "https://yourdomain.com",
    "logo": "https://yourdomain.com/logo.png",
    "sameAs": [
        "https://facebook.com/yourpage",
        "https://twitter.com/yourprofile",
        "https://linkedin.com/company/yourcompany"
    ]
};

export const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Investment Portfolio Management UI",
    "url": "https://yourdomain.com",
    "description": "Professional tool for tracking and analyzing investment portfolios with real-time data.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
    }
};

export const getBreadcrumbSchema = (items: { name: string; item: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((i, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": i.name,
        "item": `https://yourdomain.com${i.item}`
    }))
});

export const financialServiceSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Investment Portfolio Pro",
    "description": "Premium investment tracking and analytics services.",
    "url": "https://yourdomain.com",
    "priceRange": "$$"
};
