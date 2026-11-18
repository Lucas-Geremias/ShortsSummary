import { pipeline } from "@xenova/transformers"

let summarizationPipeline

export async function summarize(text) {
  try {
    console.log("Realizando o resumo...")

    summarizationPipeline ??= await pipeline(
      "summarization",
      "Xenova/distilbart-cnn-6-6"
    )

    const output = await summarizationPipeline(text, {
      max_new_tokens: 50,
      min_length: 10,
    })

    console.log("Resumo concluido com sucesso")

    const summary = output[0].summary_text.trim()
    const firstSentence = summary.match(/^[^.!?]+[.!?]?/)

    return firstSentence?.[0].trim() || summary
  } catch (error) {
    console.log("Não foi possível realizar o resumo", error)
    throw new Error(error)
  }
}
