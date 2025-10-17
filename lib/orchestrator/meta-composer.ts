/**
 * META-COMPOSITOR INTELIGENTE - SISTEMA AUTÔNOMO DE COMPOSIÇÃO HARMONIZADO
 * Versão final com polimento inteligente - COMPLETA E CORRIGIDA
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
  applyFinalPolish?: boolean
  preservedChoruses?: string[] // ✅ NOVO: Refrões selecionados para preservar
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
    polishingApplied?: boolean
    preservedChorusesUsed?: boolean // ✅ NOVO: Indica se usou refrões preservados
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MIN_QUALITY_SCORE = 0.8
  private static readonly ENABLE_AUTO_REFINEMENT = true
  private static readonly SYLLABLE_TARGET = { min: 7, max: 11, ideal: 9 }
  private static readonly PRESERVE_RHYMES = true
  private static readonly APPLY_TERCEIRA_VIA = true
  private static readonly APPLY_FINAL_POLISH = true

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
    let preservedChorusesUsed = false // ✅ NOVO: Controle de refrões preservados

    const syllableEnforcement = request.syllableTarget || this.SYLLABLE_TARGET
    const preserveRhymes = request.preserveRhymes ?? this.PRESERVE_RHYMES
    const applyTerceiraVia = request.applyTerceiraVia ?? this.APPLY_TERCEIRA_VIA
    const applyFinalPolish = request.applyFinalPolish ?? this.APPLY_FINAL_POLISH

    console.log(`[MetaComposer] Configuração: ${preserveRhymes ? 'RIMAS PRESERVADAS' : 'Rimas não preservadas'} | ${applyTerceiraVia ? 'TERCEIRA VIA ATIVA' : 'Terceira Via inativa'} | ${applyFinalPolish ? 'POLIMENTO FINAL ATIVO' : 'Polimento final inativo'}`)

    // ✅ VERIFICA SE TEM REFRÕES PARA PRESERVAR
    const hasPreservedChoruses = request.preservedChoruses && request.preservedChoruses.length > 0
    if (hasPreservedChoruses) {
      console.log(`[MetaComposer] 🎯 Modo preservação ativo: ${request.preservedChoruses.length} refrões selecionados`)
    }

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`\n[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      // ✅ DECISÃO INTELIGENTE: Geração normal ou com preservação de refrões
      if (hasPreservedChoruses && iterations === 1) {
        console.log('[MetaComposer] Aplicando reescrita com refrões preservados...')
        rawLyrics = await this.rewriteWithPreservedChoruses(
          "", // Letra original vazia para primeira iteração
          request.preservedChoruses!,
          request,
          syllableEnforcement
        )
        preservedChorusesUsed = true
      } else {
        // ✅ GERAÇÃO COM CONTROLE INTELIGENTE
        rawLyrics = await this.generateIntelligentLyrics(request, syllableEnforcement, preserveRhymes)
      }

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
            polishingApplied,
            preservedChorusesUsed // ✅ NOVO: Inclui informação de refrões preservados
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

    if (bestResult.metadata.preservedChorusesUsed) {
      console.log(`[MetaComposer] 🎯 Refrões preservados aplicados`)
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

  // ✅ NOVO MÉTODO ADICIONADO: REESCRITA INTELIGENTE QUE PRESERVA REFRÕES SELECIONADOS
  /**
   * REESCRITA INTELIGENTE QUE PRESERVA REFRÕES SELECIONADOS
   */
  private static async rewriteWithPreservedChoruses(
    originalLyrics: string,
    selectedChoruses: string[], // Refrões selecionados pelo usuário
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    console.log('[MetaComposer] Reescrevendo com refrões preservados:', selectedChoruses.length);
    
    // ✅ PASSO 1: Extrair estrutura básica da letra original
    const originalStructure = this.extractSongStructure(originalLyrics);
    
    // ✅ PASSO 2: Compor versos que preparem para os refrões selecionados
    const composedVerses = await this.composeVersesForChoruses(
      originalLyrics,
      selectedChoruses,
      request,
      syllableEnforcement
    );
    
    // ✅ PASSO 3: Montar estrutura final preservando refrões
    const finalLyrics = this.buildFinalStructure(
      composedVerses,
      selectedChoruses,
      originalStructure
    );
    
    return finalLyrics;
  }

  // ✅ NOVO MÉTODO ADICIONADO: COMPÕE VERSOS COERENTES COM OS REFRÕES SELECIONADOS
  /**
   * COMPÕE VERSOS COERENTES COM OS REFRÕES SELECIONADOS
   */
  private static async composeVersesForChoruses(
    originalLyrics: string,
    choruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number }
  ): Promise<{ verse1: string; verse2: string; bridge?: string }> {
    
    const prompt = `COMPOSIÇÃO DE VERSOS - PREPARAÇÃO PARA REFRÕES

TEMA: ${request.theme}
HUMOR: ${request.mood}
GÊNERO: ${request.genre}

REFRÃO PRINCIPAL:
${choruses[0]}

${choruses[1] ? `REFRÃO SECUNDÁRIO:\n${choruses[1]}` : ''}

${originalLyrics ? `LETRA ORIGINAL PARA INSPIRAÇÃO:\n${originalLyrics}` : ''}

LIMITE DE SÍLABAS: ${syllableEnforcement.min}-${syllableEnforcement.max} por linha

TAREFA: Compor versos que:
1. PREPAREM tematicamente para os refrões acima
2. MANTENHAM coerência com o tema "${request.theme}" e humor "${request.mood}"
3. RESPEITEM o limite de sílabas
4. USEM linguagem do ${request.genre}
5. CREEM transição natural para os refrões
6. USEM contrações: "cê", "tô", "pra", "tá"

RETORNE APENAS OS VERSOS NO FORMATO:
[VERSE 1]
• Linha 1
• Linha 2
• Linha 3
• Linha 4

[VERSE 2]  
• Linha 1
• Linha 2
• Linha 3
• Linha 4

[BRIDGE] (opcional)
• Linha 1
• Linha 2`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.4
    });

    return this.parseComposedVerses(text);
  }

  // ✅ NOVO MÉTODO ADICIONADO: ANALISA ESTRUTURA DA MÚSICA
  private static extractSongStructure(lyrics: string): any {
    const sections = lyrics.split('\n\n').filter(section => section.trim());
    const structure = {
      hasIntro: /\[INTRO\]/i.test(lyrics),
      hasVerse: /\[VERS[OE]]/i.test(lyrics),
      hasChorus: /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics),
      hasBridge: /\[BRIDGE\]/i.test(lyrics),
      hasOutro: /\[OUTRO\]/i.test(lyrics),
      totalSections: sections.length
    };
    
    return structure;
  }

  // ✅ NOVO MÉTODO ADICIONADO: MONTA ESTRUTURA FINAL
  private static buildFinalStructure(
    verses: { verse1: string; verse2: string; bridge?: string },
    choruses: string[],
    structure: any
  ): string {
    const sections: string[] = [];
    
    // Intro
    if (structure.hasIntro) {
      sections.push('[INTRO]');
    }
    
    // Primeiro verso e refrão
    sections.push(verses.verse1);
    sections.push(`[CHORUS]\n${choruses[0]}`);
    
    // Segundo verso e refrão
    sections.push(verses.verse2);
    sections.push(`[CHORUS]\n${choruses[0]}`);
    
    // Bridge se existir
    if (verses.bridge) {
      sections.push(verses.bridge);
    }
    
    // Refrão final
    sections.push(`[CHORUS]\n${choruses[0]}`);
    
    // Outro se existir
    if (structure.hasOutro) {
      sections.push('[OUTRO]');
    }
    
    return sections.join('\n\n');
  }

  // ✅ NOVO MÉTODO ADICIONADO: ANALISA VERSOS COMPOSTOS
  private static parseComposedVerses(text: string): { verse1: string; verse2: string; bridge?: string } {
    const lines = text.split('\n');
    let currentSection = '';
    const sections: { [key: string]: string[] } = {};
    
    for (const line of lines) {
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line;
        sections[currentSection] = [];
      } else if (currentSection && line.trim() && !line.startsWith('•')) {
        sections[currentSection].push(line.trim());
      }
    }
    
    return {
      verse1: sections['[VERSE 1]']?.join('\n') || '',
      verse2: sections['[VERSE 2]']?.join('\n') || '',
      bridge: sections['[BRIDGE]']?.join('\n')
    };
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

  /**
   * PROMPT HARMONIZADO
   */
  private static buildHarmonizedMasterPrompt(
    request: CompositionRequest, 
    genreConfig: any, 
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean
  ): string {
    const rhymePreservationNote = preserveRhymes 
      ? "⚠️ SISTEMA PRESERVA RIMAS: Se você criar rimas ricas, o sistema as manterá durante a correção."
      : ""

    return `COMPOSITOR MUSICAL INTELIGENTE - ${request.genre.toUpperCase()}

CONTROLE DE SÍLABAS: ${enforcement.min} a ${enforcement.max} sílabas por linha
ALVO IDEAL: ${enforcement.ideal} sílabas

CONTRAÇÕES OBRIGATÓRIAS:
• "você" → "cê" • "estou" → "tô" • "para" → "pra" • "está" → "tá"

TEMA: ${request.theme}
HUMOR: ${request.mood}
${rhymePreservationNote}

FORMATO:
[SEÇÃO - descrição em inglês]
• Letra em português com empilhamento natural
• Um verso por linha, exceto diálogos consecutivos

EXEMPLOS DE EMPILHAMENTO:
"Me olha e pergunta: 'Tá perdido?'"
"Respondo: 'Só te desejando...'"

${request.additionalRequirements ? `REQUISITOS:\n${request.additionalRequirements}\n` : ''}

RETORNE APENAS A LETRA NO FORMATO CORRETO.`
  }

  /**
   * VALIDAÇÃO COMPREENSIVA HARMONIZADA
   */
  private static async comprehensiveValidation(
    lyrics: string,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any
  ): Promise<{ 
    passed: boolean; 
    errors: string[]; 
    warnings: string[];
    syllableStats: {
      totalLines: number
      linesWithinLimit: number
      maxSyllablesFound: number
      averageSyllables: number
    }
    terceiraViaScore?: number
    rhymePreservation?: number
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics.split('\n').filter((line) => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:') && !line.includes('BPM:')
    )

    // ✅ ANÁLISE DE SÍLABAS
    const syllableStats = this.calculateSyllableStatistics(lines, syllableTarget)
    
    if (syllableStats.linesWithinLimit < syllableStats.totalLines) {
      const problemLines = lines.filter(line => {
        const syllables = countPoeticSyllables(line)
        return syllables < syllableTarget.min || syllables > syllableTarget.max
      }).slice(0, 3)
      
      errors.push(
        `${syllableStats.totalLines - syllableStats.linesWithinLimit} versos fora do limite de ${syllableTarget.min}-${syllableTarget.max} sílabas`,
        ...problemLines.map((line: string) => `- "${line}" (${countPoeticSyllables(line)} sílabas)`)
      )
    }

    // ✅ VALIDAÇÃO ANTI-FORCING
    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) {
      warnings.push(...forcingValidation.warnings)
    }

    // ✅ VALIDAÇÃO DE PALAVRAS PROIBIDAS
    const forbidden = genreConfig.language_rules?.forbidden
      ? Object.values(genreConfig.language_rules.forbidden).flat()
      : []
    const lyricsLower = lyrics.toLowerCase()
    forbidden.forEach((word: string) => {
      if (lyricsLower.includes(word.toLowerCase())) {
        errors.push(`Palavra proibida encontrada: "${word}"`)
      }
    })

    // ✅ VALIDAÇÃO DE REFRÕES (3 linhas são proibidas)
    const chorusMatches = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n((?:[^\n]+\n?)+?)(?=\[|$)/gi)
    if (chorusMatches) {
      chorusMatches.forEach((chorus: string, index: number) => {
        const chorusLines = chorus
          .split("\n")
          .filter((line: string) => line.trim() && !line.startsWith("["))
          .filter((line: string) => !line.startsWith("("))
        if (chorusLines.length === 3) {
          errors.push(`Refrão ${index + 1}: 3 linhas é PROIBIDO (use 2 ou 4)`)
        }
      })
    }

    // ✅ ANÁLISE DE EMPILHAMENTO
    const stackingRatio = this.calculateStackingRatio(lyrics)
    if (stackingRatio < 0.3) {
      warnings.push(`Baixo empilhamento de versos (${(stackingRatio * 100).toFixed(0)}%) - formatação pouco natural`)
    } else if (stackingRatio > 0.7) {
      warnings.push(`Alto empilhamento (${(stackingRatio * 100).toFixed(0)}%) - pode dificultar contagem de sílabas`)
    }

    // ✅ SCORE TERCEIRA VIA
    let terceiraViaScore = undefined
    if (terceiraViaAnalysis) {
      terceiraViaScore = terceiraViaAnalysis.score_geral
      if (terceiraViaScore < 70) {
        warnings.push(`Score Terceira Via baixo: ${terceiraViaScore}/100 - considere mais originalidade`)
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      syllableStats,
      terceiraViaScore,
      rhymePreservation: this.calculateRhymePreservation(lyrics)
    }
  }

  /**
   * SCORE DE QUALIDADE HARMONIZADO
   */
  private static calculateHarmonizedQualityScore(
    lyrics: string,
    validation: any,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis: any,
    correctionCount: number
  ): number {
    let score = 1.0

    // ✅ PESO FORTE: Sílabas corretas (40%)
    const syllableRatio = validation.syllableStats.linesWithinLimit / validation.syllableStats.totalLines
    score = score * 0.6 + (syllableRatio * 0.4)

    // ✅ PESO MÉDIO: Terceira Via (25%)
    if (terceiraViaAnalysis) {
      const terceiraViaScore = terceiraViaAnalysis.score_geral / 100
      score = score * 0.75 + (terceiraViaScore * 0.25)
    }

    // ✅ PESO MÉDIO: Estrutura e coerência (20%)
    const coherenceScore = this.assessNarrativeCoherence(lyrics)
    score = score * 0.8 + (coherenceScore * 0.2)

    // ✅ PESO LEVE: Empilhamento balanceado (10%)
    const stackingRatio = this.calculateStackingRatio(lyrics)
    const stackingScore = (stackingRatio >= 0.3 && stackingRatio <= 0.7) ? 1.0 : 0.5
    score = score * 0.9 + (stackingScore * 0.1)

    // ✅ PENALIDADES
    score -= validation.errors.length * 0.15
    score -= validation.warnings.length * 0.05
    score -= Math.min(correctionCount * 0.02, 0.1)

    // ✅ BÔNUS: Linguagem simples e natural
    const simplicityScore = this.assessLanguageSimplicity(lyrics)
    score += simplicityScore * 0.05

    return Math.max(0, Math.min(1, score))
  }

  /**
   * REFINAMENTO AUTÔNOMO INTELIGENTE
   */
  private static async autonomousRefinement(
    request: CompositionRequest,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any
  ): Promise<CompositionRequest> {
    
    const refinementInstructions = [
      ...validation.errors.map((error: string) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning: string) => `MELHORAR: ${warning}`),
      `GARANTIR: ${syllableTarget.min}-${syllableTarget.max} sílabas por verso (alvo: ${syllableTarget.ideal})`,
      `USAR: contrações "cê", "tô", "pra", "tá" e elisões "d'amor", "qu'eu"`,
    ]

    // ✅ ADICIONA INSTRUÇÕES DA TERCEIRA VIA SE SCORE BAIXO
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 70) {
      refinementInstructions.push(
        `TERCEIRA VIA: Evitar clichês, usar imagens concretas, mostrar vulnerabilidade genuína`
      )
      if (terceiraViaAnalysis.pontos_fracos && terceiraViaAnalysis.pontos_fracos.length > 0) {
        refinementInstructions.push(
          `TERCEIRA VIA: Foco em ${terceiraViaAnalysis.pontos_fracos.slice(0, 2).join(', ')}`
        )
      }
    }

    return {
      ...request,
      additionalRequirements: request.additionalRequirements
        ? `${request.additionalRequirements}\n\nREFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join('\n')}`
        : `REFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join('\n')}`,
    }
  }

  /**
   * ANÁLISE DE PRESERVAÇÃO DE RIMAS
   */
  private static analyzeRhymePreservation(originalLyrics: string, correctedLyrics: string): any {
    const originalRhymes = this.extractRhymes(originalLyrics)
    const correctedRhymes = this.extractRhymes(correctedLyrics)
    
    let preservedCount = 0
    const minLength = Math.min(originalRhymes.length, correctedRhymes.length)
    
    for (let i = 0; i < minLength; i++) {
      if (correctedRhymes[i] === originalRhymes[i]) {
        preservedCount++
      }
    }

    const preservationRate = originalRhymes.length > 0 
      ? (preservedCount / originalRhymes.length) * 100 
      : 100

    return {
      originalRhymeCount: originalRhymes.length,
      correctedRhymeCount: correctedRhymes.length,
      preservedCount,
      preservationRate: Math.round(preservationRate)
    }
  }

  /**
   * EXTRAI RIMAS DA LETRA
   */
  private static extractRhymes(lyrics: string): string[] {
    const lines = lyrics.split('\n')
      .filter(line => line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:') && !line.includes('BPM:'))
    
    return lines.map(line => {
      const words = line.trim().split(/\s+/)
      const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]$/g, '') || ''
      return lastWord.slice(-2)
    }).filter(rhyme => rhyme.length > 0)
  }

  /**
   * CALCULA TAXA DE PRESERVAÇÃO DE RIMAS
   */
  private static calculateRhymePreservation(lyrics: string): number {
    const rhymes = this.extractRhymes(lyrics)
    if (rhymes.length < 2) return 100

    let consistentRhymes = 0
    for (let i = 0; i < rhymes.length - 1; i += 2) {
      if (rhymes[i] === rhymes[i + 1]) {
        consistentRhymes++
      }
    }

    return Math.round((consistentRhymes / Math.floor(rhymes.length / 2)) * 100)
  }

  // 🔧 MÉTODOS AUXILIARES

  private static calculateSyllableStatistics(
    lines: string[], 
    syllableTarget: { min: number; max: number; ideal: number }
  ) {
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
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

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
      line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes('Instrumentos:') && !line.includes('BPM:')
    )
    
    let stackedPairs = 0
    let totalPossiblePairs = Math.max(0, lines.length - 1)
    
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i]
      const nextLine = lines[i + 1]
      
      if (this.shouldLinesStack(currentLine, nextLine)) {
        stackedPairs++
      }
    }
    
    return totalPossiblePairs > 0 ? stackedPairs / totalPossiblePairs : 0
  }

  private static shouldLinesStack(line1: string, line2: string): boolean {
    const l1 = line1.toLowerCase().trim()
    const l2 = line2.toLowerCase().trim()
    
    if ((l1.includes('?') && !l2.includes('?')) || (l2.includes('?') && !l1.includes('?'))) return true
    
    const connectors = ['e', 'mas', 'porém', 'então', 'quando', 'onde', 'que', 'pra']
    if (connectors.some(connector => l2.startsWith(connector))) return true
    
    if (l1.endsWith(',') || l1.endsWith(';') || l2.startsWith('—') || l2.startsWith('-')) return true
    
    return false
  }

  private static assessNarrativeCoherence(lyrics: string): number {
    const hasIntro = /\[INTRO\]/i.test(lyrics)
    const hasVerse = /\[VERS[OE]/i.test(lyrics)
    const hasChorus = /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics)
    const hasBridge = /\[BRIDGE\]/i.test(lyrics)
    const hasOutro = /\[OUTRO\]/i.test(lyrics)

    let score = 0
    if (hasIntro) score += 0.2
    if (hasVerse) score += 0.2
    if (hasChorus) score += 0.2
    if (hasBridge) score += 0.2
    if (hasOutro) score += 0.2

    return score
  }

  private static assessLanguageSimplicity(lyrics: string): number {
    const complexWords = ["outono", "primavera", "florescer", "bonanca", "alvorada", "crepusculo", "efemero", "sublime"]
    const lyricsLower = lyrics.toLowerCase()
    const complexCount = complexWords.filter((word: string) => lyricsLower.includes(word)).length

    return Math.max(0, 1 - complexCount * 0.1)
  }
}
