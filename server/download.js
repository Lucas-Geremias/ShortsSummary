import ytdl from "ytdl-core"
import fs from "fs"

export const download = (videoId) =>
  new Promise((resolve, reject) => {
    const videoURL = "https://www.youtube.com/shorts/" + videoId
    console.log("Realizando o download do video: ", videoId)

    let settled = false
    const stream = ytdl(videoURL, {
      quality: "lowestaudio",
      filter: "audioonly",
    })

    const timeout = setTimeout(() => {
      if (settled) return
      settled = true
      stream.destroy()
      reject(new Error("Tempo limite ao baixar o áudio do YouTube"))
    }, 3 * 60 * 1000)

    stream
      .on("info", (info) => {
        const duration = Number(info.videoDetails.lengthSeconds)
        if (duration > 60) {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          stream.destroy()
          reject(new Error("O vídeo possui mais de 60 segundos"))
        }
      })
      .on("end", () => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        console.log("Download do vídeo finalizado...")
        resolve()
      })
      .on("error", (error) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        console.log(
          "Não foi possível fazer o download do vídeo. Detalhes do erro: ",
          error
        )
        reject(error)
      })
      .pipe(fs.createWriteStream("./tmp/audio.mp4"))
  })
