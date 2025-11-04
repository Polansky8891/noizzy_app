import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* ────────── HOISTED mocks ────────── */

// Mock utils/cdn para comprobar llamadas y valores
const cdnMocks = vi.hoisted(() => ({
  clThumb: vi.fn((url) => `thumb(${url})`),
  clCover: vi.fn((url, size) => `cover(${url},${size})`),
}));
vi.mock("../../utils/cdn", () => ({
  __esModule: true,
  ...cdnMocks,
}));

// Mock SmartImage para inspeccionar props
vi.mock("../../components/SmartImage", () => ({
  __esModule: true,
  default: (props) => {
    const { alt, src, placeholderSrc, priority, ratio, widths, sizes, rounded, className } = props;
    return (
      <img
        data-testid="smart-image"
        alt={alt}
        src={src}
        data-placeholder={placeholderSrc}
        data-priority={String(!!priority)}
        data-ratio={String(ratio)}
        data-sizes={String(sizes)}
        data-rounded={String(rounded)}
        data-class={String(className)}
        data-widths={JSON.stringify(widths ?? [])}
      />
    );
  },
}));

/* ────────── import del componente (después de mocks) ────────── */
import FavCard from "../../components/FavCard.jsx";

beforeEach(() => {
  vi.clearAllMocks();
});

const TRACK = {
  _id: "t1",
  title: "Song A",
  artist: "Artist X",
  coverUrl: "http://media/img/a.jpg",
};

describe("FavCard", () => {
  it("renderiza título y artista", () => {
    render(<FavCard t={TRACK} />);
    expect(screen.getByText("Song A")).toBeInTheDocument();
    expect(screen.getByText("Artist X")).toBeInTheDocument();
  });

  it("usa clCover y clThumb con la cover correcta y props de SmartImage esperadas", () => {
    render(<FavCard t={TRACK} priority />);

    // utils llamados con la cover y tamaño 320
    expect(cdnMocks.clCover).toHaveBeenCalledWith(TRACK.coverUrl, 320);
    expect(cdnMocks.clThumb).toHaveBeenCalledWith(TRACK.coverUrl);

    // SmartImage recibe los props derivados
    const img = screen.getByTestId("smart-image");
    expect(img).toHaveAttribute("alt", "Song A");
    expect(img).toHaveAttribute("src", `cover(${TRACK.coverUrl},320)`);
    expect(img).toHaveAttribute("data-placeholder", `thumb(${TRACK.coverUrl})`);
    expect(img).toHaveAttribute("data-priority", "true");

    // Otros props estáticos
    expect(img.getAttribute("data-ratio")).toBe("1 / 1");
    expect(img.getAttribute("data-sizes")).toBe("(min-width:1024px) 200px, 33vw");
    expect(img.getAttribute("data-rounded")).toBe("rounded-lg");
    expect(img.getAttribute("data-class")).toContain("bg-[#111]");

    // widths serializado
    const widths = JSON.parse(img.getAttribute("data-widths") || "[]");
    expect(widths).toEqual([200, 320, 480]);
  });

  it("hace onPlay(t) al clicar la carátula", async () => {
    const onPlay = vi.fn();
    render(<FavCard t={TRACK} onPlay={onPlay} />);

    const clickable = screen.getByRole("button", { name: /song a/i });
    await userEvent.click(clickable);

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith(TRACK);
  });

  it("no rompe si no se pasa onPlay", async () => {
    render(<FavCard t={TRACK} />);
    const clickable = screen.getByRole("button", { name: /song a/i });
    await userEvent.click(clickable);
    // si no lanza error, estamos ok
    expect(true).toBe(true);
  });

  it("deriva la cover desde t.cover o t.image si falta coverUrl", () => {
    const altTrack = { ...TRACK, coverUrl: undefined, cover: "X.jpg" };
    render(<FavCard t={altTrack} />);

    expect(cdnMocks.clCover).toHaveBeenCalledWith("X.jpg", 320);
    expect(cdnMocks.clThumb).toHaveBeenCalledWith("X.jpg");
  });

  it("si no hay ninguna cover, clCover/clThumb reciben undefined y SmartImage sigue renderizando", () => {
    const noCover = { title: "NC", artist: "", _id: "nc" };
    render(<FavCard t={noCover} />);

    expect(cdnMocks.clCover).toHaveBeenCalledWith(undefined, 320);
    expect(cdnMocks.clThumb).toHaveBeenCalledWith(undefined);

    const img = screen.getByTestId("smart-image");
    expect(img).toHaveAttribute("alt", "NC");
    // src será cover(undefined,320) por el mock
    expect(img).toHaveAttribute("src", "cover(undefined,320)");
  });
});
