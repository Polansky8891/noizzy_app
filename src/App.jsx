import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Header } from './components/Header';
import { Nav } from './components/Nav';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import { Register } from './auth/pages/Register';

export const App = () => {
  return (
    <> 
    <BrowserRouter>
    <Nav />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/library" element={<Library/>} />
        <Route path="/profile" element={<Register/>} />
      </Routes>
    
    
    </BrowserRouter>
    
    
     
       
    
    </>
   
  )
}







