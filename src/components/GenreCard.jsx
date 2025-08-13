import { Link } from "react-router-dom";


export const GenreCard = ({ name, img, to }) => {
    return (
    <div className="flex flex-col items-center">
      <h3 className="text-base font-bold text-white mb-2">{name}</h3>

      <Link to={to} className="group block rounded-2xl">
        <div className="relative w-[120px] h-[120px] rounded-2xl overflow-hidden border border-white/10 bg-gray-800">
         
          <img src={img} alt={name} className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />

          
        </div>
      </Link>
    </div>
  );
};