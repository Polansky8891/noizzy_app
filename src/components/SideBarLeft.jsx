import { useEffect, useRef, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { SettingsMenu } from "./SettingsMenu";


export const SideBarLeft = ( ) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);


  return (
    
    <aside className="w-80 bg-white border-r shadow-sm h-full">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm ">
        <div className="p-4 pb-2 flex justify-between items-center">
          {/* Aquí logo o título */}
        </div>

        <ul className="flex-1 px-3">TO DO</ul>

        <div className="p-4 flex justify-end relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="text-3xl hover:text-gray-500 transition"
          >
            <IoSettingsOutline className="text-3xl" />
          </button>

          {isMenuOpen && <SettingsMenu closeMenu={closeMenu} />}
        </div>
      </nav>
    </aside>
  );
};


