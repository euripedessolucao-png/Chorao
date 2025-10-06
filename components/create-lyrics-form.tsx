"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Copy, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CreateLyricsForm() {
  const [genero, setGenero] = useState("")
  const [humor, setHumor] = useState("")
  const [tema, setTema] = useState("")
  const [criatividade, setCriatividade] = useState("equilibrado")
  const [hook, setHook] = useState("")
  const [inspiracao, setInspiracao] = useState("")
  const [metaforas, setMetaforas] = useState("")
  const [emocoes, setEmocoes] = useState<string[]>([])
  const [titulo, setTitulo] = useState("")
  const [letraGerada, setLetraGerada] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleEmocaoToggle = (emocao: string) => {
    setEmocoes((prev) => (prev.includes(emocao) ? prev.filter((e) => e !== emocao) : [...prev, emocao]))
  }

  const handleGerarLetra = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          genero,
          humor,
          tema,
          criatividade,
          hook,
          inspiracao,
          metaforas,
          emocoes,
          titulo,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar letra")
      }

      const data = await response.json()
      setLetraGerada(data.letra)

      toast({
        title: "Letra gerada com sucesso!",
        description: "Sua letra foi criada. Você pode editá-la ou salvá-la.",
      })
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Erro ao gerar letra",
        description: "Ocorreu um erro ao gerar a letra. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopiarLetra = () => {
    if (!letraGerada) {
      toast({
        title: "Nenhuma letra para copiar",
        description: "Gere uma letra primeiro antes de copiar.",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(letraGerada)
    toast({
      title: "Letra copiada!",
      description: "A letra foi copiada para a área de transferência.",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* COLUNA 1: Parâmetros da Letra */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Parâmetros da Letra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="genero">Gênero Musical</Label>
            <Select value={genero} onValueChange={setGenero}>
              <SelectTrigger id="genero">
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sertanejo-moderno">Sertanejo Moderno</SelectItem>
                <SelectItem value="sertanejo-raiz">Sertanejo Raiz</SelectItem>
                <SelectItem value="pagode">Pagode</SelectItem>
                <SelectItem value="mpb">MPB</SelectItem>
                <SelectItem value="pop">Pop</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="humor">Humor</Label>
            <Select value={humor} onValueChange={setHumor}>
              <SelectTrigger id="humor">
                <SelectValue placeholder="Selecione o humor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feliz">Feliz</SelectItem>
                <SelectItem value="triste">Triste</SelectItem>
                <SelectItem value="romantico">Romântico</SelectItem>
                <SelectItem value="nostalgico">Nostálgico</SelectItem>
                <SelectItem value="energetico">Energético</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">Tema</Label>
            <Input
              id="tema"
              placeholder="Ex: Amor, Perda, Jornada..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criatividade">Nível de Criatividade</Label>
            <Select value={criatividade} onValueChange={setCriatividade}>
              <SelectTrigger id="criatividade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservador">Conservador</SelectItem>
                <SelectItem value="equilibrado">Equilibrado</SelectItem>
                <SelectItem value="ousado">Ousado</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hook">Hook/Refrão (opcional)</Label>
            <Input
              id="hook"
              placeholder="Digite um refrão marcante..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* COLUNA 2: Inspiração & Sensações */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Inspiração & Sensações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inspiracao">Inspiração Literária</Label>
            <Textarea
              id="inspiracao"
              placeholder="Descreva referências literárias, poemas ou textos que inspiram..."
              className="min-h-[120px] resize-none"
              value={inspiracao}
              onChange={(e) => setInspiracao(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaforas">Metáforas Inteligentes</Label>
            <Textarea
              id="metaforas"
              placeholder="Sugira metáforas ou figuras de linguagem que gostaria de ver..."
              className="min-h-[120px] resize-none"
              value={metaforas}
              onChange={(e) => setMetaforas(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Tags de Emoção</Label>
            <div className="space-y-2">
              {["Alegria", "Tristeza", "Saudade", "Paixão"].map((emocao) => (
                <div key={emocao} className="flex items-center space-x-2">
                  <Checkbox
                    id={emocao}
                    checked={emocoes.includes(emocao)}
                    onCheckedChange={() => handleEmocaoToggle(emocao)}
                  />
                  <Label htmlFor={emocao} className="text-sm font-normal cursor-pointer">
                    {emocao}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COLUNA 3: Preview da Letra */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Preview da Letra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Música</Label>
            <Input
              id="titulo"
              placeholder="Digite o título..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="letra">Letra Gerada</Label>
            <Textarea
              id="letra"
              placeholder="A letra gerada aparecerá aqui..."
              className="min-h-[300px] resize-none font-mono text-sm"
              value={letraGerada}
              onChange={(e) => setLetraGerada(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGerarLetra}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Letra
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Salvar Projeto
              </Button>
              <Button variant="outline" size="lg" onClick={handleCopiarLetra}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Letra
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
