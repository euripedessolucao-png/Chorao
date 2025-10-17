/**
 * META-COMPOSITOR INTELIGENTE - SISTEMA AUTÔNOMO DE COMPOSIÇÃO HARMONIZADO
 * Versão final com polimento inteligente
 */

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { ThirdWayEngine } from "@/lib/third-way-converter"

export interface CompositionRequest {
  genre: string
  theme: string
  mood: string
  additionalRequirements?: string
  hook?: string
  chorus?: string[]
  title?: string
  performanceMode?: boolean
  creativity?: "conservador" | "equilibrado" | "ousado"
  syllableTarget?: {
    min: number
    max: number  
    ideal: number
  }
  preserveRhymes?: boolean
  applyTerceiraVia?: boolean
  applyFinalPolish?: boolean // ✅ NOVO: Polimento final opcional
}

export interface CompositionResult {
  lyrics: string
  title: string
  validation: {
    passed: boolean
    errors: string[]
    warnings: string[]
    syllableStats: {
      totalLines: number
      linesWithinLimit: number
      maxSyllablesFound: number
      averageSyllables: number
    }
    terceiraViaScore?: number
    rhymePreservation?: number
  }
  metadata: {
    iterations: number
    refinements: number
    finalScore: number
    terceiraViaAnalysis?: any
    rhymeAnalysis?: any
    polishingApplied?: boolean // ✅ NOVO: Indica se polimento foi aplicado
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MIN_QUALITY_SCORE = 0.8
  private static readonly ENABLE_AUTO_REFINEMENT = true
  private static readonly SYLLABLE_TARGET = { min: 7, max: 11, ideal: 9 }
  private static readonly PRESERVE_RHYMES = true
  private static readonly APPLY_TERCEIRA_VIA = true
  private static readonly APPLY_FINAL_POLISH = true // ✅ NOVO: Polimento final ativo por padrão

  /**
   * COMPOSIÇÃO INTELIGENTE - SISTEMA HARMONIZADO COM POLIMENTO FINAL
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] Iniciando composição inteligente harmonizada...")

    let iterations = 0
    let refinements = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0
    let polishingApplied = false

    const syllableEnforcement = request.syllableTarget || this.SYLLABLE_TARGET
    const preserveRhymes = request.preserveRhymes ?? this.PRESERVE_RHYMES
    const applyTerceiraVia = request.applyTerceiraVia ?? this.APPLY_TERCEIRA_VIA
    const applyFinalPolish = request.applyFinalPolish ?? this.APPLY_FINAL_POLISH

    console.log(`[MetaComposer] Configuração: ${preserveRhymes ? 'RIMAS PRESERVADAS' : 'Rimas não preservadas'} | ${applyTerceiraVia ? 'TERCEIRA VIA ATIVA' : 'Terceira Via inativa'} | ${applyFinalPolish ? 'POLIMENTO FINAL ATIVO' : 'Polimento final inativo'}`)

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`\n[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      // ✅ GERAÇÃO COM CONTROLE INTELIGENTE
      const rawLyrics = await this.generateIntelligentLyrics(request, syllableEnforcement, preserveRhymes)

      // ✅ APLICA TERCEIRA VIA (se habilitado)
      let terceiraViaLyrics = rawLyrics
      let terceiraViaAnalysis = null
      
      if (applyTerceiraVia) {
        console.log('[MetaComposer] Aplicando princípios da Terceira Via...')
        terceiraViaLyrics = await this.applyTerceiraViaToLyrics(rawLyrics, request.genre, request.theme)
        terceiraViaAnalysis = this.analisarTerceiraVia(terceiraViaLyrics, request.genre, request.theme)
        console.log(`[MetaComposer] Score Terceira Via: ${terceiraViaAnalysis.score_geral}/100`)
      }

      // ✅ CORREÇÃO DE SÍLABAS COM PRESERVAÇÃO DE RIMAS
      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
        terceiraViaLyrics, 
        syllableEnforcement, 
        request.genre
      )

      console.log(`[MetaComposer] Correções aplicadas: ${enforcedResult.corrections} linhas`)

      // ✅ POLIMENTO FINAL INTELIGENTE (se habilitado)
      let finalLyrics = enforcedResult.correctedLyrics
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log('[MetaComposer] Aplicando polimento final...')
        finalLyrics = await this.applyFinalPolish(enforcedResult.correctedLyrics, request.genre, syllableEnforcement)
        polishingApplied = true
        console.log('[MetaComposer] ✅ Polimento final aplicado!')
      }

      // ✅ VALIDAÇÃO COMPREENSIVA
      const validation = await this.comprehensiveValidation(
        finalLyrics, 
        request, 
        syllableEnforcement,
        terceiraViaAnalysis
      )

      // ✅ CÁLCULO DE SCORE HARMONIZADO
      const qualityScore = this.calculateHarmonizedQualityScore(
        finalLyrics, 
        validation, 
        request, 
        syllableEnforcement,
        terceiraViaAnalysis,
        enforcedResult.corrections
      )

      console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)
      console.log(`[MetaComposer] Estatísticas de sílabas: ${validation.syllableStats.linesWithinLimit}/${validation.syllableStats.totalLines} versos dentro do limite`)

      // ✅ ATUALIZA MELHOR RESULTADO
      if (qualityScore > bestScore) {
        bestScore = qualityScore
        bestResult = {
          lyrics: finalLyrics,
          title: this.extractTitle(finalLyrics, request),
          validation,
          metadata: {
            iterations,
            refinements,
            finalScore: qualityScore,
            terceiraViaAnalysis,
            rhymeAnalysis: this.analyzeRhymePreservation(rawLyrics, finalLyrics),
            polishingApplied
          },
        }
      }

      // ✅ VERIFICA SE ATINGIU QUALIDADE MÍNIMA
      if (qualityScore >= this.MIN_QUALITY_SCORE && validation.passed) {
        console.log("[MetaComposer] ✅ Qualidade mínima atingida!")
        break
      }

      // ✅ REFINAMENTO AUTÔNOMO
      if (this.ENABLE_AUTO_REFINEMENT && iterations < this.MAX_ITERATIONS) {
        console.log("[MetaComposer] Aplicando refinamento autônomo...")
        request = await this.autonomousRefinement(request, validation, syllableEnforcement, terceiraViaAnalysis)
        refinements++
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição de qualidade mínima")
    }

    // ✅ RELATÓRIO FINAL DETALHADO
    const finalValidation = SyllableEnforcer.validateLyrics(bestResult.lyrics, syllableEnforcement)
    console.log(`\n[MetaComposer] 📊 RELATÓRIO FINAL:`)
    console.log(`[MetaComposer] Conformidade: ${(finalValidation.compliance * 100).toFixed(1)}%`)
    console.log(`[MetaComposer] Sílabas: ${finalValidation.withinLimit}/${finalValidation.totalLines} versos corretos`)
    
    if (bestResult.metadata.terceiraViaAnalysis) {
      console.log(`[MetaComposer] Terceira Via: ${bestResult.metadata.terceiraViaAnalysis.score_geral}/100`)
    }
    
    if (bestResult.metadata.rhymeAnalysis) {
      console.log(`[MetaComposer] Rimas preservadas: ${bestResult.metadata.rhymeAnalysis.preservationRate}%`)
    }

    if (bestResult.metadata.polishingApplied) {
      console.log(`[MetaComposer] ✨ Polimento final aplicado`)
    }

    if (finalValidation.problems.length > 0) {
      console.log('[MetaComposer] ⚠️ VERSOS PROBLEMÁTICOS:')
      finalValidation.problems.forEach(problem => {
        console.log(`  - "${problem.line}" (${problem.syllables}s)`)
      })
    }

    console.log(`[MetaComposer] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * POLIMENTO FINAL INTELIGENTE - CORRIGE LINHAS PROBLEMÁTICAS
   */
  private static async applyFinalPolish(lyrics: string, genre: string, syllableTarget: { min: number; max: number; ideal: number }): Promise<string> {
    const lines = lyrics.split('\n');
    const polishedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Mantém linhas de estrutura e metadata intactas
      if (line.startsWith('[') || line.startsWith('(') || line.includes('Instrumentos:') || line.includes('BPM:') || line.includes('Ritmo:') || line.includes('Estilo:')) {
        polishedLines.push(line);
        continue;
      }
      
      const syllables = countPoeticSyllables(line);
      
      // Se a linha está vazia ou dentro do limite, mantém
      if (!line.trim() || (syllables >= syllableTarget.min && syllables <= syllableTarget.max)) {
        polishedLines.push(line);
        continue;
      }
      
      // Se está fora do limite ou parece quebrada, aplica polimento
      console.log(`[FinalPolish] Polindo linha ${i+1}: "${line}" (${syllables}s)`);
      
      try {
        const polishedLine = await this.polishProblematicLine(line, genre, syllableTarget);
        polishedLines.push(polishedLine);
      } catch (error) {
        console.error(`[FinalPolish] Erro ao polir linha ${i+1}, mantendo original`);
        polishedLines.push(line);
      }
    }
    
    return polishedLines.join('\n');
  }

  /**
   * POLIMENTO DE LINHA PROBLEMÁTICA
   */
  private static async polishProblematicLine(line: string, genre: string, syllableTarget: { min: number; max: number; ideal: number }): Promise<string> {
    const currentSyllables = countPoeticSyllables(line);
    const isTooShort = currentSyllables < syllableTarget.min;
    const isTooLong = currentSyllables > syllableTarget.max;
    const seemsBroken = line.includes('?\"') || line.length < 10 || (line.endsWith('?') && !line.includes(':'));

    const prompt = `POLIMENTO FINAL DE LINHA MUSICAL - GÊNERO: ${genre}

LINHA ORIGINAL: "${line}"
PROBLEMAS DETECTADOS:
- ${isTooShort ? `MUITO CURTA: ${currentSyllables}s (mínimo ${syllableTarget.min}s)` : ''}
- ${isTooLong ? `MUITO LONGA: ${currentSyllables}s (máximo ${syllableTarget.max}s)` : ''}
- ${seemsBroken ? `POSSIVELMENTE QUEBRADA: estrutura incompleta` : 'Estrutura OK'}

REESCREVA ESTA LINHA PARA:
1. 🔥 COMPLETAR o sentido se estiver quebrada
2. 📏 RESPEITAR ${syllableTarget.min}-${syllableTarget.max} sílabas (IDEAL: ${syllableTarget.ideal})
3. 🎵 MANTER a rima e contexto musical
4. 💬 USAR linguagem natural do ${genre}
5. ✨ MELHORAR fluência sem alterar significado principal

TÉCNICAS OBRIGATÓRIAS:
• Contrações: "cê", "tô", "pra", "tá"
• Elisão: "d'amor", "qu'eu", "meuamor" 
• Linguagem coloquial brasileira

EXEMPLOS DE POLIMENTO:
"Olhar entregar?'" → "Meu olhar quer te entregar?"
"Ela balança" → "Ela vem balançando pro meu lado"
"Meu peito dispara" → "Coração dispara quando cê chega"

GÊNERO: ${genre}
LINHA PARA POLIR: "${line}"

→ RETORNE APENAS A LINHA POLIDA (sem explicações, sem aspas):`;

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.4
    });

    const polishedLine = text.trim().replace(/^["']|["']$/g, "");
    
    // Verifica se a linha polida está melhor
    const polishedSyllables = countPoeticSyllables(polishedLine);
    const isImproved = (isTooShort && polishedSyllables >= syllableTarget.min) || 
                      (isTooLong && polishedSyllables <= syllableTarget.max) ||
                      (!isTooShort && !isTooLong && polishedLine.length > line.length);

    return isImproved ? polishedLine : line;
  }

  /**
   * ANÁLISE TERCEIRA VIA - IMPLEMENTAÇÃO LOCAL
   */
  private static analisarTerceiraVia(lyrics: string, genre: string, theme: string): any {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:') && !line.includes('BPM:')
    )

    // Análise de clichês
    const cliches = ["coração partido", "lágrimas no travesseiro", "noite sem luar", "amor eterno", "para sempre"]
    let clicheCount = 0
    const lyricsLower = lyrics.toLowerCase()
    
    cliches.forEach(cliche => {
      if (lyricsLower.includes(cliche)) clicheCount++
    })

    const originalidade = Math.max(0, 100 - clicheCount * 20)

    // Análise de estrutura
    const hasStructure = lyrics.includes("[VERSE") && lyrics.includes("[CHORUS")
    const hasRhyme = lines.length >= 2 && this.checkRhyme(lines[0], lines[1])
    
    let tecnica = 50
    if (hasRhyme) tecnica += 25
    if (hasStructure) tecnica += 25

    // Score geral
    const score_geral = Math.round(originalidade * 0.4 + tecnica * 0.6)

    return {
      originalidade,
      profundidade_emocional: 75,
      tecnica_compositiva: tecnica,
      adequacao_genero: 85,
      score_geral,
      sugestoes: clicheCount > 0 ? ["Evite clichês comuns"] : ["Boa qualidade literária"],
      pontos_fortes: hasStructure ? ["Estrutura bem organizada"] : ["Letra coesa"],
      pontos_fracos: clicheCount > 0 ? ["Alguns clichês detectados"] : ["Pode melhorar originalidade"]
    }
  }

  /**
   * VERIFICA RIMA ENTRE LINHAS
   */
  private static checkRhyme(line1: string, line2: string): boolean {
    const getLastWord = (line: string) => {
      const words = line.trim().split(/\s+/)
      return words[words.length - 1]?.toLowerCase().replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "") || ""
    }

    const word1 = getLastWord(line1)
    const word2 = getLastWord(line2)

    if (!word1 || !word2) return false

    const end1 = word1.slice(-2)
    const end2 = word2.slice(-2)

    return end1 === end2
  }

  /**
   * APLICA TERCEIRA VIA À LETRA COMPLETA
   */
  private static async applyTerceiraViaToLyrics(
    lyrics: string, 
    genre: string, 
    theme: string
  ): Promise<string> {
    const lines = lyrics.split('\n')
    const improvedLines: string[] = []
    const genreConfig = getGenreConfig(genre)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (!line.trim() || line.startsWith('[') || line.startsWith('(') || line.includes('Instrumentos:') || line.includes('BPM:')) {
        improvedLines.push(line)
        continue
      }

      const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(' | ')
      
      try {
        const improvedLine = await ThirdWayEngine.generateThirdWayLine(
          line,
          genre,
          genreConfig,
          context,
          false
        )
        improvedLines.push(improvedLine)
      } catch (error) {
        console.error(`[MetaComposer] Erro ao aplicar Terceira Via na linha ${i}:`, error)
        improvedLines.push(line)
      }
    }

    return improvedLines.join('\n')
  }

  /**
   * GERAÇÃO INTELIGENTE DE LETRAS
   */
  private static async generateIntelligentLyrics(
    request: CompositionRequest, 
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean
  ): Promise<string> {
    const genreConfig = getGenreConfig(request.genre)

    const masterPrompt = this.buildHarmonizedMasterPrompt(request, genreConfig, enforcement, preserveRhymes)

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: masterPrompt,
      temperature: this.getCreativityTemperature(request.creativity),
    })

    return text
  }

  // ... (os outros métodos permanecem EXATAMENTE iguais - calculateSyllableStatistics, extractTitle, calculateStackingRatio, etc.)
  // 🔽 MANTER TODOS OS OUTROS MÉTODOS EXATAMENTE COMO ESTAVAM 🔽

  private static buildHarmonizedMasterPrompt(request: CompositionRequest, genreConfig: any, enforcement: any, preserveRhymes: boolean): string {
    // Manter implementação original
    const rhymePreservationNote = preserveRhymes 
      ? "⚠️ SISTEMA PRESERVA RIMAS: Se você criar rimas ricas, o sistema as manterá durante a correção."
      : ""

    return `COMPOSITOR MUSICAL INTELIGENTE - SISTEMA HARMONIZADO
Gênero: ${request.genre} | Tema: ${request.theme} | Humor: ${request.mood}

🎵 SISTEMA DE SÍLABAS INTELIGENTE:
LIMITE: ${enforcement.min} a ${enforcement.max} sílabas por linha
ALVO IDEAL: ${enforcement.ideal} sílabas
${rhymePreservationNote}

🎵 CONTRAÇÕES OBRIGATÓRIAS:
• "você" → "cê" • "estou" → "tô" • "para" → "pra" • "está" → "tá"

🎵 EXEMPLOS CORRETOS:
• "Cê tá na minha mente" = 6s ✅
• "Vou te amar pra sempre" = 7s ✅  
• "Tô perdido no teu olhar" = 7s ✅

📝 FORMATO OBRIGATÓRIO:
[SEÇÃO - descrição]
• Letra com empilhamento natural
• Diálogos consecutivos empilhados

${request.additionalRequirements ? `🎯 REQUISITOS:\n${request.additionalRequirements}\n` : ''}

RETORNE APENAS A LETRA NO FORMATO CORRETO.`
  }

  private static calculateSyllableStatistics(lines: string[], syllableTarget: any) {
    let totalSyllables = 0
    let linesWithinLimit = 0
    let maxSyllablesFound = 0

    lines.forEach(line => {
      const syllables = countPoeticSyllables(line)
      totalSyllables += syllables
      maxSyllablesFound = Math.max(maxSyllablesFound, syllables)
      
      if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
        linesWithinLimit++
      }
    })

    return {
      totalLines: lines.length,
      linesWithinLimit,
      maxSyllablesFound,
      averageSyllables: lines.length > 0 ? totalSyllables / lines.length : 0
    }
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.title) return request.title
    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    return request.theme.split(" ").slice(0, 3).join(" ")
  }

  private static getCreativityTemperature(creativity?: string): number {
    switch (creativity) {
      case "conservador": return 0.5
      case "ousado": return 0.9
      default: return 0.7
    }
  }

  private static calculateStackingRatio(lyrics: string): number {
    const lines = lyrics.split("\n").filter((line) => 
      line.trim() && !line.startsWith("[") && !line.startsWith("(")
    )
    let stackedPairs = 0
    let totalPossiblePairs = Math.max(0, lines.length - 1)
    for (let i = 0; i < lines.length - 1; i++) {
      if (this.shouldLinesStack(lines[i], lines[i + 1])) stackedPairs++
    }
    return totalPossiblePairs > 0 ? stackedPairs / totalPossiblePairs : 0
  }

  private static shouldLinesStack(line1: string, line2: string): boolean {
    const l1 = line1.toLowerCase().trim(), l2 = line2.toLowerCase().trim()
    if ((l1.includes('?') && !l2.includes('?')) || (l2.includes('?') && !l1.includes('?'))) return true
    const connectors = ['e', 'mas', 'porém', 'então', 'quando', 'onde', 'que', 'pra']
    if (connectors.some(connector => l2.startsWith(connector))) return true
    if (l1.endsWith(',') || l1.endsWith(';') || l2.startsWith('—') || l2.startsWith('-')) return true
    return false
  }

  private static assessNarrativeCoherence(lyrics: string): number {
    const hasIntro = /\[INTRO\]/i.test(lyrics), hasVerse = /\[VERS[OE]/i.test(lyrics)
    const hasChorus = /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics), hasBridge = /\[BRIDGE\]/i.test(lyrics)
    const hasOutro = /\[OUTRO\]/i.test(lyrics)
    let score = 0
    if (hasIntro) score += 0.2; if (hasVerse) score += 0.2; if (hasChorus) score += 0.2
    if (hasBridge) score += 0.2; if (hasOutro) score += 0.2
    return score
  }

  private static assessLanguageSimplicity(lyrics: string): number {
    const complexWords = ["outono", "primavera", "florescer", "bonanca", "alvorada", "crepusculo"]
    const lyricsLower = lyrics.toLowerCase()
    const complexCount = complexWords.filter((word) => lyricsLower.includes(word)).length
    return Math.max(0, 1 - complexCount * 0.1)
  }

  private static comprehensiveValidation(lyrics: string, request: CompositionRequest, syllableTarget: any, terceiraViaAnalysis?: any) {
    const errors: string[] = [], warnings: string[] = []
    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics.split('\n').filter((line) => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:') && !line.includes('BPM:')
    )

    const syllableStats = this.calculateSyllableStatistics(lines, syllableTarget)
    if (syllableStats.linesWithinLimit < syllableStats.totalLines) {
      const problemLines = lines.filter(line => {
        const syllables = countPoeticSyllables(line)
        return syllables < syllableTarget.min || syllables > syllableTarget.max
      }).slice(0, 3)
      errors.push(`${syllableStats.totalLines - syllableStats.linesWithinLimit} versos fora do limite`, ...problemLines.map(line => `- "${line}" (${countPoeticSyllables(line)}s)`))
    }

    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) warnings.push(...forcingValidation.warnings)

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      syllableStats,
      terceiraViaScore: terceiraViaAnalysis?.score_geral,
      rhymePreservation: this.calculateRhymePreservation(lyrics)
    }
  }

  private static calculateHarmonizedQualityScore(lyrics: string, validation: any, request: CompositionRequest, syllableTarget: any, terceiraViaAnalysis: any, correctionCount: number) {
    let score = 1.0
    const syllableRatio = validation.syllableStats.linesWithinLimit / validation.syllableStats.totalLines
    score = score * 0.6 + (syllableRatio * 0.4)
    if (terceiraViaAnalysis) score = score * 0.75 + ((terceiraViaAnalysis.score_geral / 100) * 0.25)
    score -= validation.errors.length * 0.15 - validation.warnings.length * 0.05 - Math.min(correctionCount * 0.02, 0.1)
    return Math.max(0, Math.min(1, score))
  }

  private static async autonomousRefinement(request: CompositionRequest, validation: any, syllableTarget: any, terceiraViaAnalysis?: any) {
    const refinementInstructions = [
      ...validation.errors.map((error) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning) => `MELHORAR: ${warning}`),
      `GARANTIR: ${syllableTarget.min}-${syllableTarget.max} sílabas`,
    ]
    return { ...request, additionalRequirements: request.additionalRequirements ? `${request.additionalRequirements}\nREFINAMENTOS:\n${refinementInstructions.join('\n')}` : `REFINAMENTOS:\n${refinementInstructions.join('\n')}` }
  }

  private static analyzeRhymePreservation(originalLyrics: string, correctedLyrics: string) {
    const originalRhymes = this.extractRhymes(originalLyrics), correctedRhymes = this.extractRhymes(correctedLyrics)
    let preservedCount = 0, minLength = Math.min(originalRhymes.length, correctedRhymes.length)
    for (let i = 0; i < minLength; i++) if (correctedRhymes[i] === originalRhymes[i]) preservedCount++
    const preservationRate = originalRhymes.length > 0 ? (preservedCount / originalRhymes.length) * 100 : 100
    return { originalRhymeCount: originalRhymes.length, correctedRhymeCount: correctedRhymes.length, preservedCount, preservationRate: Math.round(preservationRate) }
  }

  private static extractRhymes(lyrics: string) {
    return lyrics.split('\n').filter(line => line.trim() && !line.startsWith('[') && !line.startsWith('(')).map(line => {
      const words = line.trim().split(/\s+/), lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]$/g, '') || ''
      return lastWord.slice(-2)
    }).filter(rhyme => rhyme.length > 0)
  }

  private static calculateRhymePreservation(lyrics: string) {
    const rhymes = this.extractRhymes(lyrics)
    if (rhymes.length < 2) return 100
    let consistentRhymes = 0
    for (let i = 0; i < rhymes.length - 1; i += 2) if (rhymes[i] === rhymes[i + 1]) consistentRhymes++
    return Math.round((consistentRhymes / Math.floor(rhymes.length / 2)) * 100)
  }
}
