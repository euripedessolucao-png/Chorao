"use client"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { GenreSelect } from "@/components/genre-select"
import { SubgenreSelect } from "@/components/subgenre-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChorusGenerator } from "@/components/chorus-generator"
import { Wand2 } from "lucide-react"

// ✅ IMPORTAÇÃO CORRIGIDA
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"

const MOODS = ["Feliz", "Triste", "Nostálgico", "Romântico", "Animado", "Melancólicico"]
const EMOTIONS = [
  "Alegria", "Alívio", "Amor", "Ansiedade", "Confusão", "Conexão", "Coragem", "Culpa",
  "Desapego", "Desilusão", "Desprezo", "Empolgação", "Empoderamento", "Encantamento",
  "Esperança", "Euforia", "Gratidão", "Inveja", "Liberdade", "Medo", "Melancolia",
  "Nostalgia", "Orgulho", "Paixão", "Paz", "Raiva", "Saudade", "Solidão", "Tensão",
  "Ternura", "Tristeza", "Vergonha"
]

// ✅ CONFIGURAÇÃO ATUALIZADA COM SISTEMA UNIFICADO
const GENRE_QUALITY_CONFIG = {
  "Sertanejo": { max: 12, ideal: 9, rhymeQuality: 0.5 },
  "Sertanejo Moderno": { max: 12, ideal: 9, rhymeQuality: 0.5 },
  "Sertanejo Universitário": { max: 12, ideal: 9, rhymeQuality: 0.5 },
  "Sertanejo Sofrência": { max: 12, ideal: 9, rhymeQuality: 0.5 },
  "Sertanejo Raiz": { max: 12, ideal: 10, rhymeQuality: 0.6 },
  "MPB": { max: 13, ideal: 10, rhymeQuality: 0.7 },
  "Bossa Nova": { max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Funk": { max: 12, ideal: 6, rhymeQuality: 0.3 },
  "Pagode": { max: 12, ideal: 9, rhymeQuality: 0.4 },
  "Samba": { max: 12, ideal: 9, rhymeQuality: 0.4 },
  "Forró": { max: 12, ideal: 9, rhymeQuality: 0.4 },
  "Axé": { max: 12, ideal: 8, rhymeQuality: 0.3 },
  "Rock": { max: 12, ideal: 10, rhymeQuality: 0.4 },
  "Pop": { max: 12, ideal: 9, rhymeQuality: 0.4 },
  "Gospel": { max: 12, ideal: 9, rhymeQuality: 0.5 },
  "default": { max: 12, ideal: 9, rhymeQuality: 0.4 },
}

export default function EditarPage() {
  const [genre, setGenre] = useState("")
  const [subgenre, setSubgenre] = useState("")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [inspirationText, setInspirationText] = useState("")
  const [literaryGenre, setLiteraryGenre] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [projectId, setProjectId] = useState<number | null>(null)
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [creativity, setCreativity] = useState([80])
  const [formattingStyle, setFormattingStyle] = useState<"padrao" | "performatico">("performatico")
  const [universalPolish, setUniversalPolish] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ text: string; timestamp: number }>>([])
  const [showChorusDialog, setShowChorusDialog] = useState(false)
  const [selectedChoruses, setSelectedChoruses] = useState<any[]>([])

  // ✅ FUNÇÃO CORRIGIDA - USA SISTEMA UNIFICADO
  const getSyllableConfig = (selectedGenre: string) => {
    const rules = UnifiedSyllableManager.getSyllableRules(selectedGenre)
    return {
      max: rules.max,
      ideal: rules.ideal,
      min: rules.min
    }
  }

  useEffect(() => {
    const editingProject = localStorage.getItem("editingProject")
    if (editingProject) {
      try {
        const project = JSON.parse(editingProject)
        setProjectId(project.id)
        setTitle(project.title || "")
        setLyrics(project.lyrics || "")
        setGenre(project.genre || "")
        localStorage.removeItem("editingProject")
        toast.success("Projeto carregado", {
          description: `"${project.title}" foi carregado no editor.`,
        })
      } catch (error) {
        toast.error("Erro ao carregar projeto")
      }
    }
  }, [])

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => 
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    )
  }

  const addInspiration = () => {
    if (!inspirationText.trim()) {
      toast.error("Digite uma inspiração primeiro")
      return
    }
    setSavedInspirations((prev) => [...prev, { text: inspirationText, timestamp: Date.now() }])
    setInspirationText("")
    toast.success("Inspiração adicionada")
  }

  // ✅ FUNÇÃO PRINCIPAL CORRIGIDA
  const handleEditLyrics = async () => {
    if (!lyrics.trim()) {
      toast.error("Por favor, cole a letra para editar")
      return
    }

    if (!genre) {
      toast.error("Por favor, selecione um gênero")
      return
    }

    setIsEditing(true)

    try {
      // ✅ USA SISTEMA UNIFICADO
      const syllableConfig = getSyllableConfig(genre)
      
      const fullRequirements = subgenre ? 
        `${additionalReqs}\n\nRitmo/Subgênero: ${subgenre}` : 
        additionalReqs

      const requestBody = {
        originalLyrics: lyrics,
        genre,
        mood: mood || "Romântico",
        theme: theme || "Amor",
        additionalRequirements: fullRequirements,
        title,
        performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
        creativity: getCreativityLevel(creativity[0]),
        applyFinalPolish: universalPolish
      }

      const response = await fetch("/api/rewrite-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status} na API`)
      }

      if (!data.lyrics && !data.letra) {
        throw new Error("Resposta da API não contém letra")
      }

      setLyrics(data.lyrics || data.letra)
      if (data.title && !title) {
        setTitle(data.title)
      }

      // ✅ MENSAGEM ATUALIZADA
      if (data.metadata?.thirdWayApplied) {
        toast.success("Letra editada com Terceira Via!", {
          description: `Sistema anti-clichês aplicado para ${genre}`,
        })
      } else if (data.metadata?.polishingApplied) {
        toast.success("Letra editada com Sistema Universal!", {
          description: `Polimento específico para ${genre} aplicado`,
        })
      } else {
        toast.success("Letra editada com sucesso!")
      }
    } catch (error) {
      console.error("Erro na edição:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao editar letra")
    } finally {
      setIsEditing(false)
    }
  }

  const handleSave = () => {
    if (!title.trim() || !lyrics.trim()) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha o título e a letra antes de salvar.",
      })
      return
    }

    const projects = JSON.parse(localStorage.getItem("projects") || "[]")

    if (projectId) {
      const index = projects.findIndex((p: any) => p.id === projectId)
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          title,
          lyrics,
          genre,
          date: new Date().toISOString(),
        }
      }
    } else {
      const newProject = {
        id: Date.now(),
        title,
        genre,
        lyrics,
        date: new Date().toISOString(),
      }
      projects.push(newProject)
      setProjectId(newProject.id)
    }

    localStorage.setItem("projects", JSON.stringify(projects))

    toast.success("Projeto salvo", {
      description: `"${title}" foi salvo com sucesso na galeria.`,
    })
  }

  const handleCopy = () => {
    if (!lyrics.trim()) {
      toast.error("Nada para copiar", {
        description: "A letra está vazia.",
      })
      return
    }

    navigator.clipboard.writeText(lyrics)
    toast.success("Letra copiada", {
      description: "A letra foi copiada para a área de transferência.",
    })
  }

  const handleClear = () => {
    if (window.confirm("Tem certeza que deseja limpar a letra? Esta ação não pode ser desfeita.")) {
      setLyrics("")
      setTitle("")
      toast.success("Letra limpa")
    }
  }

  const handleGenerateChorus = () => {
    if (!genre || !theme) {
      toast.error("Selecione gênero e tema antes de gerar o refrão")
      return
    }
    setShowChorusDialog(true)
  }

  const handleSelectChoruses = (choruses: any[]) => {
    setSelectedChoruses(choruses)
  }

  const handleApplyChoruses = () => {
    if (selectedChoruses.length === 0) {
      toast.error("Selecione pelo menos um refrão")
      return
    }

    const chorusText = selectedChoruses.map((c) => c.chorus.replace(/\s\/\s/g, "\n")).join("\n\n")
    const updatedReqs = additionalReqs ? 
      `${additionalReqs}\n\n[CHORUS]\n${chorusText}` : 
      `[CHORUS]\n${chorusText}`

    setAdditionalReqs(updatedReqs)
    setShowChorusDialog(false)

    toast.success("Refrão(ões) adicionado(s) aos requisitos!")
  }

  // ✅ FUNÇÃO CORRIGIDA
  const getCreativityLevel = (sliderValue: number): "conservador" | "equilibrado" | "ousado" => {
    if (sliderValue < 40) return "conservador"
    if (sliderValue < 70) return "equilibrado"
    return "ousado"
  }

  const getCreativityLabel = (value: number) => {
    if (value < 40) return "Muito Conservador"
    if (value < 70) return "Equilibrado"
    return "Muito Criativo"
  }

  // ... (restante do JSX permanece igual - já está bom)
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* ... JSX existente ... */}
    </div>
  )
}
