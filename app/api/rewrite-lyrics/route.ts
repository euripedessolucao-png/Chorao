// app/api/rewrite-lyrics/route.ts - SISTEMA AGGRESSIVO DE CORREÇÃO

// ✅ SISTEMA RIGOROSO DE VALIDAÇÃO E CORREÇÃO
function validateAndFixLine(line: string): string {
  if (!line.trim()) return line
  
  // ❌ DETECTAR LINHAS INCOMPLETAS (terminam com artigo/preposição)
  const incompletePatterns = [
    / eu me$/i, / o meu$/i, / a minha$/i, / em meu$/i, / no meu$/i, 
    / com meu$/i, / para meu$/i, / que me$/i, / se me$/i, / teu$/i,
    / meu$/i, / sua$/i, / nossa$/i, / em$/i, / no$/i, / na$/i
  ]
  
  for (const pattern of incompletePatterns) {
    if (pattern.test(line)) {
      // ✅ CORREÇÕES PARA LINHAS INCOMPLETAS
      const fixes: Record<string, string> = {
        "eu me": "eu me encontro",
        "o meu": "o meu coração",
        "a minha": "a minha vida", 
        "em meu": "em meu peito",
        "no meu": "no meu ser",
        "com meu": "com meu amor",
        "teu": "teu amor",
        "meu": "meu coração",
        "em": "em paz",
        "no": "no ar",
        "na": "na luz"
      }
      
      for (const [problem, fix] of Object.entries(fixes)) {
        if (line.toLowerCase().endsWith(problem)) {
          return line + " " + fix.split(' ').pop()
        }
      }
      
      // Fallback genérico
      return line + " viver"
    }
  }
  
  return line
}

// ✅ SISTEMA DE CORREÇÃO DE RIMAS POBRES
function improvePoorRhymes(line1: string, line2: string): { line1: string; line2: string; improved: boolean } {
  const word1 = getLastWord(line1)
  const word2 = getLastWord(line2)
  
  if (!word1 || !word2) return { line1, line2, improved: false }
  
  const currentRhyme = analyzeSimpleRhyme(word1, word2)
  
  // ✅ SÓ CORRIGIR SE RIMA MUITO FRACA
  if (currentRhyme.score >= 60) {
    return { line1, line2, improved: false }
  }
  
  // ✅ BANCO DE CORREÇÕES PARA RIMAS POBRES
  const rhymeFixes: Record<string, string[]> = {
    "acende": ["acende", "ascende", "pretende", "contende"],
    "sonhar": ["sonhar", "voar", "amar", "cantar", "encontrar"],
    "vê": ["vê", "pé", "fé", "você", "café", "bebê"],
    "amar": ["amar", "sonhar", "voar", "cantar", "encontrar"],
    "perco": ["perco", "merco", "aperto", "converto"],
    "me": ["me", "fé", "pé", "você", "café"],
    "meu": ["meu", "céu", "véu", "chapéu", "troféu"],
    "destino": ["destino", "caminho", "carinho", "vizinho", "menino"],
    "chão": ["chão", "mão", "coração", "ilusão", "canção"],
    "calor": ["calor", "amor", "dor", "flor", "sabor", "valor"],
    "paixão": ["paixão", "coração", "ilusão", "canção", "atenção"],
    "amor": ["amor", "dor", "flor", "calor", "sabor", "valor"],
    "estar": ["estar", "amar", "sonhar", "voar", "cantar"],
    "lar": ["lar", "amar", "sonhar", "voar", "cantar"],
    "brilhar": ["brilhar", "cantar", "amar", "sonhar", "voar"],
    "eternizar": ["eternizar", "realizar", "alcançar", "encontrar"],
    "encontro": ["encontro", "assunto", "ponto", "junto", "monto"],
    "abrigo": ["abrigo", "amigo", "perigo", "testemunho"],
    "sonho": ["sonho", "empenho", "lenho", "desenho", "sonho"],
    "comigo": ["comigo", "contigo", "testemunho", "carinho"]
  }
  
  // ✅ TENTAR CORRIGIR word2 PRIMEIRO
  const fixesForWord2 = rhymeFixes[word2.toLowerCase()]
  if (fixesForWord2) {
    for (const fix of fixesForWord2) {
      if (fix !== word2) {
        const newLine2 = line2.replace(new RegExp(`${word2}$`, "i"), fix)
        const newRhyme = analyzeSimpleRhyme(word1, fix)
        if (newRhyme.score > currentRhyme.score) {
          return { 
            line1, 
            line2: newLine2, 
            improved: true 
          }
        }
      }
    }
  }
  
  // ✅ TENTAR CORRIGIR word1 SE PRECISAR
  const fixesForWord1 = rhymeFixes[word1.toLowerCase()]
  if (fixesForWord1) {
    for (const fix of fixesForWord1) {
      if (fix !== word1) {
        const newLine1 = line1.replace(new RegExp(`${word1}$`, "i"), fix)
        const newRhyme = analyzeSimpleRhyme(fix, word2)
        if (newRhyme.score > currentRhyme.score) {
          return { 
            line1: newLine1, 
            line2, 
            improved: true 
          }
        }
      }
    }
  }
  
  return { line1, line2, improved: false }
}

// ✅ PROCESSAMENTO AGGRESSIVO DA LETRA COMPLETA
function applyAggressiveFixes(lyrics: string): string {
  const lines = lyrics.split('\n')
  const fixedLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    let currentLine = lines[i]
    
    // ✅ CORRIGIR LINHA ATUAL
    currentLine = validateAndFixLine(currentLine)
    
    // ✅ CORRIGIR RIMAS EM PARES
    if (i < lines.length - 1 && 
        !lines[i].startsWith('[') && !lines[i + 1].startsWith('[') &&
        !lines[i].startsWith('(') && !lines[i + 1].startsWith('(') &&
        lines[i].trim() && lines[i + 1].trim()) {
      
      const nextLine = lines[i + 1]
      const rhymeFix = improvePoorRhymes(currentLine, nextLine)
      
      if (rhymeFix.improved) {
        fixedLines.push(rhymeFix.line1)
        fixedLines.push(rhymeFix.line2)
        i++ // Pular próxima linha já que foi corrigida
        continue
      }
    }
    
    fixedLines.push(currentLine)
  }
  
  return fixedLines.join('\n')
}

// ✅ ATUALIZAR A MONTAGEM DA MÚSICA PARA USAR CORREÇÕES AGGRESSIVAS
async function assembleRewrittenSong(
  blocks: Record<string, MusicBlock[]>,
  genre: string,
  theme: string
): Promise<{ lyrics: string; rhymeImprovements: string[]; rhymeScore: number }> {
  
  const structure = [
    { type: "INTRO", label: "Intro" },
    { type: "VERSE", label: "Verso 1" },
    { type: "CHORUS", label: "Refrão" },
    { type: "VERSE", label: "Verso 2" },
    { type: "CHORUS", label: "Refrão" },
    { type: "BRIDGE", label: "Ponte" },
    { type: "CHORUS", label: "Refrão Final" },
    { type: "OUTRO", label: "Outro" },
  ]

  let lyrics = ""

  for (const section of structure) {
    const availableBlocks = blocks[section.type] || []
    if (availableBlocks.length > 0) {
      const bestBlock = availableBlocks.reduce((best, current) => 
        (current.rhymeScore || 0) > (best.rhymeScore || 0) ? current : best
      )
      lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
    } else {
      const fallback = generateQualityFallback(section.type as any, "")
      lyrics += `[${section.label}]\n${fallback.content}\n\n`
    }
  }

  try {
    // ✅ PRIMEIRO: Balanceamento de sílabas
    let processedLyrics = await UnifiedSyllableManager.processSongWithBalance(lyrics.trim())
    
    // ✅ SEGUNDO: CORREÇÕES AGGRESSIVAS DE LINHAS INCOMPLETAS E RIMAS POBRES
    processedLyrics = applyAggressiveFixes(processedLyrics)
    
    // ✅ TERCEIRO: Melhoria de rimas
    const rhymeEnhancement = await enhanceLyricsRhymes(processedLyrics, genre)
    
    // ✅ QUARTO: APLICAR CORREÇÕES NOVAMENTE PARA GARANTIR
    let finalLyrics = applyAggressiveFixes(rhymeEnhancement.enhancedLyrics)
    
    // Análise final
    const finalAnalysis = analyzeLyricsRhymeScheme(finalLyrics)
    
    return {
      lyrics: finalLyrics,
      rhymeImprovements: [...rhymeEnhancement.improvements, "Correções agressivas aplicadas"],
      rhymeScore: finalAnalysis.score
    }
    
  } catch (error) {
    console.error("[RewriteAssemble] Erro no processamento:", error)
    // ✅ APLICAR CORREÇÕES MESMO NO FALLBACK
    const correctedLyrics = applyAggressiveFixes(lyrics.trim())
    const analysis = analyzeLyricsRhymeScheme(correctedLyrics)
    
    return {
      lyrics: correctedLyrics,
      rhymeImprovements: ["Correções básicas aplicadas"],
      rhymeScore: analysis.score
    }
  }
}
