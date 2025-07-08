import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";



export const PersonalInformation = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    

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
        const profileData = {
            email
        };

        localStorage.setItem('profileData', JSON.stringify(profileData));
    }


    
  return (
    <div className='bg-gray-100 min-h-screen p-6 flex justify-center items-start'>
        <div className='bg-white p-6 rounded-xl shadow-md w-full max-w-2xl space-y-6'>
            <h1 className='!text-lg font-bold text-gray-900'>Edit personal information</h1>

            {/* User name */}
            <div>
                <label className='text-xs flex justify-start font-medium text-gray-700 mb-1'>User name</label>
                <h4 className="flex justify-start">my name</h4>
                
            </div>

            {/* Email */}
            <div>
                <label className="text-xs flex justify-start font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                />
            </div>

            {/* Password */}
            <div>
                <label className="text-xs flex justify-start font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}

                </button>
                </div>
            </div>

            {/* Gender */}
            <div>
                <label className="flex justify-start text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                </select>
            </div>

            {/* Birth date */}
            <div>
                <label className="text-xs flex justify-start font-medium text-gray-700 mb-1">Birth date</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Day"
                        defaultValue="14"
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                    />
                    <select className="w-1/3 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400">
                        <option>January</option>
                        <option>February</option>
                        <option>March</option>
                        <option>April</option>
                        <option>May</option>
                        <option>June</option>
                        <option>July</option>
                        <option>August</option>
                        <option>September</option>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Year"   
                        defaultValue="1988"    
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400" 
                    />
                </div>
            </div>

            {/* Country */}
            <div>
                <label className="flex justify-start text-sm font-medium text-gray-700 mb-1">Country</label>
                <select  className="w-full p-3 border border-gray-200 rounded-md bg-gray-100 text-gray-700">
                    <option>Afghanistan</option>
                    <option>Albania</option>
                    <option>Algeria</option>
                    <option>Andorra</option>
                    <option>Angola</option>
                    <option>Antigua and Barbuda</option>
                    <option>Argentina</option>
                    <option>Armenia</option>
                    <option>Australia</option>
                    <option>Austria</option>
                    <option>Azerbaijan</option>
                    <option>Bahamas</option>
                    <option>Bahrain</option>
                    <option>Bangladesh</option>
                    <option>Barbados</option>
                    <option>Belarus</option>
                    <option>Belgium</option>
                    <option>Belize</option>
                    <option>Benin</option>
                    <option>Bhutan</option>
                    <option>Bolivia</option>
                    <option>Bosnia and Herzegovina</option>
                    <option>Botswana</option>
                    <option>Brazil</option>
                    <option>Brunei</option>
                    <option>Bulgaria</option>
                    <option>Burkina Faso</option>
                    <option>Burundi</option>
                    <option>Cabo Verde</option>
                    <option>Cambodia</option>
                    <option>Cameroon</option>
                    <option>Canada</option>
                    <option>Central African Republic</option>
                    <option>Chad</option>
                    <option>Chile</option>
                    <option>China</option>
                    <option>Colombia</option>
                    <option>Comoros</option>
                    <option>Congo (Brazzaville)</option>
                    <option>Congo (Kinshasa)</option>
                    <option>Costa Rica</option>
                    <option>Croatia</option>
                    <option>Cuba</option>
                    <option>Cyprus</option>
                    <option>Czech Republic</option>
                    <option>Denmark</option>
                    <option>Djibouti</option>
                    <option>Dominica</option>
                    <option>Dominican Republic</option>
                    <option>Ecuador</option>
                    <option>Egypt</option>
                    <option>El Salvador</option>
                    <option>Equatorial Guinea</option>
                    <option>Eritrea</option>
                    <option>Estonia</option>
                    <option>Eswatini</option>
                    <option>Ethiopia</option>
                    <option>Fiji</option>
                    <option>Finland</option>
                    <option>France</option>
                    <option>Gabon</option>
                    <option>Gambia</option>
                    <option>Georgia</option>
                    <option>Germany</option>
                    <option>Ghana</option>
                    <option>Greece</option>
                    <option>Grenada</option>
                    <option>Guatemala</option>
                    <option>Guinea</option>
                    <option>Guinea-Bissau</option>
                    <option>Guyana</option>
                    <option>Haiti</option>
                    <option>Honduras</option>
                    <option>Hungary</option>
                    <option>Iceland</option>
                    <option>India</option>
                    <option>Indonesia</option>
                    <option>Iran</option>
                    <option>Iraq</option>
                    <option>Ireland</option>
                    <option>Israel</option>
                    <option>Italy</option>
                    <option>Jamaica</option>
                    <option>Japan</option>
                    <option>Jordan</option>
                    <option>Kazakhstan</option>
                    <option>Kenya</option>
                    <option>Kiribati</option>
                    <option>Kuwait</option>
                    <option>Kyrgyzstan</option>
                    <option>Laos</option>
                    <option>Latvia</option>
                    <option>Lebanon</option>
                    <option>Lesotho</option>
                    <option>Liberia</option>
                    <option>Libya</option>
                    <option>Liechtenstein</option>
                    <option>Lithuania</option>
                    <option>Luxembourg</option>
                    <option>Madagascar</option>
                    <option>Malawi</option>
                    <option>Malaysia</option>
                    <option>Maldives</option>
                    <option>Mali</option>
                    <option>Malta</option>
                    <option>Marshall Islands</option>
                    <option>Mauritania</option>
                    <option>Mauritius</option>
                    <option>Mexico</option>
                    <option>Micronesia</option>
                    <option>Moldova</option>
                    <option>Monaco</option>
                    <option>Mongolia</option>
                    <option>Montenegro</option>
                    <option>Morocco</option>
                    <option>Mozambique</option>
                    <option>Myanmar</option>
                    <option>Namibia</option>
                    <option>Nauru</option>
                    <option>Nepal</option>
                    <option>Netherlands</option>
                    <option>New Zealand</option>
                    <option>Nicaragua</option>
                    <option>Niger</option>
                    <option>Nigeria</option>
                    <option>North Korea</option>
                    <option>North Macedonia</option>
                    <option>Norway</option>
                    <option>Oman</option>
                    <option>Pakistan</option>
                    <option>Palau</option>
                    <option>Palestine</option>
                    <option>Panama</option>
                    <option>Papua New Guinea</option>
                    <option>Paraguay</option>
                    <option>Peru</option>
                    <option>Philippines</option>
                    <option>Poland</option>
                    <option>Portugal</option>
                    <option>Qatar</option>
                    <option>Romania</option>
                    <option>Russia</option>
                    <option>Rwanda</option>
                    <option>Saint Kitts and Nevis</option>
                    <option>Saint Lucia</option>
                    <option>Saint Vincent and the Grenadines</option>
                    <option>Samoa</option>
                    <option>San Marino</option>
                    <option>Sao Tome and Principe</option>
                    <option>Saudi Arabia</option>
                    <option>Senegal</option>
                    <option>Serbia</option>
                    <option>Seychelles</option>
                    <option>Sierra Leone</option>
                    <option>Singapore</option>
                    <option>Slovakia</option>
                    <option>Slovenia</option>
                    <option>Solomon Islands</option>
                    <option>Somalia</option>
                    <option>South Africa</option>
                    <option>South Korea</option>
                    <option>South Sudan</option>
                    <option>Spain</option>
                    <option>Sri Lanka</option>
                    <option>Sudan</option>
                    <option>Suriname</option>
                    <option>Sweden</option>
                    <option>Switzerland</option>
                    <option>Syria</option>
                    <option>Taiwan</option>
                    <option>Tajikistan</option>
                    <option>Tanzania</option>
                    <option>Thailand</option>
                    <option>Timor-Leste</option>
                    <option>Togo</option>
                    <option>Tonga</option>
                    <option>Trinidad and Tobago</option>
                    <option>Tunisia</option>
                    <option>Turkey</option>
                    <option>Turkmenistan</option>
                    <option>Tuvalu</option>
                    <option>Uganda</option>
                    <option>Ukraine</option>
                    <option>United Arab Emirates</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>Uruguay</option>
                    <option>Uzbekistan</option>
                    <option>Vanuatu</option>
                    <option>Vatican City</option>
                    <option>Venezuela</option>
                    <option>Vietnam</option>
                    <option>Yemen</option>
                    <option>Zambia</option>
                    <option>Zimbabwe</option>
                </select>
            </div>

            <div className="flex justify-start space-x-2 text-sm text-gray-700">
                <input 
                    type="checkbox"
                    id="marketingConsent"
                    className="mt-1 h-4 w-4 text-black border-gray-300 rounded"
                />
                <label htmlFor="marketingConsent" className="text-left">
                    Permitir que mis datos de registro sean compartidos con los socios de contenido de Spotify con fines promocionales. Ten en cuenta que esta información podría ser transferida fuera del Espacio Económico Europeo, conforme a lo indicado en nuestra Política de privacidad
                    <a href="#" className="underline text-blue hover:text-gray-300">
                        Privacy policy
                    </a>
                </label>
            </div>

            <div className="border-t border-gray-300 pt-6 mt-6 flex justify-end space-x-4 bg-white">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 font-medium hover:text-gray-800 transition"
                    >
                    Cancelar
                </button>
                <button 
                    onClick={handleSave}
                    className="bg-gray-800 text-white font-semibold px-5 py-2 rounded-full hover:bg-gray-700 transition"
                    >
                    Guardar perfil
                </button>
            </div>
        </div>
    </div>
  )
}
