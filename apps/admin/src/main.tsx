import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { MediaEngine } from "./components/Player/MediaEngine.tsx"
import { PlayerBar } from "./components/Player/PlayerBar.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <MediaEngine />
    <PlayerBar />
  </StrictMode>,
)
