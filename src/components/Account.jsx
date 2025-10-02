import { BsPencil } from "react-icons/bs";
import { MdOutlineHomeWork } from "react-icons/md";
import { RiFolderMusicLine } from "react-icons/ri";
import { MdCancelPresentation } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa6";
import { Link } from "react-router-dom";

export const Account = () => {
  return (
    <div className="bg-black min-h-screen text-gray-800 p-6 space-y-6 font-sans">

      {/* Account */}
      <div className="bg-[#1C1C1C] p-6 border border-[#0A84FF] rounded-xl shadow">
        <h3 className="text-xl text-[#0A84FF] font-semibold mb-4">Account</h3>
        <div className="space-y-4">
          <CardItem icon={<BsPencil />} label="Personal information" to="/personal_information"/>
          <CardItem icon={<MdOutlineHomeWork />}label="Address" to="/address" />
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-[#1C1C1C] p-6 border border-[#0A84FF] rounded-xl shadow">
        <h3 className="text-xl text-[#0A84FF] font-semibold mb-4">Subscription</h3>
        <div className="space-y-4">
          <CardItem icon={<RiFolderMusicLine />} label="Subscription management" to="/subscription_management"/>
          <CardItem icon={<MdCancelPresentation />} label="Cancel subscription" to="/cancel_subscription" />
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="bg-[#1C1C1C] p-6 border border-[#0A84FF] rounded-xl shadow">
        <h3 className="text-xl text-[#0A84FF] font-semibold mb-4">Security and privacy</h3>
        <div className="space-y-3 ">
          <CardItem icon={<RiLockPasswordLine />} label="Change your password" to="/change_password"/>
        </div>

      </div>
    </div>
  );
};

const CardItem = ({ icon, label, to }) => (
  <Link
    to={to}
    className="flex items-center justify-between bg-black p-4 rounded-lg border border-transparent hover:border-[#0A84FF] transition cursor-pointer shadow-sm"
  >
    <div className="flex items-center space-x-3">
      <span className="text-lg text-[#0A84FF]">{icon}</span>
      <span className="text-[#0A84FF] font-medium">{label}</span>
    </div>
    <span className="text-xl text-[#0A84FF]">›</span>
  </Link>
);


  
 



