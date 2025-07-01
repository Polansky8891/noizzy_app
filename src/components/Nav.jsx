import { IoHomeOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

export const Nav = () => {
  return (
    <nav className="bg-green-200 text-white w-full fixed top-0 left-0">
      <div className="h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="text-3xl font-bold px-4">Logo</div>

        {/* Menú */}
        <div className="flex items-center">
          <a href="/" className="px-4 no-underline">
            <IoHomeOutline className="w-8 h-8" /> {/* Aumenta o ajusta el tamaño */}
          </a>
          <a href="/library" className="text-lg px-4 no-underline">LIBRARY</a>
          <a href="/profile" className="text-lg px-4 no-underline"><CgProfile className="w-8 h-8" /></a>
        </div>
      </div>
    </nav>
  );
};
