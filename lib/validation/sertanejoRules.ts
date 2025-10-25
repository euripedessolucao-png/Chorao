// Regras específicas para Sertanejo Moderno 2024-2025

export const SERTANEJO_RULES = {
  // Elementos visuais permitidos (para clipes)
  visualElements: [
    "biquíni",
    "praia",
    "piscina",
    "pickup",
    "boteco",
    "fazenda",
    "story",
    "celular",
    "pix",
    "festa",
    "balada",
    "cerveja",
    "chapéu",
    "bota",
    "caminhonete",
    "churrasco",
    "pôr do sol",
  ],

  // Palavras-chave de empoderamento (feminejo)
  empowermentKeywords: [
    "dona de mim",
    "livre",
    "leve",
    "solta",
    "independente",
    "meu troco",
    "minha vez",
    "minha vida",
    "minha lei",
    "não volto",
    "segui em frente",
    "virei a página",
  ],

  // Palavras-chave de vulnerabilidade com força (masculino)
  vulnerabilityKeywords: [
    "errei",
    "aprendi",
    "cresci",
    "mudei",
    "entendi",
    "te perdi",
    "saudade",
    "lição",
    "recomeço",
    "novo eu",
  ],

  // Elementos proibidos (clichês ultrapassados)
  forbiddenElements: [
    "coração partido",
    "lágrimas",
    "solidão profunda",
    "vingança",
    "ódio",
    "desespero",
    "fim do mundo",
    "nunca mais",
    "para sempre",
    "eternamente",
  ],

  // Estrutura de refrão chiclete
  chorusStructure: {
    minLines: 2,
    maxLines: 4,
    maxSyllablesPerLine: 12,
    requiresHook: true, // Precisa de um gancho de 2-4 palavras
    requiresVisual: true, // Precisa de elemento visual
  },

  // Prosódia (métrica silábica)
  prosody: {
    withComma: {
      beforeComma: { min: 4, max: 6 },
      afterComma: { min: 4, max: 6 },
      total: 12,
    },
    withoutComma: {
      min: 5,
      max: 8,
    },
  },
}

// Função para contar sílabas poéticas (simplificada)
export function countSyllables(line: string): number {
  // Remove pontuação e converte para minúsculas
  const cleaned = line.toLowerCase().replace(/[.,!?;:]/g, "")

  // Conta vogais como aproximação de sílabas
  const vowels = cleaned.match(/[aeiouáéíóúâêôãõ]/g)
  return vowels ? vowels.length : 0
}

// Verifica se linha tem elemento visual
export function hasVisualElement(line: string): boolean {
  const lowerLine = line.toLowerCase()
  return SERTANEJO_RULES.visualElements.some((element) => lowerLine.includes(element))
}

// Verifica se linha tem empoderamento
export function hasEmpowerment(line: string): boolean {
  const lowerLine = line.toLowerCase()
  return SERTANEJO_RULES.empowermentKeywords.some((keyword) => lowerLine.includes(keyword))
}

// Verifica se linha tem elemento proibido
export function hasForbiddenElement(line: string): boolean {
  const lowerLine = line.toLowerCase()
  return SERTANEJO_RULES.forbiddenElements.some((element) => lowerLine.includes(element))
}

// Extrai gancho (hook) de 2-4 palavras
export function extractHook(lines: string[]): string | null {
  for (const line of lines) {
    const words = line.split(/\s+/).filter((w) => w.length > 2)
    if (words.length >= 2 && words.length <= 4) {
      return words.join(" ")
    }
  }
  return null
}
