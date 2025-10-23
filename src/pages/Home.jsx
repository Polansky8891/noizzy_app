import rockImg from '../assets/images/rock.png';
import popImg from '../assets/images/pop.png';
import electroImg from '../assets/images/electro.png';
import bluesImg from '../assets/images/blues.png';
import classicImg from '../assets/images/classic.png';
import dubstepImg from '../assets/images/dubstep.png';
import hiphopImg from '../assets/images/hiphop.png';
import reggaeImg from '../assets/images/reggae.png';
import houseImg from '../assets/images/house.png';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import TrackCarousel from '../components/TrackCarousel';
import SmartImage from '../components/SmartImage';
import { useEffect, useState, useMemo } from 'react';
import { fetchWithCacheWeb } from '../utils/cacheWeb';
import SkeletonCarousel from '../components/SkeletonCarousel';
import useDelayedVisible from '../hooks/useDelayedVisible';
import { cacheGet, cacheSet } from '../utils/cacheLocal';

const SLUG_TO_GENRE = {
  rock:"Rock", pop:"Pop", blues:"Blues", classic:"Classical",
  dubstep:"Dubstep", electro:"Electro", hiphop:"Hip-Hop",
  reggae:"Reggae", house:"House", jazz:"Jazz",
};

const buildKeyUrl = ({ genre, feel, limit }) => {
  const base = api.defaults?.baseURL || '';
  const u = new URL((base.endsWith('/api') ? base : base + '/api') + '/tracks', window.location.origin);
  if (genre) u.searchParams.set('genre', genre);
  if (feel) u.searchParams.set('feel', feel);
  if (limit) u.searchParams.set('limit', String(limit));
  return u.toString();
};

function ChillCard({ t, onPlay }) {
  return (
    <div className="w-30 shrink-0 rounded-xl bg-[#1C1C1C] p-2 border border-transparent hover:border-[#0A84FF] transition">
      <div
        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onPlay?.(t)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPlay?.(t)}
        role="button"
        tabIndex={0}
        title={t.title}
      >
        <SmartImage
          src={t.coverUrl}
          alt={t.title}
          ratio="1 / 1"
          widths={[160, 240, 320, 480]}
          sizes="(min-width:1024px) 240px, 45vw"
          rounded="rounded-lg"
          className="bg-[#111]"
          priority={false}
        />
      </div>
      <div className="mt-2">
        <p className="text-sm text-[#0A84FF] truncate">{t.title}</p>
        <p className="text-xs text-[#0A84FF] truncate">{t.artist}</p>
      </div>
    </div>
  );
}


export const Home = () => {
  const genres = [
    { name: 'Rock', img: rockImg, slug: 'rock' },
    { name: 'Pop', img: popImg, slug: 'pop' },
    { name: 'Blues', img: bluesImg, slug: 'blues' },
    { name: 'Classic', img: classicImg, slug: 'classic' },
    { name: 'Dubstep', img: dubstepImg, slug: 'dubstep' },
    { name: 'Electro', img: electroImg, slug: 'electro' },
    { name: 'Hip Hop', img: hiphopImg, slug: 'hiphop' },
    { name: 'Reggae', img: reggaeImg, slug: 'reggae' },
    { name: 'House', img: houseImg, slug: 'house' },
  ];

  const FEELS = ['chill', 'energy', 'romantic'];
  const FEEL_LIMIT = 18;

  const [feelsLoading, setFeelsLoading] = useState({
    chill: true,
    energy: true,
    romantic: true,
  });

  const initialByFeel = useMemo(() => {
  const map = {};
  FEELS.forEach((feel) => {
    const keyUrl = buildKeyUrl({ feel, limit: 18 });
    map[feel] = cacheGet(keyUrl);
  });
  return map;
}, []);

  

  // Prefetch de un género al pasar el ratón (se guarda en Cache Storage con TTL)
  const prefetchGenre = async (slug) => {
    const genre = SLUG_TO_GENRE[slug];
    if (!genre) return;
    const keyUrl = buildKeyUrl({ genre });
    await fetchWithCacheWeb(
      keyUrl,
      async () => {
        const { data } = await api.get('/tracks', { params: { genre } });
        return data?.items ?? [];
      },
      { ttlMs: 15 * 60 * 1000 }
    );
  };

  // Prefetch silencioso de los 3 carruseles al entrar (primera carga más ágil)
useEffect(() => {
  FEELS.forEach(async (feel) => {
    const keyUrl = buildKeyUrl({ feel, limit: FEEL_LIMIT });
    try {
      await fetchWithCacheWeb(
        keyUrl,
        async () => {
          const { data } = await api.get('/tracks', { params: { feel, limit: FEEL_LIMIT } });
          const items = data?.items ?? [];
          cacheSet(keyUrl, items);
          return items;
        },
        { ttlMs: 15 * 60 * 1000 }
      );
    } finally {
      setFeelsLoading((s) => ({ ...s, [feel]: false }));
    }
  });
}, []);

const showSkeleton = {
  chill: useDelayedVisible(feelsLoading.chill && !initialByFeel.chill, 220),
  energy: useDelayedVisible(feelsLoading.energy && !initialByFeel.energy, 220),
  romantic: useDelayedVisible(feelsLoading.romantic && !initialByFeel.romantic, 220),
};

  return (
    <div className="w-full min-h-0 bg-black rounded-3xl space-y-8 pb-6">
      {/* Top genres */}
      <h2 className="text-3xl font-exo font-light text-[#0A84FF] mb-5">Top genres</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {genres.map(g => (
          <div key={g.slug} className="flex flex-col items-center">
            <Link
              to={`/genre/${g.slug}`}
              onMouseEnter={() => prefetchGenre(g.slug)}
              className="group relative aspect-square rounded-2xl isolate p-1 sm:p-1.5 md:p-2 flex items-center justify-center transition-transform hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              aria-label={g.name}
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl border border-[#0A84FF] shadow-[0_0_14px_rgba(255,255,255,0.07)] group-hover:border-white/25 group-hover:shadow-[0_0_22px_rgba(255,255,255,0.12)]" />
              <img
                src={g.img}
                alt={g.name}
                loading="lazy"
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain mix-blend-screen brightness-105 contrast-105"
              />
            </Link>
            <div className="mt-1 sm:mt-2 text-center text-[11px] text-[#0A84FF] sm:text-xs tracking-wide">
              {g.name.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Carruseles con skeleton controlado */}
   <div className="min-h-[11rem]">
      {initialByFeel.chill
  ? <TrackCarousel feel="chill" title="Let's chill" initialItems={initialByFeel.chill} limit={FEEL_LIMIT} />
  : showSkeleton.chill
      ? <SkeletonCarousel title="Let's chill" />
      : <TrackCarousel feel="chill" title="Let's chill" limit={FEEL_LIMIT} />}

{initialByFeel.energy
  ? <TrackCarousel feel="energy" title="Need some energy!" initialItems={initialByFeel.energy} limit={FEEL_LIMIT} />
  : showSkeleton.energy
      ? <SkeletonCarousel title="Need some energy!" />
      : <TrackCarousel feel="energy" title="Need some energy!" limit={FEEL_LIMIT} />}

{initialByFeel.romantic
  ? <TrackCarousel feel="romantic" title="Let's get sentimental" initialItems={initialByFeel.romantic} limit={FEEL_LIMIT} />
  : showSkeleton.romantic
      ? <SkeletonCarousel title="Let's get sentimental" />
      : <TrackCarousel feel="romantic" title="Let's get sentimental" limit={FEEL_LIMIT} />}

    </div>
    </div>
  );
};