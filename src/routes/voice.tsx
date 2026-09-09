import { createFileRoute } from "@tanstack/react-router";
import { VoiceHud } from "@/components/voice-hud";

export const Route = createFileRoute("/voice")({ component: VoiceHud });
