"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Cloud, Shield, Database, Download, Upload, FileJson, FileArchive, Calendar } from "lucide-react"

export default function BackupPage() {
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeAnalysis, setIncludeAnalysis] = useState(true)
  const [exportFormat, setExportFormat] = useState("json")
  const [autoBackup, setAutoBackup] = useState(false)
  const [cloudSave, setCloudSave] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log("[v0] File dropped:", e.dataTransfer.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Backup & Restauração</h1>
            <p className="text-muted-foreground">Proteja seus projetos e restaure quando necessário</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* SEÇÃO EXPORTAR */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Download className="h-5 w-5 text-blue-500" />
                  </div>
                  <CardTitle>Exportar Todos os Dados</CardTitle>
                </div>
                <CardDescription>Faça backup completo dos seus projetos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Database className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-2xl font-bold text-foreground">45</div>
                    <div className="text-xs text-muted-foreground">Projetos</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <FileJson className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <div className="text-2xl font-bold text-foreground">128</div>
                    <div className="text-xs text-muted-foreground">Letras</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Cloud className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <div className="text-2xl font-bold text-foreground">2.3MB</div>
                    <div className="text-xs text-muted-foreground">Tamanho</div>
                  </div>
                </div>

                {/* Opções */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metadata"
                      checked={includeMetadata}
                      onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                    />
                    <Label htmlFor="metadata" className="text-sm cursor-pointer">
                      Incluir metadados
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="analysis"
                      checked={includeAnalysis}
                      onCheckedChange={(checked) => setIncludeAnalysis(checked as boolean)}
                    />
                    <Label htmlFor="analysis" className="text-sm cursor-pointer">
                      Incluir análises
                    </Label>
                  </div>
                </div>

                {/* Formato */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Formato de Exportação</Label>
                  <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="json" id="json" />
                      <Label htmlFor="json" className="text-sm cursor-pointer">
                        JSON (Recomendado)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="txt" id="txt" />
                      <Label htmlFor="txt" className="text-sm cursor-pointer">
                        TXT (Texto Simples)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf" className="text-sm cursor-pointer">
                        PDF (Documento)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Botão Exportar */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Exportar Backup
                </Button>
              </CardContent>
            </Card>

            {/* SEÇÃO IMPORTAR */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Upload className="h-5 w-5 text-green-500" />
                  </div>
                  <CardTitle>Importar Backup</CardTitle>
                </div>
                <CardDescription>Restaure seus projetos de um backup anterior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-blue-500/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground mb-1">Arraste arquivo de backup aqui</p>
                  <p className="text-xs text-muted-foreground mb-4">Suporte para JSON e arquivos ZIP</p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivo
                  </Button>
                </div>

                {/* Preview */}
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileArchive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Preview da Importação</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Projetos encontrados:</span>
                      <span className="text-foreground font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Letras encontradas:</span>
                      <span className="text-foreground font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamanho total:</span>
                      <span className="text-foreground font-medium">-</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Backup
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SEÇÃO CONFIGURAÇÕES */}
          <Card className="border-border/50 bg-card/50 backdrop-blur mt-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle>Configurações de Backup</CardTitle>
              </div>
              <CardDescription>Configure backups automáticos e armazenamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Backup Automático */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup" className="text-sm font-medium">
                      Backup Automático Semanal
                    </Label>
                    <p className="text-xs text-muted-foreground">Crie backups automaticamente toda semana</p>
                  </div>
                  <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>

                {/* Salvar na Nuvem */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="cloud-save" className="text-sm font-medium">
                      Salvar na Nuvem
                    </Label>
                    <p className="text-xs text-muted-foreground">Armazene backups automaticamente na nuvem</p>
                  </div>
                  <Switch id="cloud-save" checked={cloudSave} onCheckedChange={setCloudSave} />
                </div>
              </div>

              {/* Último Backup */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Último Backup</p>
                  <p className="text-xs text-muted-foreground">12/Jan/2024 às 14:30</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
