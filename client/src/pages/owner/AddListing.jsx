import React, { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Title from '../../components/owner/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { IKCore } from 'imagekitio-react';
import { FaTrash, FaTimes } from 'react-icons/fa'; // Import an icon for deletion
import { RxDragHandleDots2 } from 'react-icons/rx'; // Import a drag handle icon
import MapInput from "./MapInput";
import axios from 'axios'; // Make sure you import axios here

// Add this line at the top of your file, right after your imports
const ItemTypes = {
  IMAGE: 'image',
};
// Draggable and Deletable Image Component
const DraggableImage = ({ id, url, index, uploading, moveImage, onDelete }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="relative w-full h-32 rounded-xl border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600border-[#FD297B] overflow-hidden shadow group cursor-grab"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img
        src={url}
        alt="preview"
        className="w-full h-full object-cover  transition-transform duration-200 group-hover:scale-105"
      />
      {/* Delete button */}
     <button
        type="button"
        onClick={() => onDelete(id)}
        className="absolute top-2 right-2 p-2 bg-black/50 text-red cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete image"
      >
        <FaTimes className="w-5 h-5 text-red-500" />
      </button>

  
    </div>
  );
};

const AddListing = () => {
  const { axios, currency } = useAppContext();




  // Create an instance of IKCore for manual uploads
  const coreImageKit = new IKCore({
    publicKey: "public_GflbYmvPwwTVTeTjdNMkcUAwsiU=",
    urlEndpoint: "https://ik.imagekit.io/somaway",
    authenticationEndpoint: "/api/owner/imagekit-auth", // your server endpoint
  });

  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [listingProgress, setListingProgress] = useState(0);

  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: '',
    propertytype: '',
    offertype: '',
    location: {
    country: 'Kenya',
    county: '',
    city: '',
    suburb: '',
    area: '',
    road: '',

    coordinates: null, // lat, lng inside location
  },
      amenities: { internal: [], external: [], nearby: [] },
    features: { bathrooms: '', bedrooms: '', rooms: '', size: '' },
    agentname: '',
    agentphone: '',
    agentwhatsapp: '',
    scrappingurl: '',
    featured: false,
    featuredexpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    listingstatus: false, // ✅ false = not published
    draft: true,   
  });

   const handleLocationChange = useCallback((newLocation) => {
  setListing(prev => ({
    ...prev,
    location: newLocation, // ✅ use full object from MapInput
  }));
}, []);


  const authenticator = async () => {
    try {
      const response = await axios.get('/api/owner/imagekit-auth');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch authentication parameters:', error);
      toast.error('Failed to authenticate image upload.');
      throw new Error('Authentication failed');
    }
  };

  // --- REFINED IMAGE UPLOAD HANDLER ---
  const handleFileInputChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const validFiles = [];

    for (const file of files) {
      if (images.length + validFiles.length >= 20) {
        toast.error("You can only upload up to 20 images.");
        break;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10 MB limit.`);
        continue;
      }
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} - invalid type (JPG/PNG/WEBP only).`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    const previews = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      uploading: true,
      status: "uploading", // ✅ "uploading" | "success" | "failed"
      file,
    }));
    setImages(prev => [...prev, ...previews]);

   for (const image of previews) {
  try {
    const authParams = await authenticator();

    const result = await coreImageKit.upload({
      file: image.file,
      fileName: image.name,
      folder: "/listings",
      useUniqueFileName: true,
      token: authParams.token,
      signature: authParams.signature,
      expire: authParams.expire,
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress(prev => ({
          ...prev,
          [image.id]: percent,
        }));
      },
    });

    // ✅ SUCCESS: update image with final URL + mark success
    setImages(prev =>
      prev.map(img =>
        img.id === image.id
          ? { ...img, url: result.url, uploading: false, status: "success" }
          : img
      )
    );

    toast.success(`${image.name} uploaded successfully!`);

    // Remove progress tracker for this image
    setUploadProgress(prev => {
      const newState = { ...prev };
      delete newState[image.id];
      return newState;
    });

  } catch (err) {
    console.error("Upload failed", err);
    toast.error(`Failed to upload ${image.name}`);

    // ❌ FAILED: keep image but mark as failed for retry
    setImages(prev =>
      prev.map(img =>
        img.id === image.id
          ? { ...img, uploading: false, status: "failed" }
          : img
      )
    );

    setUploadProgress(prev => {
      const newState = { ...prev };
      delete newState[image.id];
      return newState;
    });
  }
}

  };

  // --- DRAG-AND-DROP HANDLERS ---
  const moveImage = useCallback((dragIndex, hoverIndex) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      const [draggedImage] = newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
  }, []);

  // --- DELETE IMAGE HANDLER ---
  const handleDeleteImage = useCallback((idToDelete) => {
    setImages(prev => prev.filter(img => img.id !== idToDelete));
  }, []);

  // --- FORM INPUT HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setListing({
      ...listing,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFeaturesChange = (e) => {
    const { name, value } = e.target;
    setListing({
      ...listing,
      features: {
        ...listing.features,
        [name]: value,
      },
    });
  };

  const handleAmenitiesChange = (e, type) => {
    const { value, checked } = e.target;
    setListing((prevListing) => {
      const newAmenities = { ...prevListing.amenities };
      if (checked) {
        newAmenities[type] = [...newAmenities[type], value];
      } else {
        newAmenities[type] = newAmenities[type].filter((item) => item !== value);
      }
      return { ...prevListing, amenities: newAmenities };
    });
  };

  // --- FORM SUBMIT (REFINED) ---
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const pendingUploads = images.filter(img => img.uploading);
    if (pendingUploads.length > 0) {
      toast.error('Please wait for all images to finish uploading.');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

     if (!listing.location) {
      toast.error('Please fill in all location fields.');
      return;
    }


  
  if (!listing.agentname ) {
      toast.error('Please enter an Agent name.');
      return;
    }
  if (!listing.agentphone ) {
      toast.error('Please enter an agent contact phone numbetr.');
      return;
    }
       if (!listing.agentwhatsapp ) {
      toast.error('Please enter an agent whatsapp numbetr.');
      return;
    }

  if (!listing.title ) {
      toast.error('Please eneter a title for your property.');
      return;
    }  if (!listing.description ) {
      toast.error('Please enter property description.');
      return;
    }  if (!listing.propertytype ) {
      toast.error('Please select property type.');
      return;
    }
      if (!listing.offertype ) {
      toast.error('Please offertype, for rent or sale.');
      return;
    }
 
    setIsLoading(true);
    setListingProgress(0);

    try {
      const imageUrls = images.map((img) => img.url);

      const { data } = await axios.post(
        '/api/owner/add-listing',
        { ...listing, images: imageUrls, draft: false, listingstatus: true  },
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setListingProgress(percent);
          },
        }
      );

      if (data.success) {
        setListingProgress(100);
        toast.success(data.message);
        window.location.href = `/listing/${data.listingId}`;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "An error occurred during listing creation.");
    } finally {
      setIsLoading(false);
    }
  };


  const retryUpload = async (image) => {
  setImages(prev =>
    prev.map(img => img.id === image.id ? { ...img, uploading: true, status: "uploading" } : img)
  );

  try {
    const authParams = await authenticator();
    const result = await coreImageKit.upload({
      file: image.file,
      fileName: image.name,
      folder: "/listings",
      useUniqueFileName: true,
      token: authParams.token,
      signature: authParams.signature,
      expire: authParams.expire,
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress(prev => ({ ...prev, [image.id]: percent }));
      },
    });

    setImages(prev =>
      prev.map(img => img.id === image.id
        ? { ...img, url: result.url, uploading: false, status: "success" }
        : img
      )
    );

    toast.success(`${image.name} uploaded successfully!`);
  } catch (err) {
    toast.error(`Retry failed for ${image.name}`);
    setImages(prev =>
      prev.map(img =>
        img.id === image.id ? { ...img, uploading: false, status: "failed" } : img
      )
    );
  }
};


const autosaveDraft = useCallback(async () => {
  // Don't autosave if the form is empty
  if (!listing.title && images.length === 0) {
    return;
  }

  // Check for pending uploads before autosaving
  const pendingUploads = images.filter(img => img.uploading);
  if (pendingUploads.length > 0) {
      // You can show a subtle message to the user that autosave is waiting for uploads
      console.log("Autosave is waiting for images to finish uploading.");
      return;
  }

  const imageUrls = images.map(img => img.url);
  const dataToSave = {
      ...listing,
      images: imageUrls,
      draft: true, // Mark as draft
      listingstatus: false, // Inactive status for a draft
  };

  try {
      const response = await axios.post('/api/owner/autosave-listing', dataToSave);
      if (response.data.success) {
        // Optionally, you can show a small, non-intrusive toast
        console.log("Listing autosaved as a draft!");
      }
  } catch (error) {
      console.error("Autosave failed:", error);
  }
}, [axios, listing, images]);


const timerRef = useRef(null);

useEffect(() => {
    // Clear previous timer to prevent multiple saves on rapid changes
    if (timerRef.current) {
        clearTimeout(timerRef.current);
    }

    // Set a new timer. Adjust the delay as needed (e.g., 5000ms = 5 seconds)
    timerRef.current = setTimeout(() => {
        autosaveDraft();
    }, 5000); // Autosave every 5 seconds of inactivity

    // Cleanup function: This runs when the component unmounts or the dependencies change
    return () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };
}, [listing, images, autosaveDraft]); // Dependencies to trigger the effect

  // --- AMENITIES OPTIONS (unchanged) ---
  const internalAmenities = [
    'AC', 'Heating', 'Wi-Fi', 'Bathtub', 'Dishwasher', 'Built-in washer', 'Built-in dryer',
    'Smart home', 'Balcony', 'Security systems', 'CCTV cameras', 'Intercoms',
  ];

  const externalAmenities = [
    'Parking', 'Pool', 'Gym & Fitness center', 'Social areas', 'Rooftop gardens',
    'Back garden', 'Bike parking', 'Covered parking', 'Package lockers',
    'Party room', 'Billiards table', 'Clubhouse', 'Spa', 'Playgrounds',
    'Walking paths', 'Friendly spaces', 'Valet trash', 'Surveillance cameras',
    'Building Wi-Fi', 'Greenery around the space',
  ];

  const nearbyAmenities = [
    'Gym', 'Shopping Mall', 'Public transportation access', 'Airport', 'Train',
    'Beach', 'Parks', 'Restaurants', 'Coffee shops', 'Grocery stores',
    'Schools', 'Hospitals/Clinics', 'Banks/ATMs', 'Movie theaters', 'Libraries',
  ];

  return (

    <DndProvider backend={HTML5Backend}>
      <div className="flex justify-center items-center "> 
      <div className="px-4 py-10 md:px-10 flex-1">
        <Title
          title="Add New Listing"
          subTitle="Fill in the details to create a new listing for sale or rent."
        />
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-5  md:gap-9  text-gray-800 text-sm mt-6 max-w-xl"
        >
          {/* Upload Section */}
         {/* 📤 Upload Section */}
<div className="flex flex-col gap-3 w-full">
  {/* Upload Label */}
  <label
    htmlFor="listing-images"
    className="flex items-center gap-2 p-2 bg-bgColor rounded-xl cursor-pointer hover:bg-bgColorhover transition"
  >
    <img src={assets.upload_icon} alt="Upload" className="h-14 rounded-xl" />
    <p className="text-sm text-gray-800">
      Upload one or more pictures of your listing (max 20, 10MB each)
    </p> 
    <input
      id="listing-images"
      ref={fileInputRef}
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={handleFileInputChange}
    />
  </label>

  {/* 🖼️ Preview & Drag-and-drop Area */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
    {images.map((img, index) => (
      <div key={img.id} className="relative w-full h-32 rounded-xl overflow-hidden shadow bg-gray-100">
        {/* 📷 Image Preview */}
        <img
          src={img.url}
          alt={img.status === "failed" ? "failed" : "preview"}
          className={`w-full h-full object-cover rounded-xl border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600${img.status === "failed" ? "opacity-50" : ""}`}
        />

        {/* ❌ Delete Button (Always Visible) */}
        <button
          type="button"
          onClick={() => handleDeleteImage(img.id)}
          className="absolute top-2 right-2 p-2 z-5 bg-black/40 cursor-pointer rounded-full hover:bg-black/60 transition"
          aria-label="Delete image"
        >
          <FaTimes className="w-5 h-5 text-red-500" />
        </button>

        {/* 🔄 Overlay for Uploading */}
        {img.uploading && (
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center rounded-xl">
            <p className="text-white text-sm animate-pulse">Uploading...</p>
          </div>
        )}

        {/* ⚠️ Overlay for Failed Upload */}
        {img.status === "failed" && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-xl">
            <p className="text-white text-sm">Upload failed</p>
            <button
              onClick={() => retryUpload(img)}
              className="px-3 py-1 mt-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* ✅ If successfully uploaded, make it draggable */}
        {!img.uploading && img.status !== "failed" && (
          <DraggableImage
            id={img.id}
            url={img.url}
            index={index}
            moveImage={moveImage}
            onDelete={handleDeleteImage}
          />
        )}
      </div>
    ))}
  </div>
</div>



  {/* Map Input Component */}
          <MapInput
            initialAddress={listing.location}
            onLocationChange={handleLocationChange}
          />
            {/* Other form fields ... */}
            {/* Agent info, title, description, features, amenities, etc. */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col w-full">
                <label className="font-semibold md:text-lg " > Agent Name</label>
                <input
                  type="text"
                  name="agentname"
                  placeholder="John Doe"
                  required
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md "
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Agent Phone</label>
                <input
                  type="number"
                  name="agentphone"
                  placeholder="+254-555-1234"
                  required
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600    rounded-md   rounded-md outline-none"
                  value={listing.agentphone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Agent WhatsApp</label>
                <input
                  type="number"
                  name="agentwhatsapp"
                  placeholder="+254-555-5678"
                  required
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                  value={listing.agentwhatsapp}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
             <label className="font-semibold md:text-lg " >Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Beautiful 3-bedroom apartment"
                required
                className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                value={listing.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col w-full">
             <label className="font-semibold md:text-lg " >Description</label>
              <textarea
                rows={5}
                name="description"
                placeholder="e.g. A luxurious apartment with a spacious interior and a great view."
                required
                className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                value={listing.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Property Type</label>
                <select
                  name="propertytype"
                  value={listing.propertytype}
                  onChange={handleInputChange}
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                >
                  <option value="">Apartments etc </option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Land">Land</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Offer Type</label>
                <select
                  name="offertype"
                  value={listing.offertype}
                  onChange={handleInputChange}
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                >
                  <option value="">Select an offer type</option>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Price ({currency})</label>
                <input
                  type="number"
                  name="price"
                  placeholder="500000"
                  required
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                  value={listing.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
     
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="3"
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                  value={listing.features.bedrooms}
                  onChange={handleFeaturesChange}
                />
              </div>
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="2"
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                  value={listing.features.bathrooms}
                  onChange={handleFeaturesChange}
                />
              </div>
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Rooms</label>
                <input
                  type="number"
                  name="rooms"
                  placeholder="5"
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                  value={listing.features.rooms}
                  onChange={handleFeaturesChange}
                />
              </div>
              <div className="flex flex-col w-full">
               <label className="font-semibold md:text-lg " >Size</label>
                <input
                  type="number"
                  name="size"
                  placeholder="e.g. 120 sft"
                  className="px-3 py-2 mt-1 border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600     rounded-md   rounded-md outline-none"
                  value={listing.features.size}
                  onChange={handleFeaturesChange}
                />
              </div>
            </div>
            <div className="flex flex-col w-full gap-3">
                <div className=" gap-4 md:gap-9 ">


                  <div className="border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600p-2 md:p-6      " >
                  <h4 className="md:text-lg  font-semibold">Internal Amenities</h4>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {internalAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          name="amenities-internal"
                          value={amenity}
                          onChange={(e) => handleAmenitiesChange(e, 'internal')}
                          className="mr-2"
                          checked={listing.amenities.internal.includes(amenity)}
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>

                                    <div className="border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600p-2 md:p-6      " >

                  <h4 className="md:text-lg  font-semibold ">External Amenities</h4>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {externalAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          name="amenities-external"
                          value={amenity}
                          onChange={(e) => handleAmenitiesChange(e, 'external')}
                          className="mr-2"
                          checked={listing.amenities.external.includes(amenity)}
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>


                <div className="border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600p-2 md:p-6      " >
                <h4 className="md:text-lg  font-semibold ">Nearby Amenities</h4>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {nearbyAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          name="amenities-nearby"
                          value={amenity}
                          onChange={(e) => handleAmenitiesChange(e, 'nearby')}
                          className="mr-2"
                          checked={listing.amenities.nearby.includes(amenity)}
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                  </div>
                <div>

                </div>

                   <div>



                </div>
              </div>
            </div>
                                                <div className="border border-gray-400  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600p-2 md:p-6      " >

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={listing.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary"
              />
              <label htmlFor="featured" className="md:text-lg  font-semibold ">
                Mark as Featured
              </label>
            </div>             </div>


            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 mt-4 btn text-white rounded-md font-medium w-max cursor-pointer"
            >
              <img src={assets.tick_icon} alt="" />
              {isLoading ? 'Listing...' : 'Create listing'}
            </button>

            {/* Listing Progress */}
            {isLoading && (
              <div className="w-full bg-gray-200 rounded-md overflow-hidden mt-2">
                <div
                  className="bg-green-500 h-2 transition-all"
                  style={{ width: `${listingProgress}%` }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Creating listing... {listingProgress}%
                </p>
              </div>
            )}
          </form>
        </div>
        </div>
  
    </DndProvider>




  );
};

export default AddListing;