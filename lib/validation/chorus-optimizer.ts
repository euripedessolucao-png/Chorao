import { countSyllablesSingingPtBr } from "./singing-syllable-counter"
import { _rewriteWithinSyllables } from "./intelligent-rewriter"
import { generateText } from "ai" // ← CORRETO

export function enforceChorusRules(lyrics: string, hook?: string): string {
  const h = (hook || "").trim()
  const lines = lyrics.split(/\r?\n/)

  const isHeading = (s: string) =>
    /^\s*\[(?:INTRO|VERSE\s*\d*|PRE-?CHORUS|CHORUS|FINAL\s+CHORUS|BRIDGE|SOLO|OUTRO)/i.test(s)

  const findSections = (regex: RegExp) => {
    const out: Array<{ start: number; end: number }> = []
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i] ?? "")) {
        let end = lines.length
        for (let j = i + 1; j < lines.length; j++) {
          if (isHeading(lines[j] ?? "")) {
            end = j
            break
          }
        }
        out.push({ start: i, end })
      }
    }
    return out
  }

  const targets = [...findSections(/^\s*\[CHORUS/i), ...findSections(/^\s*\[FINAL\s+CHORUS/i)].sort(
    (a, b) => b.start - a.start,
  )

  for (const sec of targets) {
    let start = sec.start + 1
    while (start < sec.end && (lines[start] ?? "").trim() === "") start++
    const end = sec.end

    const content = lines.slice(start, end).filter((l) => (l ?? "").trim() !== "")

    // Remove duplicatas mantendo ordem
    const seen = new Set<string>()
    const deduped: string[] = []
    for (const l of content) {
      const key = (l ?? "").trim().toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(l)
      }
    }

    // Hook no topo; repetir no final do "FINAL CHORUS"
    if (h) {
      if (!deduped[0] || !deduped[0].toLowerCase().includes(h.toLowerCase())) {
        deduped.unshift(h)
      }

      const isFinal = /^\s*\[FINAL\s+CHORUS/i.test(lines[sec.start] ?? "")
      if (isFinal) {
        const lastIdx = deduped.length - 1
        const lastLine = lastIdx >= 0 ? (deduped[lastIdx] ?? "") : ""
        if (lastIdx < 0 || !lastLine.toLowerCase().includes(h.toLowerCase())) {
          deduped.push(h)
        }
      }
    }

    // Limita a 6 linhas (enxuto e cantável)
    const limited = deduped.slice(0, 6)

    // Substitui no texto
    const deleteCount = end - start
    lines.splice(start, deleteCount, ...limited)
  }

  return lines.join("\n")
}

export async function applySertanejoChorusShaping(text: string, hookText: string): Promise<string> {
  const rules = { min: 6, max: 12, ideal: 9, lines: 4 }
  const hookWords = hookText.split(/\s+/).slice(0, 2).join(" ")

  let lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  // Garante hook na 1ª linha
  if (hookText && (!lines[0] || !lines[0].toLowerCase().includes(hookText.toLowerCase()))) {
    lines.unshift(hookText)
  }

  // Força 4 linhas (preenche com hook se faltar)
  if (lines.length > rules.lines) lines = lines.slice(0, rules.lines)
  while (lines.length < rules.lines) lines.push(hookText || lines[0] || "")

  // Ajuste suave de sílabas: reescrita em vez de cortes
  for (let i = 0; i < lines.length; i++) {
    let out = lines[i]
    const syl = countSyllablesSingingPtBr(out, {
      applyElisions: true,
      applyContractions: true,
    })

    if (syl > rules.max) {
      out = await _rewriteWithinSyllables(out, rules.max)
    } else if (syl < rules.min) {
      // Reforço leve: duplica última palavra curta ou cola parte do hook
      const last = (out.split(/\s+/).filter(Boolean).pop() || "ah").trim()
      const candidate =
        out + " " + (hookWords && !out.toLowerCase().includes(hookWords.toLowerCase()) ? hookWords : last)
      const after = countSyllablesSingingPtBr(candidate, {
        applyElisions: true,
        applyContractions: true,
      })

      if (after <= rules.max) out = candidate.trim()
    }

    lines[i] = out
  }

  return lines.join("\n")
}

export async function fixBrokenChorus(chorus: string): Promise<string> {
  const lines = chorus.split("\n").filter((line) => line.trim())

  if (lines.length < 4) return chorus

  const prompt = `REESCREVA ESTE REFRÃO QUEBRADO COM COERÊNCIA:

REFRÃO ORIGINAL (PROBLEMAS):
${lines.join("\n")}

REGRAS:
- 4 linhas com 9-12 sílabas cada
- Estrutura A-B-A-B ou A-A-B-B
- Significado coerente
- Linguagem natural do sertanejo/gospel
- Rimas ricas nas linhas pares

REFRÃO CORRIGIDO:`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.4,
      maxOutputTokens: 200,
    })

    return (
      text
        ?.split("\n")
        .filter((line) => line.trim() && !line.includes("REFRÃO") && !line.includes("REGRAS"))
        .slice(0, 4)
        .join("\n") || chorus
    )
  } catch (error) {
    console.warn("❌ Erro ao corrigir refrão:", error)
    return chorus
  }
}
