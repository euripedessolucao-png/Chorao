"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Save, Copy, FileText, AlertCircle, Loader2 } from "lucide-react"
// COMENTE estas linhas:
// import { Progress } from "@/components/ui/progress"
// import { useToast } from "@/hooks/use-toast"

const BRAZILIAN_GENRE_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  Sertanejo: { syllablesPerLine: 7, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  Pagode: { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  Samba: { syllablesPerLine: 7, bpm: 105, structure: "VERSO-REFRAO-PONTE" },
  Forró: { syllablesPerLine: 8, bpm: 120, structure: "VERSO-REFRAO" },
  Axé: { syllablesPerLine: 6, bpm: 130, structure: "VERSO-REFRAO" },
  MPB: { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Bossa Nova": { syllablesPerLine: 8, bpm: 70, structure: "VERSO-REFRAO" },
  Rock: { syllablesPerLine: 8, bpm: 115, structure: "VERSO-REFRAO-SOLO" },
  Pop: { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  Funk: { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  Gospel: { syllablesPerLine: 8, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  default: { syllablesPerLine: 8, bpm: 100, structure: "VERSO-REFRAO" },
}

function countPortugueseSyllables(word: string): number {
  if (!word.trim()) return 0

  const cleanWord = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zà-úâ-ûã-õä-üç]/g, "")

  if (cleanWord.length === 0) return 0

  let syllableCount = 0
  let i = 0

  while (i < cleanWord.length) {
    const currentChar = cleanWord[i]

    if ("aeiouáéíóúâêîôûàèìòùãõ".includes(currentChar)) {
      syllableCount++

      if (i + 1 < cleanWord.length) {
        const nextChar = cleanWord[i + 1]
        if (
          ("aeo".includes(currentChar) && "iu".includes(nextChar)) ||
          ("iu".includes(currentChar) && "aeo".includes(nextChar))
        ) {
          i++
        }
      }
    }
    i++
  }

  return Math.max(1, syllableCount)
}

export function RewriteLyricsForm() {
  const [letraOriginal, setLetraOriginal] = useState("")
  const [generoConversao, setGeneroConversao] = useState("")
  const [conservarImagens, setConservarImagens] = useState(true)
  const [polirSemMexer, setPolirSemMexer] = useState(false)
  const [letraReescrita, setLetraReescrita] = useState("")
  const [qualidadeScore, setQualidadeScore] = useState(0)
  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [analisado, setAnalisado] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const { toast } = useToast()

  const currentMetrics =
    generoConversao && BRAZILIAN_GENRE_METRICS[generoConversao]
      ? BRAZILIAN_GENRE_METRICS[generoConversao]
      : BRAZILIAN_GENRE_METRICS.default

  const validateMetrics = (lyrics: string) => {
    if (!generoConversao || !lyrics) return null

    const metrics = BRAZILIAN_GENRE_METRICS[generoConversao] || BRAZILIAN_GENRE_METRICS.default
    const maxSyllables = metrics.syllablesPerLine

    const lines = lyrics.split("\n").filter((line) => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instrumental:")
    })

    const problematicLines = lines
      .map((line) => ({
        line,
        syllables: countPortugueseSyllables(line),
      }))
      .filter((item) => item.syllables > maxSyllables)

    return problematicLines
  }

  const originalProblematicLines = validateMetrics(letraOriginal)
  const rewrittenProblematicLines = validateMetrics(letraReescrita)

  const handleAnalisarLetra = () => {
    if (!letraOriginal) {
      toast({
        title: "Nenhuma letra para analisar",
        description: "Cole uma letra primeiro antes de analisar.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    // Simulação de análise
    setTimeout(() => {
      setQualidadeScore(7.5)
      setSugestoes([
        "Adicionar mais metáforas visuais no segundo verso",
        "Reforçar a rima no refrão para maior impacto",
        "Considerar uma ponte melódica entre verso e refrão",
        "Explorar mais a temática emocional no final",
      ])
      setAnalisado(true)
      setIsAnalyzing(false)

      toast({
        title: "Análise concluída!",
        description: "Confira as sugestões de melhoria.",
      })
    }, 1500)
  }

  const handleReescreverLetra = () => {
    if (!letraOriginal || !generoConversao) {
      toast({
        title: "Informações incompletas",
        description: "Preencha a letra original e selecione o gênero.",
        variant: "destructive",
      })
      return
    }

    setIsRewriting(true)

    // Simulação de reescrita
    setTimeout(() => {
      setLetraReescrita(
        `[Verso 1 - ${generoConversao}]\nSua letra transformada no novo gênero\nMantendo a essência e emoção original\n\n[Refrão]\nRefrão adaptado ao estilo escolhido\nCom a mesma mensagem, nova roupagem\n\n[Verso 2]\nContinuação da história recontada\nNo ritmo e linguagem do gênero selecionado\n\nMétrica: ${currentMetrics.syllablesPerLine} sílabas/linha | BPM: ${currentMetrics.bpm}`,
      )
      setIsRewriting(false)

      toast({
        title: "Letra reescrita com sucesso!",
        description: "Confira o resultado e faça ajustes se necessário.",
      })
    }, 2000)
  }

  const handleCorrigirMetrica = (isOriginal: boolean) => {
    const letra = isOriginal ? letraOriginal : letraReescrita
    const setLetra = isOriginal ? setLetraOriginal : setLetraReescrita

    const fixed = letra
      .split("\n")
      .map((line) => {
        if (countPortugueseSyllables(line) > currentMetrics.syllablesPerLine) {
          const words = line.split(" ")
          if (words.length > 2) {
            const mid = Math.floor(words.length / 2)
            return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ")
          }
        }
        return line
      })
      .join("\n")

    setLetra(fixed)

    toast({
      title: "Métrica corrigida!",
      description: "As linhas foram ajustadas para a métrica ideal.",
    })
  }

  const handleAplicarMelhorias = () => {
    setLetraReescrita((prev) => prev + "\n\n[Melhorias aplicadas com sucesso]")

    toast({
      title: "Melhorias aplicadas!",
      description: "As sugestões foram incorporadas à letra.",
    })
  }

  const handleCopiar = (texto: string) => {
    if (!texto) {
      toast({
        title: "Nenhum texto para copiar",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(texto)
    toast({
      title: "Texto copiado!",
      description: "O texto foi copiado para a área de transferência.",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SEÇÃO ESQUERDA: Input e Configurações */}
      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Letra Original</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="letra-original">Cole sua letra aqui...</Label>
              <Textarea
                id="letra-original"
                placeholder="Cole a letra que deseja reescrever ou melhorar..."
                className="min-h-[300px] resize-none font-mono text-sm"
                value={letraOriginal}
                onChange={(e) => setLetraOriginal(e.target.value)}
              />
            </div>

            {originalProblematicLines && originalProblematicLines.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-600 text-sm">Ajuste de Métrica Recomendado</span>
                </div>
                <p className="text-sm text-yellow-600/90">
                  <strong>{generoConversao}</strong> recomenda até{" "}
                  <strong>{currentMetrics.syllablesPerLine} sílabas</strong> por linha.
                  {originalProblematicLines.length} linha(s) precisam de ajuste.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => handleCopiar(letraOriginal)} variant="outline" size="sm" disabled={!letraOriginal}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>

              {originalProblematicLines && originalProblematicLines.length > 0 && (
                <Button
                  onClick={() => handleCorrigirMetrica(true)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/10"
                >
                  Corrigir Métrica
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="genero-conversao">Gênero para Conversão</Label>
              <Select value={generoConversao} onValueChange={setGeneroConversao}>
                <SelectTrigger id="genero-conversao">
                  <SelectValue placeholder="Selecione o gênero destino" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(BRAZILIAN_GENRE_METRICS)
                    .filter((g) => g !== "default")
                    .map((genreName) => (
                      <SelectItem key={genreName} value={genreName}>
                        {genreName} ({BRAZILIAN_GENRE_METRICS[genreName].syllablesPerLine}s)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {generoConversao && (
                <div className="mt-3 p-3 bg-primary/10 rounded-md border border-primary/20">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Métrica:</span>
                      <div className="font-medium text-foreground">{currentMetrics.syllablesPerLine} sílabas/linha</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ritmo:</span>
                      <div className="font-medium text-foreground">{currentMetrics.bpm} BPM</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estrutura:</span>
                      <div className="font-medium text-foreground text-xs">{currentMetrics.structure}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Opções de Reescrita</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="conservar-imagens"
                    checked={conservarImagens}
                    onCheckedChange={(checked) => setConservarImagens(checked as boolean)}
                  />
                  <Label htmlFor="conservar-imagens" className="text-sm font-normal cursor-pointer">
                    Conservar imagens originais
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="polir-sem-mexer"
                    checked={polirSemMexer}
                    onCheckedChange={(checked) => setPolirSemMexer(checked as boolean)}
                  />
                  <Label htmlFor="polir-sem-mexer" className="text-sm font-normal cursor-pointer">
                    Polir sem mexer na estrutura
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleAnalisarLetra}
                variant="outline"
                size="lg"
                className="w-full bg-transparent"
                disabled={!letraOriginal || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Analisar Letra
                  </>
                )}
              </Button>
              <Button
                onClick={handleReescreverLetra}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={!letraOriginal || !generoConversao || isRewriting}
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reescrevendo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reescrever Letra
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO DIREITA: Preview e Análise */}
      <div className="space-y-6">
        {analisado && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Análise de Qualidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Score de Qualidade</Label>
                  <span className="text-2xl font-bold text-primary">{qualidadeScore}/10</span>
                </div>
                <Progress value={qualidadeScore * 10} className="h-2" />
              </div>

              <div className="space-y-2">
                <Label>Sugestões de Melhoria</Label>
                <div className="space-y-2">
                  {sugestoes.map((sugestao, index) => (
                    <Card key={index} className="bg-muted/50 border-border/50">
                      <CardContent className="p-3">
                        <p className="text-sm text-muted-foreground">{sugestao}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Letra Reescrita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="letra-reescrita">Preview</Label>
              <Textarea
                id="letra-reescrita"
                placeholder="A letra reescrita aparecerá aqui..."
                className="min-h-[400px] resize-none font-mono text-sm"
                value={letraReescrita}
                onChange={(e) => setLetraReescrita(e.target.value)}
              />
            </div>

            {rewrittenProblematicLines && rewrittenProblematicLines.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-600 text-sm">Ajuste de Métrica Recomendado</span>
                </div>
                <p className="text-sm text-yellow-600/90">
                  <strong>{generoConversao}</strong> recomenda até{" "}
                  <strong>{currentMetrics.syllablesPerLine} sílabas</strong> por linha.
                  {rewrittenProblematicLines.length} linha(s) precisam de ajuste.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {analisado && (
                <Button
                  onClick={handleAplicarMelhorias}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  disabled={!letraReescrita}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Aplicar Melhorias
                </Button>
              )}

              {rewrittenProblematicLines && rewrittenProblematicLines.length > 0 && (
                <Button
                  onClick={() => handleCorrigirMetrica(false)}
                  variant="outline"
                  size="lg"
                  className="w-full border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/10"
                >
                  Corrigir Métrica
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="lg" disabled={!letraReescrita}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Cópia
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={!letraReescrita}
                  onClick={() => handleCopiar(letraReescrita)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Letra
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
