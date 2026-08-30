import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogType?: string;
    ogImage?: string;
    twitterCard?: string;
    canonical?: string;
    schema?: object | object[];
}

export const SEO = ({
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogType = 'website',
    ogImage = 'https://yourdomain.com/og-image.jpg',
    twitterCard = 'summary_large_image',
    canonical,
    schema,
}: SEOProps) => {
    const siteTitle = 'Investment Portfolio Management';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const siteUrl = 'https://yourdomain.com';
    const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph */}
            <meta property="og:title" content={ogTitle || fullTitle} />
            {description && <meta property="og:description" content={ogDescription || description} />}
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={fullCanonical} />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={ogTitle || fullTitle} />
            {description && <meta name="twitter:description" content={ogDescription || description} />}
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};
