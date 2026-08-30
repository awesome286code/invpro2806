export type CurrencyCode = 'USD' | 'VND' | 'EUR' | string;

export interface FormatOptions {
    locale?: string;
    decimals?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: CurrencyCode;
}

/**
 * Formats a number as currency.
 * Handles different currency locales (e.g., VND usually has no decimals, USD has 2).
 */
export const formatCurrency = (
    value: number,
    currency: CurrencyCode = 'USD',
    locale?: string
): string => {
    const isVND = currency === 'VND';
    const defaultLocale = isVND ? 'vi-VN' : 'en-US';
    const resolvedLocale = locale || defaultLocale;

    // VND typically doesn't show decimals
    const defaultDecimals = isVND ? 0 : 2;

    return new Intl.NumberFormat(resolvedLocale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: defaultDecimals,
        maximumFractionDigits: defaultDecimals,
    }).format(value);
};

/**
 * Formats a number as a percentage.
 * Example: 0.123 -> 12.3% (if multiplier is false) or 12.3 -> 12.3% (if already scaled/handled elsewhere?)
 * Standard Intl.NumberFormat percent expects 0.12 = 12%.
 * However, existing app logic often passes 12.3 for 12.3%.
 * Let's standardize: The input remains as-is, we just append % and format decimals.
 * WAIT: Intl style='percent' multiplies by 100.
 * To avoid breaking existing logic where data might already be 14.5 (percent), we better use a custom formatter 
 * or check range. But safest is to treat input as the raw number to be displayed and just append %.
 *
 * Actually, looking at the code: `data.totalGLPercent.toFixed(2)}%`.
 * So the data is already 14.2 (for 14.2%).
 * We will simple format the number and append %.
 */
export const formatPercent = (
    value: number,
    decimals: number = 2,
    locale: string = 'en-US'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value) + '%';
};

/**
 * Formats a number with commas/separators.
 */
export const formatNumber = (
    value: number,
    decimals: number = 0,
    locale: string = 'en-US'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Formats large numbers into compact strings (e.g., 1.5M, 2.3K).
 */
export const formatCompactNumber = (
    value: number,
    currency?: CurrencyCode,
    locale: string = 'en-US'
): string => {
    const formatter = new Intl.NumberFormat(locale, {
        style: currency ? 'currency' : 'decimal',
        currency: currency,
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    });
    return formatter.format(value);
};
