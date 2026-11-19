import { Heart, MessageCircle, Share2 } from "lucide-react";
import { parseCaptionMarkup } from "@/lib/contentos/shorts-captions";

type Props = {
  youtubeId: string;
  embedSrc: string;
  autoplay: boolean;
  iframeKey: string;
  caption: string;
  title: string;
  channelTitle?: string | null;
  clipLabel: string;
};

/** Vertical Shorts phone stage with burned-in style captions. */
export function ShortsStage({
  youtubeId,
  embedSrc,
  autoplay,
  iframeKey,
  caption,
  title,
  channelTitle,
  clipLabel,
}: Props) {
  const parts = parseCaptionMarkup(caption);

  return (
    <div className="cos-shorts-phone">
      <div className="cos-shorts-notch" aria-hidden="true" />
      <div className="cos-shorts-stage">
        {embedSrc ? (
          <iframe
            key={iframeKey}
            title={`Shorts preview ${youtubeId}`}
            src={`${embedSrc}&autoplay=${autoplay ? 1 : 0}&controls=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : null}

        <div className="cos-shorts-chrome" aria-hidden="true">
          <div className="cos-shorts-meta">
            <strong>@{slugHandle(channelTitle || "contentos")}</strong>
            <span>{title.slice(0, 72)}</span>
          </div>
          <div className="cos-shorts-rail">
            <span>
              <Heart size={22} strokeWidth={2.2} />
            </span>
            <span>
              <MessageCircle size={22} strokeWidth={2.2} />
            </span>
            <span>
              <Share2 size={22} strokeWidth={2.2} />
            </span>
          </div>
        </div>

        {caption ? (
          <div className="cos-shorts-caption" key={caption}>
            {parts.map((p, i) =>
              p.hot ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>,
            )}
          </div>
        ) : null}

        <div className="cos-shorts-footer">
          <span>Shorts preview</span>
          <span>{clipLabel}</span>
        </div>
      </div>
    </div>
  );
}

function slugHandle(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || "creator"
  );
}
