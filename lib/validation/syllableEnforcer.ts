// Em lib/validation/syllableEnforcer.ts - ATUALIZE o método correctSyllableLine:

private static async correctSyllableLine(
  line: string,
  currentSyllables: number,
  enforcement: SyllableEnforcement,
  genre: string
): Promise<string> {
  let attempts = 0
  let currentLine = line

  while (attempts < this.MAX_CORRECTION_ATTEMPTS) {
    attempts++

    // ✅ PRIMEIRO: Tenta correções automáticas locais antes de chamar a IA
    const autoCorrected = this.applyAutomaticCorrections(currentLine, enforcement.max)
    const autoSyllables = countPoeticSyllables(autoCorrected)
    
    if (autoSyllables <= enforcement.max && autoSyllables >= enforcement.min) {
      console.log(`[SyllableEnforcer] Correção automática bem-sucedida: "${line}" -> "${autoCorrected}"`)
      return autoCorrected
    }

    // ✅ SEGUNDO: Se a correção automática falhou, usa IA
    const correctionPrompt = this.buildCorrectionPrompt(currentLine, currentSyllables, enforcement, genre)
    
    try {
      const { text: correctedLine } = await generateText({
        model: "openai/gpt-4o",
        prompt: correctionPrompt,
        temperature: 0.3
      })

      const correctedText = correctedLine.trim().replace(/^["']|["']$/g, "")
      const newSyllables = countPoeticSyllables(correctedText)

      console.log(`[SyllableEnforcer] Correção ${attempts}: "${currentLine}" (${currentSyllables}s) -> "${correctedText}" (${newSyllables}s)`)

      // Verifica se a correção foi bem-sucedida
      if (newSyllables >= enforcement.min && newSyllables <= enforcement.max) {
        return correctedText
      }

      currentLine = correctedText
      currentSyllables = newSyllables

    } catch (error) {
      console.error('[SyllableEnforcer] Erro na correção:', error)
      break
    }
  }

  // ✅ TERCEIRO: Se todas as tentativas falharem, aplica correção de emergência
  console.log(`[SyllableEnforcer] Todas as tentativas falharam, aplicando correção de emergência`)
  return this.applyEmergencyCorrection(line, enforcement.max)
}

/**
 * ✅ CORREÇÕES AUTOMÁTICAS - Mais agressivas e eficientes
 */
private static applyAutomaticCorrections(line: string, maxSyllables: number): string {
  let corrected = line

  // Lista expandida de contrações obrigatórias
  const contractions = [
    { from: /\bvocê\b/gi, to: 'cê' },
    { from: /\bestá\b/gi, to: 'tá' },
    { from: /\bpara\b/gi, to: 'pra' },
    { from: /\bestou\b/gi, to: 'tô' },
    { from: /\bcomigo\b/gi, to: 'comigo' },
    { from: /\bcontigo\b/gi, to: 'contigo' },
    { from: /\bdesejando\b/gi, to: 'querendo' },
    { from: /\bpensando\b/gi, to: 'pensando' },
    { from: /\bpronto\s+pra\b/gi, to: 'pronto p\'ra' },
    { from: /\bpergunta\b/gi, to: 'pergunta' },
    { from: /\bconfesso\b/gi, to: 'falo' },
    { from: /\bconstantemente\b/gi, to: 'sempre' },
    { from: /\bmaravilhosa\b/gi, to: 'incrível' },
    { from: /\benorme\b/gi, to: 'grande' },
  ]

  // Aplica todas as contrações
  contractions.forEach(({ from, to }) => {
    corrected = corrected.replace(from, to)
  })

  // Elisões poéticas obrigatórias
  const elisions = [
    { from: /\bde amor\b/gi, to: 'd\'amor' },
    { from: /\bque eu\b/gi, to: 'qu\'eu' },
    { from: /\bse eu\b/gi, to: 's\'eu' },
    { from: /\bmeu amor\b/gi, to: 'meuamor' },
    { from: /\bte abraço\b/gi, to: 'tabraço' },
    { from: /\bte espero\b/gi, to: 'tespero' },
    { from: /\bna minha\b/gi, to: 'naminha' },
    { from: /\bno meu\b/gi, to: 'nomeu' },
  ]

  elisions.forEach(({ from, to }) => {
    corrected = corrected.replace(from, to)
  })

  // Remove artigos desnecessários
  corrected = corrected
    .replace(/\b(o|a|os|as|um|uma)\s+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Se ainda estiver longo, corta palavras finais estrategicamente
  const currentSyllables = countPoeticSyllables(corrected)
  if (currentSyllables > maxSyllables) {
    const words = corrected.split(' ')
    
    // Tenta remover palavras do final mantendo o sentido
    if (words.length > 4) {
      // Remove última palavra
      const shortened = words.slice(0, -1).join(' ')
      if (countPoeticSyllables(shortened) <= maxSyllables) {
        return shortened
      }
      
      // Remove duas últimas palavras
      const moreShortened = words.slice(0, -2).join(' ')
      if (countPoeticSyllables(moreShortened) <= maxSyllables) {
        return moreShortened
      }
    }
  }

  return corrected
}

/**
 * ✅ CORREÇÃO DE EMERGÊNCIA - Garante que sempre retorne algo dentro do limite
 */
private static applyEmergencyCorrection(line: string, maxSyllables: number): string {
  console.log(`[SyllableEnforcer] Aplicando correção de emergência para: "${line}"`)
  
  const words = line.split(' ').filter(w => w.trim())
  
  // Estratégia 1: Pega apenas as primeiras palavras até caber no limite
  for (let i = words.length; i > 0; i--) {
    const candidate = words.slice(0, i).join(' ')
    if (countPoeticSyllables(candidate) <= maxSyllables) {
      console.log(`[SyllableEnforcer] Emergência: "${line}" -> "${candidate}"`)
      return candidate
    }
  }
  
  // Estratégia 2: Se ainda não couber, pega apenas as 3 primeiras palavras
  const fallback = words.slice(0, 3).join(' ')
  console.log(`[SyllableEnforcer] Fallback extremo: "${line}" -> "${fallback}"`)
  return fallback
}

/**
 * ✅ PROMPT MELHORADO para correções
 */
private static buildCorrectionPrompt(
  line: string,
  syllables: number,
  enforcement: SyllableEnforcement,
  genre: string
): string {
  return `CORREÇÃO URGENTE DE SILABAS - LINHA PROBLEMÁTICA

LINHA ORIGINAL: "${line}"
SILABAS ATUAIS: ${syllables} (LIMITE: ${enforcement.min}-${enforcement.max})

REESCREVA ESTA LINHA para ter ENTRE ${enforcement.min} E ${enforcement.max} SILABAS POÉTICAS.

TÉCNICAS OBRIGATÓRIAS (APLIQUE IMEDIATAMENTE):

1. CONTRAÇÕES BRUTAIS:
   - "você" → "cê" (OBRIGATÓRIO)
   - "está" → "tá" (OBRIGATÓRIO)
   - "para" → "pra" (OBRIGATÓRIO)
   - "estou" → "tô" (OBRIGATÓRIO)

2. ELISAO EXTREMA:
   - "de amor" → "d'amor" (OBRIGATÓRIO)
   - "que eu" → "qu'eu" (OBRIGATÓRIO)
   - "meu amor" → "meuamor" (OBRIGATÓRIO)

3. CORTE RADICAL:
   - Remova adjetivos desnecessários
   - Use frases mais curtas e diretas
   - Mantenha apenas o essencial

4. EXEMPLOS PRÁTICOS:

"Me olha e provoca: 'Tá pronto pra amar?'" (12s) 
→ "Me olha e provoca: 'Pronto p'ra amar?'" (9s)

"Meu peito explode, e a razão se apaga" (12s)
→ "Peito explode, razão se apaga" (8s)

"Eu, sem rumo, confesso: 'Vivo pra te amar'" (12s)
→ "Sem rumo, confesso: 'Vivo p'ra te amar'" (9s)

GÊNERO: ${genre} - Use linguagem coloquial brasileira

SUA TAREFA:
Corrija: "${line}"
→ (APENAS A LINHA CORRIGIDA, sem explicações)`
}
