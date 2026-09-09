import { speakJarvis } from "./ask-jarvis";

let current: HTMLAudioElement | SpeechSynthesisUtterance | null = null;

export function silence() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  if (current instanceof HTMLAudioElement) {
    current.pause();
    current.src = "";
  }
  current = null;
}

export async function speakAloud(text: string): Promise<void> {
  silence();
  const clipped = text.replace(/\s+/g, " ").trim().slice(0, 400);
  if (!clipped) return;

  try {
    const res = await speakJarvis({ data: { text: clipped } });
    if (res.ok) {
      const url = `data:${res.mime};base64,${res.b64}`;
      const audio = new Audio(url);
      current = audio;
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
      });
      return;
    }
  } catch {
    /* browser voice */
  }

  await browserSpeak(clipped);
}

function browserSpeak(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve();
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find((v) => /en-GB/i.test(v.lang) && /male|daniel|george|ryan/i.test(v.name)) ||
      voices.find((v) => /en-GB/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang));
    if (pick) utter.voice = pick;
    utter.rate = 1.02;
    utter.pitch = 0.92;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    current = utter;
    window.speechSynthesis.speak(utter);
  });
}
