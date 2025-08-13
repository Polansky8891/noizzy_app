import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Nav } from './components/Nav';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Register } from './auth/pages/Register';
import { Login } from './auth/pages/Login';
import { Account } from './components/Account';
import { PersonalInformation } from './components/PersonalInformation';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { ChangePassword } from './components/ChangePassword';
import { Notifications } from './components/Notifications';
import { Address } from './components/Address';
import { CancelSubscription } from './components/CancelSubscription';
import { SideBar } from './components/SideBar';
import { MusicPlayer } from './components/MusicPlayer';
import { Rock } from './pages/Rock';

export const App = () => {
  return (
    <BrowserRouter>
    <div className="flex h-screen w-screen bg-black overflow-hidden">
    {/* Sidebar fijo a la izquierda */}
    <SideBar />

    {/* Área principal */}
    <div className="flex-1 min-w-0 flex flex-col">
      <main className="flex-1 overflow-y-auto p-2">
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/profile" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/account" element={<Account />} />
              <Route path="/personal_information" element={<PersonalInformation/>} />
              <Route path="/subscription_management" element={<SubscriptionManagement/>} />
              <Route path="/change_password" element={<ChangePassword/>} />
              <Route path="/notifications" element={<Notifications/>} />
              <Route path="/address" element={<Address/>} />
              <Route path="/cancel_subscription" element={<CancelSubscription/>} />
              <Route path="/rock" element={<Rock/>} />
            </Routes>
      </main>
      <MusicPlayer/>
    </div>
    </div>
    </BrowserRouter>
  );
};







