import cors from "cors"
import express from "express"

import { convert } from "./convert.js"
import { download } from "./download.js"
import { transcribe } from "./transcribe.js"
import { summarize } from "./summarize.js"

const app = express()
app.use(express.json())
app.use(cors())

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }))

app.get("/summary/:id", async (req, res) => {
  try {
    await download(req.params.id)
    const audioConverted = await convert()

    const result = await transcribe(audioConverted)
    
    return res.json({ result })
  } catch (error) {
    console.log(error)
    const message = error instanceof Error ? error.message : String(error)
    return res.status(502).json({
      error: message,
      stage: "download/transcription",
    })
  }
})

app.post("/summary", async (req, res) => {
  try {
    if (!req.body.text || req.body.text.trim().length < 10) {
      return res.status(400).json({
        error: "Não foi possível gerar o resumo: texto insuficiente.",
        stage: "summary",
      })
    }

    const result = await summarize(req.body.text)

    return res.json({ result })
  } catch (error) {
    console.log(error)
    const message = error instanceof Error ? error.message : String(error)
    return res.status(502).json({
      error: message,
      stage: "summary",
    })
  }
})

if (process.env.NODE_ENV === "production") {
  app.use(express.static("./dist"))
  app.get("*", (_req, res) => res.sendFile("dist/index.html", { root: "." }))
}

const port = process.env.PORT || 3333
app.listen(port, () => console.log(`Server is running on port ${port}`))
