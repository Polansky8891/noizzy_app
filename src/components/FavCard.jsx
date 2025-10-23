import SmartImage from "./SmartImage";
import { clThumb, clCover } from "../utils/cdn";

export default function FavCard({ t, onPlay, priority }) {
  const cover = t.coverUrl || t.cover || t.image;
  return (
    <div className="rounded-xl bg-[#1C1C1C] p-2 border border-transparent hover:border-[#0A84FF] transition">
      <div
        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onPlay?.(t)}
        role="button"
        tabIndex={0}
        title={t.title}
      >
        <SmartImage
          src={clCover(cover, 320)}
          placeholderSrc={clThumb(cover)}
          alt={t.title}
          ratio="1 / 1"
          widths={[200, 320, 480]}
          sizes="(min-width:1024px) 200px, 33vw"
          rounded="rounded-lg"
          className="bg-[#111]"
          priority={priority}
        />
      </div>
      <div className="mt-2">
        <p className="text-sm text-[#0A84FF] truncate">{t.title}</p>
        <p className="text-xs text-[#0A84FF] truncate">{t.artist}</p>
      </div>
    </div>
  );
}
