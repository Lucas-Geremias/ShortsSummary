import { server } from "./server.js"

const form = document.querySelector("#form")
const input = document.querySelector("#url")
const content = document.querySelector("#content")

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  content.classList.add("placeholder")

  const videoURL = input.value

  if (!videoURL.includes("shorts")) {
    content.textContent = "Informe uma url de short válida."
    content.classList.remove("placeholder")
    return
  }

  const [_, params] = videoURL.split("/shorts/")
  const [videoID] = params?.split("?si") || []

  if (!videoID) {
    content.textContent = "Não foi possível identificar o short."
    content.classList.remove("placeholder")
    return
  }

  try {
    content.textContent = "Obtendo o texto do áudio..."

    const transcription = await server.get("/summary/" + videoID)

    content.textContent = "Realizando o resumo..."

    const summary = await server.post("/summary", {
      text: transcription.data.result,
    })

    content.textContent = summary.data.result
  } catch (error) {
    const apiError = error.response?.data?.error
    const stage = error.response?.data?.stage

    content.textContent =
      apiError ||
      (stage
        ? `Falha durante ${stage}.`
        : "O resumo excedeu o tempo limite. Aguarde o servidor ficar pronto e tente novamente.")
  } finally {
    content.classList.remove("placeholder")
  }
})
