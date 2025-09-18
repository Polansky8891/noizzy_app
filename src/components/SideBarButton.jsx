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
            ? "bg-white/20 text-white"
            : "text-gray-300 hover:bg-black hover:text-white"
        )
      }
    >
      <span
        className="
          text-xl leading-none text-[#AC4BEB]
          [filter:drop-shadow(0_0_2px_rgba(172,75,235,0.55))_drop-shadow(0_0_6px_rgba(172,75,235,0.35))]
        "
      >
        {icon}
      </span>

      {title && (
        <span
          className="
            leading-none text-[#AC4BEB]
            [text-shadow:0_0_2px_rgba(172,75,235,0.55),0_0_6px_rgba(172,75,235,0.35)]
          "
        >
          {title}
        </span>
      )}
    </NavLink>
  );
};