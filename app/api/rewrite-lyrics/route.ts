// APENAS a função generateBlockVariations precisa ser ajustada:

async function generateBlockVariations(
  blockType: MusicBlock["type"],
  genre: string,
  originalSection: string,
  sectionIndex: number // Novo parâmetro para variar por posição
): Promise<MusicBlock[]> {
  
  const lineTargets = {
    VERSE: 4,
    CHORUS: 4,
    BRIDGE: 4,
    OUTRO: 2
  }

  // PROMPTS COM CONTEXTUALIZAÇÃO POR POSIÇÃO
  const prompts = {
    VERSE: `Escreva APENAS 4 linhas para ${sectionIndex === 1 ? 'PRIMEIRO VERSO' : 'SEGUNDO VERSO'} ${genre}. NADA mais:

Original: "${originalSection.substring(0, 100)}"

4 LINHAS DIFERENTES do verso anterior:`,

    CHORUS: `Escreva APENAS 4 linhas para REFRÃO ${genre}. NADA mais:

Original: "${originalSection.substring(0, 100)}"

4 LINHAS MEMORÁVEIS:`,

    BRIDGE: `Escreva APENAS 4 linhas para PONTE ${genre}. NADA mais. Deve ser DIFERENTE dos versos:

Original: "${originalSection.substring(0, 100)}"

4 LINHAS DE REFLEXÃO:`,

    OUTRO: `Escreva APENAS 2 linhas para OUTRO ${genre}. NADA mais:

Original: "${originalSection.substring(0, 100)}"

2 LINHAS FINAIS:`
  }

  try {
    const prompt = prompts[blockType]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.3,
    })

    console.log(`[BlockGen] ${blockType}${sectionIndex} resposta:`, text)
    
    const processed = processBlockText(text || "", blockType, lineTargets[blockType])
    return processed.length > 0 ? [processed[0]] : [generateStrictFallback(blockType, originalSection)]
  } catch (error) {
    console.error(`[BlockGen] Erro em ${blockType}:`, error)
    return [generateStrictFallback(blockType, originalSection)]
  }
}
