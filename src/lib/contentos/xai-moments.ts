import type { ReasonType } from "./types";

export type MomentDraft = {
  startSec: number;
  endSec: number;
  score: number;
  reasonType: ReasonType;
  reasonText: string;
};

/**
 * Paid xAI enhancement is disabled for now (free built-in heuristics only).
 * Kept as a passthrough so a later opt-in path can plug back in without
 * reshaping callers.
 */
export async function enhanceMomentReasons(
  _title: string,
  _channelTitle: string | null,
  _durationSec: number,
  drafts: MomentDraft[],
): Promise<MomentDraft[]> {
  return drafts;
}
