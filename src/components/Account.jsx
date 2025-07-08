import { BsPencil } from "react-icons/bs";
import { MdOutlineHomeWork } from "react-icons/md";
import { RiFolderMusicLine } from "react-icons/ri";
import { MdCancelPresentation } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa6";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { Link } from "react-router-dom";

export const Account = () => {
  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 p-6 space-y-6 font-sans">

      {/* Account */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Account</h3>
        <div className="space-y-4">
          <CardItem icon={<BsPencil />} label="Personal information" to="/personal_information"/>
          <CardItem icon={<MdOutlineHomeWork />}label="Address" />
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Subscription</h3>
        <div className="space-y-4">
          <CardItem icon={<RiFolderMusicLine />} label="Subscription management" to="/subscription_management"/>
          <CardItem icon={<MdCancelPresentation />} label="Cancel subscription" />
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Security and privacy</h3>
        <div className="space-y-3">
          <CardItem icon={<RiLockPasswordLine />} label="Change your password" />
          <CardItem icon={<FaRegBell />} label="Notifications" />
          <CardItem icon={<MdOutlinePrivacyTip />} label="Account privacy" />
        </div>

      </div>
    </div>
  );
};

const CardItem = ({ icon, label, to }) => (
  
   <Link
    to={to}
    className="flex items-center justify-between bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition cursor-pointer shadow-sm text-gray-800"
  >
    <div className="flex items-center space-x-3">
      <span className="text-lg text-gray-700">{icon}</span>
      <span className="text-gray-800 font-medium">{label}</span>
    </div>
    <span className="text-xl text-gray-500">›</span>
  </Link>
);

  
 



