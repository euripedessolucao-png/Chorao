import { SERTANEJO_RULES } from "./sertanejoRules"
import { getUniversalRhymeRules } from "./universal-rhyme-rules"
import { getAntiForcingRulesForGenre } from "./anti-forcing-validator"

export interface GenreRulesPrompt {
  genre: string
  syllableRules: string
  rhymeRules: string
  structureRules: string
  forbiddenElements: string
  allowedElements: string
  antiForcingRules: string
  fullPrompt: string
}

export function buildGenreRulesPrompt(genre: string): GenreRulesPrompt {
  const lowerGenre = genre.toLowerCase()
  let syllableRules = ""
  let rhymeRules = ""
  let structureRules = ""
  let forbiddenElements = ""
  let allowedElements = ""
  let antiForcingRules = ""

  const rhymeConfig = getUniversalRhymeRules(genre)
  rhymeRules = rhymeConfig.instructions

  const antiForcingConfig = getAntiForcingRulesForGenre(genre)
  if (antiForcingConfig.length > 0) {
    antiForcingRules = `REGRAS ANTI-FORÇAÇÃO (use palavras-chave apenas com contexto adequado):
${antiForcingConfig.map((rule) => `- "${rule.keyword}": ${rule.description}`).join("\n")}`
  }

  if (lowerGenre.includes("sertanejo")) {
    syllableRules = `MÉTRICA SILÁBICA (Sertanejo):
- Máximo 11 sílabas por verso (REGRA DE OURO)
- Com vírgula: 4-6 sílabas antes + 4-6 sílabas depois (máximo 12 total)
- Sem vírgula: 5-8 sílabas`

    structureRules = `ESTRUTURA (Sertanejo Moderno 2024-2025):
- VERSE: 4-5 linhas
- PRE-CHORUS: 2 linhas EXATAS
- CHORUS: 4 linhas EXATAS (refrão chiclete com gancho de 2-4 palavras)
- BRIDGE: opcional, 4 linhas
- OUTRO: opcional, 2-4 linhas`

    allowedElements = `ELEMENTOS PERMITIDOS (Sertanejo):
- Visuais: ${SERTANEJO_RULES.visualElements.slice(0, 10).join(", ")}
- Empoderamento: ${SERTANEJO_RULES.empowermentKeywords.slice(0, 8).join(", ")}
- Vulnerabilidade: ${SERTANEJO_RULES.vulnerabilityKeywords.slice(0, 8).join(", ")}`

    forbiddenElements = `ELEMENTOS PROIBIDOS (Sertanejo):
${SERTANEJO_RULES.forbiddenElements.map((el) => `- "${el}"`).join("\n")}`
  } else if (lowerGenre.includes("bachata")) {
    syllableRules = `MÉTRICA SILÁBICA (Bachata):
- VERSE: 8-10 sílabas (máximo 12)
- CHORUS: 7-9 sílabas (máximo 11)
- BRIDGE: 6-9 sílabas (máximo 10)
- Com cesura: parte 1 (5-7 sílabas) + parte 2 (4-7 sílabas), máximo 14 total`

    structureRules = `ESTRUTURA (Bachata):
- BPM: 110-120
- Foco em cantabilidade e pausas naturais
- Linhas longas devem ter cesura (vírgula)`

    forbiddenElements = `ELEMENTOS PROIBIDOS (Bachata):
- Evite clichês românticos excessivos
- Evite linhas muito longas sem pausa natural`
  } else if (lowerGenre.includes("pagode") || lowerGenre.includes("samba")) {
    syllableRules = `MÉTRICA SILÁBICA (Pagode/Samba):
- Máximo 11 sílabas por verso
- Foco na cantabilidade e swing
- Rimas devem facilitar o ritmo, não dificultar`

    structureRules = `ESTRUTURA (Pagode/Samba):
- Versos fluidos e naturais
- Refrão repetitivo e fácil de cantar
- Varie entre rimas ricas e pobres para evitar monotonia`

    forbiddenElements = `ELEMENTOS PROIBIDOS (Pagode/Samba):
- Evite rimas forçadas que quebram o swing
- Evite palavras difíceis de pronunciar rapidamente`
  } else if (lowerGenre.includes("funk")) {
    syllableRules = `MÉTRICA SILÁBICA (Funk):
- Flexível, mas mantenha ritmo constante
- Foco no beat e na batida
- Rimas podem ser mais simples`

    structureRules = `ESTRUTURA (Funk):
- Versos curtos e diretos
- Refrão repetitivo e marcante
- Foco na energia e atitude`

    forbiddenElements = `ELEMENTOS PROIBIDOS (Funk):
- Evite linguagem muito formal
- Evite metáforas complexas demais`
  } else {
    // Regras genéricas
    syllableRules = `MÉTRICA SILÁBICA:
- Máximo 11 sílabas por verso (REGRA DE OURO)
- Mantenha consistência métrica`

    structureRules = `ESTRUTURA:
- Mantenha estrutura clara de versos e refrões
- Refrão deve ser memorável`
  }

  const fullPrompt = `
${syllableRules}

${rhymeRules}

${structureRules}

${allowedElements}

${forbiddenElements}

${antiForcingRules}

TERCEIRA VIA - ORIGINALIDADE OBRIGATÓRIA:
- NÃO use clichês genéricos de IA
- USE metáforas originais e imagens concretas
- USE linguagem brasileira autêntica
- USE palavras específicas ao invés de genéricas
`.trim()

  return {
    genre,
    syllableRules,
    rhymeRules,
    structureRules,
    forbiddenElements,
    allowedElements,
    antiForcingRules,
    fullPrompt,
  }
}
