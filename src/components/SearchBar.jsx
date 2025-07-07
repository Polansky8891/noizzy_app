import { AiOutlineSearch } from "react-icons/ai";


export const SearchBar = () => {
  return (
    <form className="w-full max-w-md">
      <div className="relative">
        <input
          type="search"
          placeholder="Type here..."
          className="w-full bg-slate-800 text-white rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <AiOutlineSearch className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

