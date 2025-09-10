import rockImg from '../assets/images/rock.png';
import popImg from '../assets/images/pop.png';
import electroImg from '../assets/images/electro.png';
import bluesImg from '../assets/images/blues.png';
import classicImg from '../assets/images/classic.png';
import dubstepImg from '../assets/images/dubstep.png';
import hiphopImg from '../assets/images/hiphop.png';
import reggaeImg from '../assets/images/reggae.png';
import houseImg from '../assets/images/house.png';
import jazzImg from '../assets/images/jazz.png';
import { Link } from 'react-router-dom';

export const Home = () => {

  const genres = [
    { name: "Rock", img: rockImg, slug: "rock"},
    { name: "Pop", img: popImg, slug:"pop"},
    { name: "Blues", img: bluesImg, slug:"blues"},
    { name: "Classic", img: classicImg, slug:"classic"},
    { name: "Dubstep", img: dubstepImg, slug:"dubstep"},
    { name: "Electro", img: electroImg, slug:"electro"},
    { name: "Hip Hop", img: hiphopImg, slug:"hiphop"},
    { name: "Reggae", img: reggaeImg, slug:"reggae"},
    { name: "House", img: houseImg, slug:"house"},
    { name: "Jazz", img: jazzImg, slug:"jazz"}
  ]

  const prefetch = async (slug) => {
  const genre = SLUG_TO_GENRE[slug];
  const k = `tracks:${genre}`;
  if (sessionStorage.getItem(k)) return;
  const res = await axios.get(`/api/tracks`, { params: { genre } });
  sessionStorage.setItem(k, JSON.stringify(res.data?.items ?? []));
};

  return (
    <div className="w-full h-full bg-black rounded-3xl">
      <h2
        className="
          text-3xl font-exo font-light text-[#1DF0D8] mb-5
          [filter:drop-shadow(0_0_2px_rgba(29,240,216,0.7))_drop-shadow(0_0_6px_rgba(29,240,216,0.4))]
        "
      >
        Top genres
      </h2>

      {/* GRID responsiva: muy compacto en móvil */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {genres.map((g) => (
          <div key={g.slug} className="flex flex-col items-center">
          <Link
            to={`/genre/${g.slug}`}
            onMouseEnter={() => prefetch(g.slug)}
            className="
              group relative aspect-square rounded-2xl isolate
              p-1 sm:p-1.5 md:p-2 flex items-center justify-center
              transition-transform hover:scale-105
              outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40
            "
            aria-label={g.name}
          >
            {/* borde/halo */}
            <span
              className="
                pointer-events-none absolute inset-0 rounded-2xl
                border border-white/12
                shadow-[0_0_14px_rgba(255,255,255,0.07)]
                group-hover:border-white/25 group-hover:shadow-[0_0_22px_rgba(255,255,255,0.12)]
              "
            />

            <img
              src={g.img}
              alt={g.name}
              loading="lazy"
              className="
                w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
                object-contain mix-blend-screen
                brightness-105 contrast-105
              "
            />
          </Link>
            <div className="mt-1 sm:mt-2 text-center text-[11px] sm:text-xs tracking-wide">
              {g.name.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};