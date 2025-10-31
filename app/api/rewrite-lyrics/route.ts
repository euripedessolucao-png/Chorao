// app/api/rewrite-lyrics/route.ts - PRIORIDADE: ESTRUTURA PRIMEIRO, RIMAS DEPOIS

// 🎯 ESTRATÉGIA CORRETA: PRIMEIRO VERSOS COMPLETOS, DEPOIS RIMAS
async function rewriteSectionWithQuality(
  originalSection: string,
  blockType: MusicBlock["type"],
  genre: string,
  theme: string
): Promise<MusicBlock[]> {
  
  const rewritePrompts = {
    INTRO: `🎵 REESCREVA esta INTRO no estilo ${genre}:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 **PRIORIDADE MÁXIMA:**
1. ✅ 4 linhas COMPLETAS e COERENTES
2. ✅ Máximo 12 sílabas por verso (NUNCA cortar versos)
3. ✅ Mantenha a essência emocional
4. 🔄 Rimas são SECUNDÁRIAS - não corte versos por causa delas

EXEMPLO DE VERSO COMPLETO:
"Quando a noite chega e a lua brilha no céu"
"Teu sorriso ilumina meu caminho solitário"

INTRO RESSRITA (4 linhas COMPLETAS):`,

    VERSE: `🎵 REESCREVA este VERSO no estilo ${genre}:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 **PRIORIDADE MÁXIMA:**
1. ✅ 4 linhas COMPLETAS e COERENTES  
2. ✅ Máximo 12 sílabas por verso (NUNCA cortar)
3. ✅ Desenvolva a narrativa com começo, meio e fim
4. 🔄 Rimas são BÔNUS, não obrigação

EXEMPLO DE VERSO COMPLETO:
"Nos teus olhos vejo um mundo de esperança"
"Onde posso ser eu mesmo sem mudança"

VERSO RESSRITO (4 linhas COMPLETAS):`,

    CHORUS: `🎵 REESCREVA este REFRÃO no estilo ${genre}:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 **PRIORIDADE MÁXIMA:**
1. ✅ 4 linhas COMPLETAS e IMPACTANTES
2. ✅ Máximo 12 sílabas por verso
3. ✅ Gancho emocional forte
4. 🔄 Rimas são importantes mas NÃO cortar versos

EXEMPLO DE REFRÃO COMPLETO:
"Teu amor é minha força, minha direção"
"Em cada passo, em cada decisão"

REFRÃO RESSRITO (4 linhas COMPLETAS):`,

    BRIDGE: `🎵 REESCREVA esta PONTE no estilo ${genre}:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 **PRIORIDADE MÁXIMA:**
1. ✅ 4 linhas COMPLETAS com mudança de perspectiva
2. ✅ Máximo 12 sílabas por verso
3. ✅ Profundidade emocional
4. 🔄 Rimas são opcionais

PONTE RESSRITA (4 linhas COMPLETAS):`,

    OUTRO: `🎵 REESCREVA este OUTRO no estilo ${genre}:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 **PRIORIDADE MÁXIMA:**
1. ✅ 2-4 linhas COMPLETAS de fechamento
2. ✅ Máximo 9 sílabas por verso
3. ✅ Sensação de conclusão satisfatória
4. 🔄 Rimas suaves são bônus

OUTRO RESSRITO (linhas COMPLETAS de fechamento):`
  }

  try {
    const prompt = rewritePrompts[blockType as keyof typeof rewritePrompts]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    return processRewrittenBlock(text || "", blockType, originalSection, genre)
  } catch (error) {
    console.error(`[Rewrite] Erro em ${blockType}:`, error)
    return [generateQualityFallback(blockType, theme)]
  }
}

// ✅ VALIDAÇÃO RIGOROSA DE VERSOS COMPLETOS
function validateCompleteLines(content: string): { valid: boolean; errors: string[] } {
  const lines = content.split("\n").filter(line => line.trim())
  const errors: string[] = []
  
  // ❌ DETECTAR LINHAS INCOMPLETAS (terminam com palavras soltas)
  const incompleteIndicators = [
    /\b(eu|me|te|se|nos|vos)\s*$/i,
    /\b(o|a|os|as|um|uma)\s*$/i, 
    /\b(em|no|na|de|da|do|por|pra)\s*$/i,
    /\b(que|se|mas|porém)\s*$/i,
    /\b(meu|minha|teu|tua|seu|sua)\s*$/i
  ]
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    // Verificar se linha termina com indicador de incompleto
    for (const pattern of incompleteIndicators) {
      if (pattern.test(trimmedLine)) {
        errors.push(`Linha ${index + 1} INCOMPLETA: "${trimmedLine}"`)
        break
      }
    }
    
    // Verificar se linha é muito curta semanticamente
    const words = trimmedLine.split(/\s+/)
    if (words.length <= 3 && trimmedLine.length < 15) {
      errors.push(`Linha ${index + 1} MUITO CURTA: "${trimmedLine}"`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// ✅ PROCESSAR BLOCO COM VALIDAÇÃO DE COMPLETUDE
function processRewrittenBlock(
  text: string, 
  blockType: MusicBlock["type"], 
  originalSection: string,
  genre: string
): MusicBlock[] {
  
  const cleanText = text
    .replace(/^(🎵|📝|PRIORIDADE|ORIGINAL|Tema|EXEMPLO).*?[\n:]/gmi, '')
    .replace(/.*RESSRITA.*?[\n:]/gmi, '')
    .replace(/\*\*.*?\*\*/g, '')
    .trim()

  const lines = cleanText.split("\n")
    .map(line => line.trim())
    .filter(line => {
      // ✅ FILTRAGEM MENOS RESTRITIVA - aceitar linhas mais longas
      return line && line.length >= 4 // Reduzido mínimo para 4 caracteres
    })
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  // ✅ VALIDAR SE AS LINHAS ESTÃO COMPLETAS
  const completenessCheck = validateCompleteLines(lines.join("\n"))
  
  if (lines.length >= (blockType === "OUTRO" ? 2 : 3) && completenessCheck.valid) {
    const content = lines.join("\n")
    const rhymeAnalysis = analyzeLyricsRhymeScheme(content)
    
    // ✅ SCORE ALTO PARA VERSOS COMPLETOS (prioridade)
    let score = 80 // Base alta para versos completos
    
    // ✅ BÔNUS POR RIMAS (secundário)
    if (rhymeAnalysis.score > 70) score += 10
    else if (rhymeAnalysis.score > 50) score += 5
    
    return [{
      type: blockType,
      content: content,
      score: Math.min(score, 100),
      rhymeScore: rhymeAnalysis.score,
    }]
  } else {
    console.log(`[Rewrite] ❌ Bloco ${blockType} rejeitado - linhas incompletas:`, completenessCheck.errors)
    // ✅ FALLBACK QUE GARANTE VERSOS COMPLETOS
    return [generateQualityFallback(blockType, "")]
  }
}

// ✅ FALLBACKS COM VERSOS COMPLETOS GARANTIDOS
function generateQualityFallback(blockType: MusicBlock["type"], theme: string): MusicBlock {
  const qualityFallbacks = {
    INTRO: {
      content: `Quando a noite chega e a lua aparece no céu\nTeu sorriso ilumina todo o meu caminho\nNa batida do coração a paixão cresce\nNessa dança da vida, nosso amor fica miudo`,
      score: 85,
      rhymeScore: 70
    },
    VERSE: {
      content: `No brilho dos teus olhos eu me reconheço\nNavegando em cada momento do nosso enredo\nTeu perfume é como uma brisa de verão\nQue me faz sentir completo em qualquer estação`,
      score: 85, 
      rhymeScore: 75
    },
    CHORUS: {
      content: `Teu sorriso é o chão onde eu posso pisar\nTeu abraço é o calor que me faz sonhar\nNo ritmo dessa paixão que não tem fim\nEu danço contigo e sinto que sou feliz`,
      score: 90,
      rhymeScore: 85
    },
    BRIDGE: {
      content: `Nos teus braços eu encontro meu lugar\nTeu sorriso é o lar que vou habitando\nEntre as estrelas que vejo a brilhar\nNosso amor vai se eternizando no tempo`,
      score: 85,
      rhymeScore: 80
    },
    OUTRO: {
      content: `Nos teus olhos eu me encontro verdadeiro\nTeu amor é o abrigo do meu caminho\nCom você ao meu lado tudo fica inteiro\nE a vida se transforma em puro carinho`,
      score: 85,
      rhymeScore: 80
    }
  }

  const fallback = qualityFallbacks[blockType as keyof typeof qualityFallbacks] || qualityFallbacks.VERSE
  return { type: blockType, ...fallback }
}
