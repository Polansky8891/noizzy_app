import profile from "../assets/images/profile.png";
import { SideBarButton } from "./SideBarButton";
import { HiHome } from "react-icons/hi2";
import { MdLibraryMusic } from "react-icons/md";
import { MdFavoriteBorder } from "react-icons/md";
import { LuTrendingUp } from "react-icons/lu";
import { FaUserFriends } from "react-icons/fa";
import { BsGraphUp } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { SettingsMenu } from "./SettingsMenu";
import { useRef, useState, useEffect } from "react";



export const SideBar = () => {

    const [collapsed, setCollapsed] = useState(false);
    const menuRef = useRef(null);
    const iconRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [animateClose, setAnimateClose] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                iconRef.current &&
                !iconRef.current.contains(e.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const toggleMenu = (e) => {
        e.stopPropagation();

        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setAnimateClose(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setAnimateClose(false);
        }, 200)
    };


    const handleDoubleClick = (e) => {
        if(e.target.closest("a")) return;
        setCollapsed(!collapsed);
    };

  return (
      <aside
         onDoubleClick={handleDoubleClick}
         className={`${
            collapsed ? "w-20" : "w-64"
        } h-full bg-[#1C1C1C] text-white p-4 rounded-3xl flex flex-col transition-all duration-300 ease-in-out`}
        >
      <div className="text-lg font-semibold mb-2"></div>
      <div className="flex flex-col items-center">
        {!collapsed && (
             <img
            src={profile}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover flex items-center"
        />
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ul className="flex flex-col items-center gap-4">
        <li>
            <span className="text-[#1DF0D8] text-xl leading-none">
            <SideBarButton
                 
                 title={collapsed ? "" : "Home"}
                 to="/" 
                 icon={<HiHome />}
                 iconClassName="text-[#1DF0D8]"
            />
            </span>
        </li>
        <li>
            <SideBarButton 
                title={collapsed ? "" : "Library"}
                to="/library" 
                icon={<MdLibraryMusic />}
                iconClassName="text-[#1DF0D8]"
            />
        </li>
        <li>
            <SideBarButton 
                title={collapsed ? "" : "Favorites"}
                to="/favorites" 
                icon={<MdFavoriteBorder />}
                iconClassName="text-[#1DF0D8]"
            />
        </li>
        <li>
            <SideBarButton 
                title={collapsed ? "" : "Trending"}
                to="/trending" 
                icon={<LuTrendingUp />}
                iconClassName="text-[#1DF0D8]"
            />
        </li>
        <li>
            <SideBarButton 
                title={collapsed ? "" : "Stats"} 
                to="/stats" 
                icon={<BsGraphUp />} 
                iconClassName="text-[#1DF0D8]"
            />
        </li>
        <li>
            <SideBarButton 
                title={collapsed ? "" : "Friends"}
                to="/friends" 
                icon={<FaUserFriends />}
                iconClassName="text-[#1DF0D8]"
            />
        </li>
        </ul>
      </div>
      <div className="relative flex justify-end p-4">
        <button
            ref={iconRef}
            onClick={toggleMenu}
            className="text-3xl text-[#1DF0D8] hover:text-gray-500 transition"
        >
            <IoSettingsOutline className="text-3xl" />    
        </button>

        {(isMenuOpen || animateClose) && (
            <div 
                ref={menuRef} 
                className={`absolute top-full mt-2 right-0 z-50 transition-all duration-300 transform ${
                    isMenuOpen && !animateClose
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                }`}
                >
                <SettingsMenu closeMenu={closeMenu} />
            </div>
        )}
      </div>
    </aside>
  );
};
