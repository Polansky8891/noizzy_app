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

          <div className="grid grid-cols-[repeat(5,max-content)] gap-x-5 gap-y-3 justify-start ml-2">

            {genres.map(g => (
            
                <div key={g.slug} className="flex flex-col items-center">
                  
                    
                    <Link to={`/genre/${g.slug}`}>
                    <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border border-white/10 bg-gray-800">
                       <img src={g.img} alt={g.name} className="w-full h-full object-cover" />
                    </div>
                    </Link>
                  
                </div>
                
             
            ))}            
          </div>
        </div>
  );
};
