// components/syllable-validator-with-suggestions.tsx - ATUALIZADO

interface Suggestion {
  text: string
  syllables: number
}

export function SyllableValidatorWithSuggestions({ 
  lyrics, 
  maxSyllables = 11,
  onApplySuggestion 
}: {
  lyrics: string
  maxSyllables?: number
  onApplySuggestion: (lineNumber: number, newText: string) => void
}) {
  const validation = validateLyricsSyllables(lyrics, maxSyllables)
  
  if (validation.valid) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center text-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            ✅ Todos os versos respeitam o limite de {maxSyllables} sílabas!
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center text-amber-800 mb-3">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">
          ⚠️ {validation.violations.length} verso(s) com mais de {maxSyllables} sílabas
        </span>
      </div>

      <div className="space-y-3">
        {validation.violations.map((violation, index) => (
          <div key={index} className="p-3 bg-white border border-amber-100 rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-medium text-amber-700">
                  Linha {violation.lineNumber}: {violation.syllables} sílabas
                </span>
                <p className="text-sm text-gray-700 mt-1 font-mono">
                  "{violation.line}"
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                +{violation.syllables - maxSyllables}
              </Badge>
            </div>

            {/* ✅ SUGESTÕES SEGURAS - SEM PALAVRAS QUEBRADAS */}
            {violation.suggestions.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium text-gray-600 mb-1 block">
                  Sugestões seguras:
                </span>
                <div className="space-y-1">
                  {violation.suggestions.map((suggestion, suggestionIndex) => {
                    const suggestionSyllables = countPoeticSyllables(suggestion)
                    return (
                      <div
                        key={suggestionIndex}
                        className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => onApplySuggestion(violation.lineNumber, suggestion)}
                      >
                        <span className="font-mono text-blue-800 flex-1">
                          {suggestion}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600">
                            {suggestionSyllables} sílabas
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2 text-blue-600 hover:text-blue-800"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 🚨 AVISO SE NÃO HOUVER SUGESTÕES SEGURAS */}
            {violation.suggestions.length === 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span className="text-xs">
                    Nenhuma sugestão segura disponível. Edite manualmente.
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
