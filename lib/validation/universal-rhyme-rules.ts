export interface UniversalRhymeRules {
  genre: string
  minRichRhymePercentage: number
  maxFalseRhymePercentage: number
  allowAssonantRhymes: boolean
  requirePerfectRhymes: boolean
  examples: {
    rich: string[]
    poor: string[]
    false: string[]
  }
  instructions: string
}

export function getUniversalRhymeRules(genre: string): UniversalRhymeRules {
  const lowerGenre = genre.toLowerCase()

  if (lowerGenre.includes("sertanejo raiz") || lowerGenre.includes("sertanejo de raiz")) {
    return {
      genre,
      minRichRhymePercentage: 50,
      maxFalseRhymePercentage: 0,
      allowAssonantRhymes: false,
      requirePerfectRhymes: true,
      examples: {
        rich: [
          "porteira (substantivo) / bananeira (substantivo de tipo diferente)",
          "viola (substantivo) / sacola (substantivo de tipo diferente)",
          "sertão (substantivo) / canção (substantivo de tipo diferente)",
          "amor (substantivo) / cantar (verbo)",
          "flor (substantivo) / melhor (adjetivo)",
          "coração (substantivo) / perdão (substantivo abstrato)",
        ],
        poor: [
          "coração / razão (ambos substantivos abstratos)",
          "amando / cantando (ambos gerúndios)",
          "amor / dor (ambos substantivos)",
        ],
        false: ["paixão / coração (terminam diferente)", "amor / calor (som diferente)"],
      },
      instructions: `RIMAS RICAS OBRIGATÓRIAS (Sertanejo Raiz):
- Mínimo 50% de rimas ricas (classes gramaticais DIFERENTES)
- ZERO rimas falsas permitidas
- Todas as rimas devem ser perfeitas (consoantes)
- Exemplos de rimas ricas: "porteira/bananeira", "viola/sacola", "sertão/coração"
- Exemplos de rimas pobres (evitar): "coração/razão", "amando/cantando"
- A rima deve soar natural e autêntica, não forçada`,
    }
  }

  if (lowerGenre.includes("sertanejo moderno") || lowerGenre.includes("sertanejo universitário")) {
    return {
      genre,
      minRichRhymePercentage: 30,
      maxFalseRhymePercentage: 20,
      allowAssonantRhymes: true,
      requirePerfectRhymes: false,
      examples: {
        rich: ["amor (substantivo) / melhor (adjetivo)", "biquíni (substantivo) / vim (verbo)"],
        poor: ["coração / razão", "paixão / ilusão"],
        false: ["amor / calor (aceitável se natural)"],
      },
      instructions: `RIMAS FLEXÍVEIS (Sertanejo Moderno):
- Prefira rimas ricas (30% mínimo)
- Aceita rimas pobres se naturais
- Aceita até 20% de rimas falsas se servirem à narrativa
- Foco na naturalidade e comercialidade`,
    }
  }

  if (lowerGenre.includes("mpb")) {
    return {
      genre,
      minRichRhymePercentage: 60,
      maxFalseRhymePercentage: 10,
      allowAssonantRhymes: true,
      requirePerfectRhymes: false,
      examples: {
        rich: ["lua (substantivo) / flutua (verbo)", "mar (substantivo) / amar (verbo)"],
        poor: ["amor / dor (clichê)", "paixão / ilusão (clichê)"],
        false: [],
      },
      instructions: `RIMAS POÉTICAS (MPB):
- Alta qualidade: 60% de rimas ricas
- Evite clichês ("amor/dor", "paixão/ilusão")
- Rimas criativas e surpreendentes
- Rimas toantes aceitáveis se bem usadas`,
    }
  }

  if (lowerGenre.includes("pagode") || lowerGenre.includes("samba")) {
    return {
      genre,
      minRichRhymePercentage: 40,
      maxFalseRhymePercentage: 15,
      allowAssonantRhymes: true,
      requirePerfectRhymes: false,
      examples: {
        rich: ["samba (substantivo) / ginga (verbo)", "pandeiro (substantivo) / inteiro (adjetivo)"],
        poor: ["amor / dor", "paixão / coração"],
        false: [],
      },
      instructions: `RIMAS NATURAIS (Pagode/Samba):
- 40% de rimas ricas
- Rimas devem facilitar o swing, não dificultar
- Varie entre ricas e pobres para evitar monotonia
- Foco na cantabilidade`,
    }
  }

  return {
    genre,
    minRichRhymePercentage: 35,
    maxFalseRhymePercentage: 20,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: ["amor (substantivo) / cantar (verbo)", "flor (substantivo) / melhor (adjetivo)"],
      poor: ["coração / razão", "paixão / ilusão"],
      false: [],
    },
    instructions: `RIMAS NATURAIS:
- Prefira rimas ricas (35% mínimo)
- Evite rimas forçadas ou artificiais
- Foco na naturalidade ao cantar`,
  }
}
