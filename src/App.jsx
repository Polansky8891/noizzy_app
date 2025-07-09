import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Nav } from './components/Nav';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Register } from './auth/pages/Register';
import { Login } from './auth/pages/Login';
import { SideBarLeft } from './components/SideBarLeft';
import { SideBarRight } from './components/SideBarRight';
import { Account } from './components/Account';
import { PersonalInformation } from './components/PersonalInformation';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { ChangePassword } from './components/ChangePassword';
import { Notifications } from './components/Notifications';

export const App = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        <Nav />
        
        <div className="flex flex-1 pt-16"> 
          {/* pt-16 si Nav es h-16 (64px), para que el contenido no quede debajo del Nav */}
          
          <SideBarLeft className="w-120"/>
          

          <main className="flex-1 overflow-y-auto">
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
            </Routes>
          </main>

          <SideBarRight />

        </div>
      </div>
    </BrowserRouter>
  );
};







