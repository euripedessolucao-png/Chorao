export function removeQuotesAndClean(text: string): string {
  return text.replace(/"/g, "").replace(/'/g, "").replace(/`/g, "").trim()
}

export function cleanLyricsFromAI(lyrics: string): string {
  return lyrics
    .split("\n")
    .map((line) => removeQuotesAndClean(line))
    .filter((line) => line.length > 0)
    .join("\n")
}
