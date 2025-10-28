/**
 * Script de Teste: Validação de Reescrita
 * Testa o fluxo completo de reescrita com a letra original do usuário
 */

const ORIGINAL_LYRICS = `Eu tô aqui pensando em você
Lembrando de tudo que a gente viveu
Cada momento, cada olhar
Tudo isso ainda tá guardado aqui

Eu sei que o tempo passou
E a gente seguiu cada um pro seu lado
Mas tem dias que eu paro e penso
Se você também lembra de mim

[Refrão]
E se a gente se encontrar
Será que vai ser como antes?
Ou o tempo mudou a gente
E não dá mais pra voltar?

Eu queria te dizer
Que você ainda mora aqui
No meu peito, no meu coração
Mesmo que a vida nos separou

[Refrão]
E se a gente se encontrar
Será que vai ser como antes?
Ou o tempo mudou a gente
E não dá mais pra voltar?`

interface TestResult {
  success: boolean
  lyrics: string
  metadata: {
    finalScore: number
    syllableCorrections: number
    stackingScore: number
    syllableViolations: number
    verseCompletenessScore: number
    incompleteVerses: number
  }
  issues: string[]
}

async function testRewriteValidation(): Promise<TestResult> {
  console.log("🧪 Iniciando teste de validação de reescrita...")
  console.log("📝 Letra original:")
  console.log(ORIGINAL_LYRICS)
  console.log("\n" + "=".repeat(80) + "\n")

  const issues: string[] = []

  try {
    const response = await fetch("http://localhost:3000/api/rewrite-lyrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalLyrics: ORIGINAL_LYRICS,
        genre: "Sertanejo",
        mood: "Nostálgico",
        theme: "Saudade de um amor passado",
        performanceMode: "performance",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.error}`)
    }

    const data = await response.json()

    console.log("✅ Reescrita concluída!")
    console.log("\n📊 Métricas:")
    console.log(`   - Score Final: ${data.metadata.finalScore}%`)
    console.log(`   - Correções de Sílabas: ${data.metadata.syllableCorrections}`)
    console.log(`   - Score de Empilhamento: ${data.metadata.stackingScore}%`)
    console.log(`   - Violações de Sílabas: ${data.metadata.syllableViolations}`)
    console.log(`   - Completude dos Versos: ${data.metadata.verseCompletenessScore}%`)
    console.log(`   - Versos Incompletos: ${data.metadata.incompleteVerses}`)

    console.log("\n📝 Letra Reescrita:")
    console.log(data.lyrics)

    // Validações
    if (data.metadata.finalScore < 80) {
      issues.push(`Score final baixo: ${data.metadata.finalScore}%`)
    }

    if (data.metadata.syllableViolations > 0) {
      issues.push(`${data.metadata.syllableViolations} violações de sílabas encontradas`)
    }

    if (data.metadata.verseCompletenessScore < 100) {
      issues.push(`Completude dos versos não é 100%: ${data.metadata.verseCompletenessScore}%`)
    }

    if (data.metadata.incompleteVerses > 0) {
      issues.push(`${data.metadata.incompleteVerses} versos incompletos detectados`)
    }

    // Verifica se a estrutura está correta
    const hasIntro = data.lyrics.includes("[INTRO]")
    const hasVerse = data.lyrics.includes("[VERSE")
    const hasChorus = data.lyrics.includes("[CHORUS]")
    const hasOutro = data.lyrics.includes("[OUTRO]")

    if (!hasIntro) issues.push("Falta seção [INTRO]")
    if (!hasVerse) issues.push("Falta seção [VERSE]")
    if (!hasChorus) issues.push("Falta seção [CHORUS]")
    if (!hasOutro) issues.push("Falta seção [OUTRO]")

    // Verifica se não há versos cortados
    const lines = data.lyrics.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith("[") && !line.startsWith("(")) {
        if (line.endsWith("-") || line.endsWith(",")) {
          issues.push(`Linha ${i + 1} pode estar incompleta: "${line}"`)
        }
      }
    }

    console.log("\n" + "=".repeat(80))
    if (issues.length === 0) {
      console.log("✅ TESTE PASSOU! Nenhum problema encontrado.")
    } else {
      console.log("⚠️  PROBLEMAS ENCONTRADOS:")
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`)
      })
    }

    return {
      success: issues.length === 0,
      lyrics: data.lyrics,
      metadata: data.metadata,
      issues,
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error)
    throw error
  }
}

// Executa o teste
testRewriteValidation()
  .then((result) => {
    console.log("\n🏁 Teste finalizado")
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error("💥 Teste falhou:", error)
    process.exit(1)
  })
