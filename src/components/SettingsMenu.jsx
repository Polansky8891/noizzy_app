import { useNavigate } from "react-router-dom";

export const SettingsMenu = ({ closeMenu }) => {

  const navigate = useNavigate();

  return (

    <div 
      className="bg-[#1C1C1C] text-white rounded-xl shadow-lg border border-white/10 p-3 w-56"
      >
      <ul className="space-y-1">
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
            
    
 
    
  
