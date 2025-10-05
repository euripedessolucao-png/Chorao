"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Save, Copy, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function RewriteLyricsForm() {
  const [letraOriginal, setLetraOriginal] = useState("")
  const [generoConversao, setGeneroConversao] = useState("")
  const [conservarImagens, setConservarImagens] = useState(true)
  const [polirSemMexer, setPolirSemMexer] = useState(false)
  const [letraReescrita, setLetraReescrita] = useState("")
  const [qualidadeScore, setQualidadeScore] = useState(0)
  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [analisado, setAnalisado] = useState(false)

  const handleAnalisarLetra = () => {
    // Placeholder para análise
    setQualidadeScore(7.5)
    setSugestoes([
      "Adicionar mais metáforas visuais no segundo verso",
      "Reforçar a rima no refrão para maior impacto",
      "Considerar uma ponte melódica entre verso e refrão",
      "Explorar mais a temática emocional no final",
    ])
    setAnalisado(true)
  }

  const handleReescreverLetra = () => {
    // Placeholder para reescrita
    setLetraReescrita(
      `[Verso 1 - ${generoConversao}]\nSua letra transformada no novo gênero\nMantendo a essência e emoção original\n\n[Refrão]\nRefrão adaptado ao estilo escolhido\nCom a mesma mensagem, nova roupagem\n\n[Verso 2]\nContinuação da história recontada\nNo ritmo e linguagem do gênero selecionado`,
    )
  }

  const handleAplicarMelhorias = () => {
    // Placeholder para aplicar melhorias
    setLetraReescrita((prev) => prev + "\n\n[Melhorias aplicadas com sucesso]")
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
                  <SelectItem value="sertanejo-moderno">Sertanejo Moderno</SelectItem>
                  <SelectItem value="sertanejo-raiz">Sertanejo Raiz</SelectItem>
                  <SelectItem value="pagode">Pagode</SelectItem>
                  <SelectItem value="mpb">MPB</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="funk">Funk</SelectItem>
                  <SelectItem value="rap">Rap</SelectItem>
                </SelectContent>
              </Select>
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
                disabled={!letraOriginal}
              >
                <FileText className="w-4 h-4 mr-2" />
                Analisar Letra
              </Button>
              <Button
                onClick={handleReescreverLetra}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={!letraOriginal || !generoConversao}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Reescrever Letra
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
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="lg" disabled={!letraReescrita}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Cópia
                </Button>
                <Button variant="outline" size="lg" disabled={!letraReescrita}>
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