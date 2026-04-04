import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress harmless AbortError from browser media autoplay policy.
// This fires when a video/audio .play() promise is interrupted by .pause()
// (e.g., inside iframes loading external content).
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason?.name === "AbortError") {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
