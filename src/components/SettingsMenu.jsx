import { useNavigate } from "react-router-dom";

export const SettingsMenu = ({ closeMenu }) => {

  const navigate = useNavigate();

  return (

    <div 
      className="absolute bottom-12 right-0 bg-black rounded-lg shadow-lg w-40 z-50"
      >
      <ul className="py-1">
        <li>
          <button
            onClick={() => {
              navigate('/account');
              closeMenu();
            }}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8]"
          >
            Account
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8]"
          >
            Settings
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8]"
          >
            Option 3
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8]"
          >
            Option 4
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8]"
          >
            Option 5
          </button>
        </li>
      </ul>
    </div>
  );
};
            
    
 
    
  
