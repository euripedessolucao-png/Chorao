import { generateText } from "ai"
import { countSyllablesSingingPtBr } from "./singing-syllable-counter"

export class LyricsCompletionEngine {
  static async completeBrokenLines(lyrics: string): Promise<string> {
    console.log("🔧 [LyricsCompletionEngine] Completando linhas quebradas...")

    const lines = lyrics.split("\n")
    const completedLines: string[] = []
    let completions = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Ignora cabeçalhos e linhas vazias
      if (this.isHeadingLine(line) || !line) {
        completedLines.push(line)
        continue
      }

      // Detecta linhas quebradas
      if (this.isBrokenLine(line)) {
        console.log(`🔄 Completando linha quebrada: "${line}"`)

        const context = this.buildContext(lines, i)
        const completedLine = await this.rewriteBrokenLine(line, context)

        if (completedLine && completedLine !== line) {
          completedLines.push(completedLine)
          completions++
          continue
        }
      }

      completedLines.push(line)
    }

    console.log(`✅ ${completions} linhas completadas`)
    return completedLines.join("\n")
  }

  private static isBrokenLine(line: string): boolean {
    const brokenIndicators = [
      // Frases cortadas
      /\b(que|o|a|os|as|um|uma|uns|umas|de|do|da|no|na|em|por|pra|pro|meu|minha|seu|sua|nosso|nossa|todo|toda)\s*$/i,
      /\b(todos|todas|alguns|algumas|muito|muita|pouco|pouca)\s*$/i,
      /\b(sem|com|para|porque|quando|onde|como|que)\s*$/i,

      // Estruturas incompletas
      /^[^,]+,\s*[^,]?$/,
      /,\s*$/,

      // Palavras incompletas
      /coraçã$/,
      /inspiraçã$/,
      /razã$/,

      // Linhas muito curtas com significado incompleto
      (line: string) => {
        const words = line.split(/\s+/).filter((w) => w.length > 2)
        return words.length <= 2 && line.length < 15 && !line.endsWith("!") && !line.endsWith("?")
      },
    ]

    return brokenIndicators.some((indicator) =>
      typeof indicator === "function" ? indicator(line) : indicator.test(line),
    )
  }

  private static buildContext(lines: string[], currentIndex: number): string {
    const context: string[] = []

    // Linha anterior
    if (currentIndex > 0) {
      context.push(`Anterior: ${lines[currentIndex - 1]}`)
    }

    // Linha atual (quebrada)
    context.push(`Quebrada: ${lines[currentIndex]}`)

    // Próximas 2 linhas para contexto
    for (let i = 1; i <= 2; i++) {
      if (currentIndex + i < lines.length) {
        context.push(`Próxima ${i}: ${lines[currentIndex + i]}`)
      }
    }

    return context.join("\n")
  }

  private static async rewriteBrokenLine(brokenLine: string, context: string): Promise<string> {
    try {
      const prompt = `CORRIJA ESTA LINHA DE MÚSICA QUEBRADA:

CONTEXTO:
${context}

INSTRUÇÕES:
1. COMPLETE a linha mantendo o sentido original
2. Use 8-12 sílabas poéticas
3. Mantenha a rima e estrutura musical
4. Use linguagem natural brasileira
5. Evite clichês ("coração", "amor")

EXEMPLOS:
• "Teus abraços aquecem meu coraçã" → "Teus abraços aquecem meu coração"
• "Meu peito, a vida é um" → "Meu peito guarda a vida em seu calor"
• "que Deus" → "que Deus me deu pra viver"

LINHA QUEBRADA: "${brokenLine}"

LINHA CORRIGIDA:`

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.3,
        maxOutputTokens: 100,
      })

      const corrected =
        text
          ?.trim()
          .split("\n")[0]
          ?.replace(/^["']|["']$/g, "") || brokenLine

      // Valida correção
      const syllables = countSyllablesSingingPtBr(corrected, {
        applyElisions: true,
        applyContractions: true,
      })

      if (syllables >= 8 && syllables <= 12 && !this.isBrokenLine(corrected)) {
        return corrected
      }

      return brokenLine
    } catch (error) {
      console.warn(`❌ Erro ao corrigir linha: ${brokenLine}`, error)
      return brokenLine
    }
  }

  private static isHeadingLine(line: string): boolean {
    return /^\s*\[(?:Intro|Verso|Pré-Refrão|Refrão|Ponte|Outro|Instrumentation)/i.test(line)
  }
}
