import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BackHeader from "./BackHeader";

export const ChangePassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // password validations
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[$%!@#&*]/.test(newPassword);
  const hasMinLength = newPassword.length >= 10;

  return (
    <div className="bg-black min-h-screen pb-6">
      {/* Flecha estándar, misma posición que en el resto */}
      <BackHeader />

      {/* Contenido centrado */}
      <div className="px-4 flex justify-center items-start">
        <div className="bg-[#1C1C1C] p-6 rounded-xl shadow-md w-full max-w-2xl space-y-6 border border-[#0A84FF]/60">
          <h1 className="!text-lg font-bold text-[#0A84FF]">Change your password</h1>

          {/* Current password */}
          <div>
            <label className="text-xs flex justify-start font-medium text-[#0A84FF] mb-1">
              Current password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border border-[#0A84FF] rounded-md focus:outline-none focus:ring focus:ring-[#0A84FF] text-[#0A84FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A84FF]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-xs flex justify-start font-medium text-[#0A84FF] mb-1">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-[#0A84FF] rounded-md focus:outline-none focus:ring focus:ring-[#0A84FF] text-[#0A84FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A84FF]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            <div className="text-[#0A84FF] p-4 rounded-md w-fit">
              <p className="font-medium text-sm mb-2 flex justify-start">
                Password must contain at least:
              </p>
              <ul className="list-none text-sm text-[#0A84FF]">
                <li className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full inline-block ${
                      hasUppercase && hasLowercase ? "bg-green-500" : "border border-gray-400"
                    }`}
                  />
                  <span>2 letters (lowercase and uppercase)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full inline-block ${
                      hasNumber ? "bg-green-500" : "border border-gray-400"
                    }`}
                  />
                  <span>1 number</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full inline-block ${
                      hasMinLength ? "bg-green-500" : "border border-gray-400"
                    }`}
                  />
                  <span>Must contain at least 10 characters</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Repeat password */}
          <div>
            <label className="text-xs flex justify-start font-medium text-[#0A84FF] mb-1">
              Repeat password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border border-[#0A84FF] rounded-md focus:outline-none focus:ring focus:ring-[#0A84FF] text-[#0A84FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A84FF]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          <div className="border-t border-[#0A84FF] pt-6 mt-6 flex justify-end space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[#0A84FF] font-medium hover:opacity-80 transition"
            >
              Cancel
            </button>
            <button
              className="bg-[#0A84FF] text-black font-semibold px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              Save new password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
