import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTachometerAlt, FaTruck, FaBox, FaPersonBooth, FaShoppingCart, FaEye, FaUser, FaUsersCog, FaCog , FaCalendarAlt, FaClock } from 'react-icons/fa';
import Moment from 'react-moment';


const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const [Name, setFinalName] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

 
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);
  

return (
    <nav className="bg-blue-600 fixed top-0 z-50 w-full p-3  shadow-lg">
      <div className="flex justify-between items-center">
        <div className="text-white text-2xl font-bold">{Name}</div>
        
        <button 
          className="text-white text-2xl md:hidden" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FaBars />
        </button>
        
        <div className="hidden md:flex space-x-6">
       
          <NavItem icon={<FaShoppingCart className="text-fuchsia-400" />} label="Invoice" to="/invoice" />

          <NavItem icon={<FaBox className="text-red-400" />} label="Inventory" to="/inventory" />
         
        </div>
        
        <div className="text-white text-sm hidden md:flex space-x-3">
        <FaCalendarAlt size={20} className='text-pink-500'/>
      <Moment format="DD-MM-YYYY">{currentTime}</Moment>

      <FaClock size={20} className='text-green-400'/>
      <Moment format="HH:mm:ss">{currentTime}</Moment>
        </div>
      </div>
      
      {menuOpen && (
        <div className="md:hidden flex flex-col space-y-4 mt-4">
          <NavItem icon={<FaShoppingCart className="text-orange-400" />} label="Invoice" to="/invoice" />

<NavItem icon={<FaBox className="text-red-400" />} label="Inventory" to="/inventory" />
          
         
           <div className="text-white text-sm flex flex-col items-center mt-4">
           <FaCalendarAlt size={20} style={{ marginRight: '8px' }} />
      <Moment format="DD-MM-YYYY">{currentTime}</Moment>

      <FaClock size={20} style={{ marginRight: '8px' }} />
      <Moment format="HH:mm:ss">{currentTime}</Moment>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ icon, label, to , setMenuOpen }) => {
  return (
    <Link to={to} className="flex items-center space-x-2 text-white hover:scale-110 transition" 
     onClick={() => setMenuOpen(false) } >    
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
};

export default Navbar;