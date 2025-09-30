import { NavLink } from "react-router-dom";
import clsx from "clsx";


export const SideBarButton = ({ to, title, icon }) => {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center justify-center gap-1",
          "w-16 h-16 rounded-2xl text-xs font-medium transition-all duration-300",
          isActive
            ? "bg-black text-white"
            : "text-gray-300 hover:bg-black hover:text-white"
        )
      }
    >
      <span
        className="
          text-xl leading-none text-[#0A84FF]
        "
      >
        {icon}
      </span>

      {title && (
        <span
          className="
            leading-none text-[#0A84FF]
          "
        >
          {title}
        </span>
      )}
    </NavLink>
  );
};