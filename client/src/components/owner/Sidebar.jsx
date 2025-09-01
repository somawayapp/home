import React, { useState } from 'react';
import { assets, ownerMenuLinks } from '../../assets/assets';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isSidebarOpen }) => {
  const { user, axios, fetchUser } = useAppContext();
  const location = useLocation();
  const [image, setImage] = useState('');

  const updateImage = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const { data } = await axios.post('/api/owner/update-image', formData);

      if (data.success) {
        fetchUser();
        toast.success(data.message);
        setImage('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={`relative min-h-screen pt-8 border-r border-borderColor text-sm transition-all duration-300 ${isSidebarOpen ? 'md:w-60 w-full max-w-full' : 'w-16 md:w-20'}`}>
      <div className={`flex flex-col items-center overflow-hidden h-full ${isSidebarOpen ? 'p-4' : 'px-2'}`}>
        <div className='group relative'>
          <label htmlFor="image">
            <img 
              src={image ? URL.createObjectURL(image) : user?.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"} 
              alt="Profile" 
              className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto'
            />
            <input 
              type="file" 
              id='image' 
              accept="image/*" 
              hidden 
              onChange={e => setImage(e.target.files[0])}
            />
            <div className='absolute hidden top-0 right-0 left-0 bottom-0 bg-black/10 rounded-full group-hover:flex items-center justify-center cursor-pointer'>
              <img src={assets.edit_icon} alt="Edit" />
            </div>
          </label>
        </div>
        {image && (
          <button 
            className='flex p-2 gap-1 bg-primary/10 text-primary cursor-pointer mt-2 text-xs md:text-sm' 
            onClick={updateImage}
          >
            Save <img src={assets.check_icon} width={13} alt="Save" />
          </button>
        )}
        <p className={`mt-2 text-base ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>{user?.name}</p>

        <div className='w-full mt-6'>
          {ownerMenuLinks.map((link, index) => (
            <NavLink 
              key={index} 
              to={link.path} 
              className={`relative flex items-center gap-2 w-full py-3 px-2 md:pl-4 transition-colors duration-200 ${link.path === location.pathname ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
            >
              <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt={link.name} />
              <span className={`${isSidebarOpen ? 'block' : 'hidden md:block'}`}>{link.name}</span>
              <div className={`${link.path === location.pathname ? 'bg-primary' : 'hidden'} w-1.5 h-8 rounded-l right-0 absolute`}></div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
