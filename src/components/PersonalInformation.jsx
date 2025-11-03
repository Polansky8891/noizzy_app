import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import BirthDateField from "./BirthDateField";
import SelectField from "./SelectField";
import BackHeader from "./BackHeader";


const GENDERS = ["Male", "Female", "Other"];
const COUNTRIES = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
    ];

export const PersonalInformation = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [country, setCountry] = useState("Afghanistan");

    const [sex, setSex] = useState("Male");

    const [birth, setBirth] = useState({ day: 14, month: "January", year: 1988 });

    useEffect(() => {
        const storedProfile = localStorage.getItem('profileData');
        if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            if (parsed.email) {
                setEmail(parsed.email)
            }
        }
    }, [])

    const handleSave = () => {
    const profileData = { email, birth };
    localStorage.setItem('profileData', JSON.stringify(profileData));
    };


  return (
    <div className="bg-black min-h-screen pb-6">
      <BackHeader />

      <div className="px-4 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-[#1C1C1C] p-6 rounded-xl shadow-md space-y-6 border border-[#0A84FF]/60">
          <h1 className="!text-lg font-bold text-[#0A84FF]">Edit personal information</h1>

          {/* User name */}
          <div>
            <label className="text-xs flex justify-start font-medium text-[#0A84FF] mb-1">
              User name
            </label>
            <h4 className="flex justify-start text-[#0A84FF]">my name</h4>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs flex justify-start font-medium text-[#0A84FF] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[#0A84FF] rounded-md focus:outline-none focus:ring focus:ring-[#0A84FF] text-[#0A84FF]"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-xs flex justify-start font-medium text-[#0A84FF] mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border border-[#0A84FF] rounded-md text-[#0A84FF] focus:outline-none focus:ring focus:ring-[#0A84FF]"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A84FF]"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          {/* Gender */}
          <SelectField label="Sex" value={sex} onChange={setSex} options={GENDERS} />

          {/* Birth date */}
          <BirthDateField value={birth} onChange={setBirth} />

          {/* Country */}
          <SelectField
            label="Country"
            value={country}
            onChange={setCountry}
            options={COUNTRIES}
          />

          <div className="flex justify-start space-x-2 text-sm text-[#0A84FF]">
            <input
              type="checkbox"
              id="marketingConsent"
              className="mt-1 h-4 w-4 text-[#0A84FF] border-gray-300 rounded"
            />
            <label htmlFor="marketingConsent" className="text-left">
              Permitir que mis datos de registro sean compartidos con los socios de contenido de Spotify con fines promocionales. Ten en cuenta que esta información podría ser transferida fuera del Espacio Económico Europeo, conforme a lo indicado en nuestra Política de privacidad
            </label>
          </div>

          <div className="border-t border-[#0A84FF] pt-6 mt-6 flex justify-end space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[#0A84FF] font-medium hover:opacity-80 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-[#0A84FF] text-black font-semibold px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              Guardar perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};