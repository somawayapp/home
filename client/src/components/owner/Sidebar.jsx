import React, { useState } from 'react';
import { assets, ownerMenuLinks } from '../../assets/assets';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, axios, fetchUser } = useAppContext();
  const location = useLocation();
  const [image, setImage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className='relative'>
      {/* Hamburger menu for small screens */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='md:hidden absolute top-4 left-4 z-50 text-gray-700'
      >
        <img src={assets.menu_icon} alt='Menu' width={24} />
      </button>

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-borderColor text-sm z-40 transition-transform duration-300 ease-in-out ${
          isExpanded ? 'translate-x-0 w-60' : '-translate-x-full w-0'
        } md:static md:translate-x-0 md:w-60 md:flex md:flex-col md:items-center md:pt-8`}
      >
        {/* Profile Image and Name */}
        <div className='flex flex-col items-center pt-8 md:pt-0'>
          <div className='group relative'>
            <label htmlFor='image' className='cursor-pointer'>
              <img
                src={image ? URL.createObjectURL(image) : user?.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300'}
                alt='Profile'
                className='h-14 w-14 rounded-full mx-auto'
              />
              <input type='file' id='image' accept='image/*' hidden onChange={(e) => setImage(e.target.files[0])} />
              <div className='absolute hidden top-0 right-0 left-0 bottom-0 bg-black/10 rounded-full group-hover:flex items-center justify-center'>
                <img src={assets.edit_icon} alt='Edit' />
              </div>
            </label>
          </div>
          {image && (
            <button className='absolute top-2 right-2 flex p-2 gap-1 bg-primary/10 text-primary cursor-pointer' onClick={updateImage}>
              Save <img src={assets.check_icon} width={13} alt='Save' />
            </button>
          )}
          <p className='mt-2 text-base'>{user?.name}</p>
        </div>

        {/* Navigation Links */}
        <div className='w-full mt-6'>
          {ownerMenuLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              onClick={() => setIsExpanded(false)} // Collapse on link click
              className={`relative flex items-center gap-2 w-full py-3 pl-4 ${link.path === location.pathname ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
            >
              <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt={link.name} />
              <span>{link.name}</span>
              <div className={`${link.path === location.pathname && 'bg-primary'} w-1.5 h-8 rounded-l right-0 absolute`}></div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-grow md:ml-60 lg:ml-80 p-8'>
        <div className='flex items-center justify-center min-h-screen w-full'>
          <h1 className='text-3xl font-bold'>Main Content Here</h1>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;