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
import { GenreCard } from '../components/GenreCard';

export const Home = () => {

  const genres = [
    { name: "Rock", img: rockImg, to: "/rock"},
    { name: "Pop", img: popImg, to:"/pop"},
    { name: "Blues", img: bluesImg, to:"/blues"},
    { name: "Classic", img: classicImg, to:"/classic"},
    { name: "Dubstep", img: dubstepImg, to:"/dubstep"},
    { name: "Electro", img: electroImg, to:"/electro"},
    { name: "Hip Hop", img: hiphopImg, to:"/hiphop"},
    { name: "Reggae", img: reggaeImg, to:"/reggae"},
    { name: "House", img: houseImg, to:"/house"},
    { name: "Jazz", img: jazzImg, to:"/jazz"}
  ]

  return (
    <div className="w-full h-full bg-black rounded-3xl">
      
        
          <h2 className="text-[#1DF0D8] font-orbitron text-3xl font-bold mb-5">
            Top genres
          </h2>

          <div className="grid grid-cols-[repeat(5,max-content)] gap-x-5 gap-y-3 justify-start ml-2">
            {/* Rock */}
            
            {genres.map(g => <GenreCard key={g.name} {...g} />)}

          </div>

        </div>
     
  );
};
