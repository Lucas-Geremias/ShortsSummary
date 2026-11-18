import { Quality, Ytdl } from "@distube/ytdl-core"
import fs from "fs"

const yt = new Ytdl({ timeoutMs: 3 * 60 * 1000 })

if (process.env.YOUTUBE_COOKIE) {
  yt.setCookie(process.env.YOUTUBE_COOKIE)
  console.log("YouTube: cookie de autenticação configurado")
}

export const download = (videoId) =>
  new Promise(async (resolve, reject) => {
    const videoURL = "https://www.youtube.com/shorts/" + videoId
    console.log("Realizando o download do video: ", videoId)

    let settled = false
    let stream

    const finishWithError = (error) => {
      if (settled) return
      settled = true
      stream?.destroy()
      console.log(
        "Não foi possível fazer o download do vídeo. Detalhes do erro: ",
        error
      )
      reject(error)
    }

    try {
      const info = await yt.getInfo(videoURL)
      const duration = Number(info.videoDetails.lengthSeconds)

      if (duration > 60) {
        return finishWithError(new Error("O vídeo possui mais de 60 segundos"))
      }

      stream = yt.download(info, {
        quality: Quality.HighestAudio,
        filter: { hasAudio: true, hasVideo: false },
      })

      const timeout = setTimeout(() => {
        finishWithError(new Error("Tempo limite ao baixar o áudio do YouTube"))
      }, 3 * 60 * 1000)

      stream
        .on("end", () => {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          console.log("Download do vídeo finalizado...")
          resolve()
        })
        .on("error", (error) => {
          clearTimeout(timeout)
          finishWithError(error)
        })
        .pipe(fs.createWriteStream("./tmp/audio.mp4"))
    } catch (error) {
      finishWithError(error)
    }
  })
