/**
 * Normalizes Arabic strings by removing diacritics (Tashkeel) and 
 * converting various forms of Alif, Hamza, and Yaa to a base form.
 */
export const normalizeArabic = (text: string): string => {
    if (!text) return '';

    return text
        // Remove diacritics (Tashkeel)
        .replace(/[\u064B-\u0652]/g, '')
        // Normalize Alif variants
        .replace(/[أإآ]/g, 'ا')
        // Normalize Yaa variants
        .replace(/[ى]/g, 'ي')
        // Normalize Taa Marbuta
        .replace(/[ة]/g, 'ه')
        // Normalize Hamza on Waw
        .replace(/[ؤ]/g, 'و')
        // Normalize Hamza on Nabira
        .replace(/[ئ]/g, 'ي')
        // Convert to lowercase for English parts
        .toLowerCase()
        .trim();
};
