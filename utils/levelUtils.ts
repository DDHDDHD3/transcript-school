import { CertificateConfig } from '../types';

/**
 * Resolves a level ID to a localized name based on the certificate configuration.
 * Falls back to hardcoded labels for legacy 'level1'-'level12' IDs if not found in config.
 */
export const getLevelLabel = (
  levelId: string,
  config: CertificateConfig | null,
  language: string,
  t: (key: string) => string
): string => {
  if (!levelId) return '';

  // 1. Check if the level exists in the dynamic config
  if (config?.classLevels && config.classLevels.length > 0) {
    const found = config.classLevels.find(l => l.id === levelId);
    if (found) {
      if (language === 'ar' && found.nameAr) return found.nameAr;
      if (language === 'so' && found.nameSo) return found.nameSo;
      return found.nameEn || found.nameAr || levelId;
    }
  }

  // 2. Fallback for legacy hardcoded IDs (level1, level2, etc.)
  // This ensures that students assigned to the old levels still show "Level X" 
  // instead of the raw ID 'level1'
  const legacyMatch = levelId.match(/^level(\d+)$/);
  if (legacyMatch) {
    const num = legacyMatch[1];
    const translated = t(`students.levels.level${num}`);
    // If translation key doesn't exist, it usually returns the key itself
    if (translated && translated !== `students.levels.level${num}`) {
      return translated;
    }
    return `Level ${num}`;
  }

  // 3. Last resort: return the ID itself
  return levelId;
};
