// lib/formatters/sertanejo-performance-formatter.ts

import { GENRE_CONFIGS } from "@/lib/genre-config";

/**
 * Formata letras com instruções profissionais de performance
 * Usa o padrão [PART A - Verse 1 - instrumentation] exigido por IAs musicais
 */
export function formatSertanejoPerformance(lyrics: string, genre: string): string {
  console.log(`[SertanejoFormatter] Formatando para performance (${genre})...`);

  // Obtém configuração do gênero
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS] || GENRE_CONFIGS["Sertanejo Moderno Feminino"];
  
  // Mapeia instruções por seção com base no gênero
  const getInstrumentation = (sectionType: string): string => {
    switch (sectionType) {
      case 'verse1':
        return config.harmony_and_rhythm.rhythm_style 
          ? `acoustic guitar, bass, ${config.harmony_and_rhythm.rhythm_style.includes('groove') ? 'drums' : 'light percussion'}`
          : "acoustic guitar, bass, light drums";
      case 'verse2':
        return "acoustic guitar, bass, drums with attitude";
      case 'chorus':
        return "full band with accordion, drums drive danceable beat";
      case 'bridge':
        return "dramatic pause; soft acoustic guitar arpeggio, sustained accordion note";
      case 'outro':
        return "instruments fade, leaving accordion and hook echoing";
      default:
        return "acoustic guitar, bass, drums";
    }
  };

  let formatted = lyrics
    // Verso 1
    .replace(/\[Verso\s*1?\]/gi, () => 
      `[PART A - Verse 1 - ${getInstrumentation('verse1')}]`
    )
    // Verso 2
    .replace(/\[Verso\s*2\]/gi, () => 
      `[PART A2 - Verse 2 - ${getInstrumentation('verse2')}]`
    )
    // Refrão (todas as ocorrências)
    .replace(/\[Refrão\]/gi, () => 
      `[PART B - Chorus - ${getInstrumentation('chorus')}]`
    )
    // Ponte
    .replace(/\[Ponte\]/gi, () => 
      `[PART C - Bridge - ${getInstrumentation('bridge')}]`
    )
    // Outro/Final
    .replace(/\[Final\]|\[Outro\]/gi, () => 
      `[OUTRO - ${getInstrumentation('outro')}]`
    );

  // Adiciona elementos performáticos contextuais
  if (genre.includes("Feminino")) {
    formatted = formatted
      .replace(/(PART B - Chorus)/g, "$1\n(Audience: \"É nóis!\")")
      .replace(/(PART C - Bridge)/g, "$1\n(Performance: Vocalist raises fist in the air)");
  }

  if (genre.includes("Masculino")) {
    formatted = formatted
      .replace(/(PART B - Chorus)/g, "$1\n(Audience: \"Véio!\")")
      .replace(/(PART C - Bridge)/g, "$1\n(Performance: Vocalist walks to stage edge)");
  }

  return formatted;
}

/**
 * Determina se deve usar formatação de performance
 */
export function shouldUsePerformanceFormat(genre: string, performanceMode?: string): boolean {
  if (performanceMode === "performance") {
    return true;
  }

  // Usa formatação performática para todos os gêneros modernos
  const performanceGenres = [
    "Sertanejo Moderno",
    "Sertanejo Universitário", 
    "Sertanejo Sofrência",
    "Sertanejo Raiz",
    "Funk",
    "MPB",
    "Pagode",
    "Gospel"
  ];

  return performanceGenres.some(g => genre.includes(g));
}
