import React, { useState, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Title from '../../components/owner/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { IKCore } from 'imagekitio-react';
import { FaTrash, FaTimesCircle } from 'react-icons/fa'; // Import an icon for deletion
import { RxDragHandleDots2 } from 'react-icons/rx'; // Import a drag handle icon
import MapInput from "./MapInput";

const ItemTypes = {
  IMAGE: 'image',
};

// Draggable and Deletable Image Component
const DraggableImage = ({ id, url, index, moveImage, onDelete }) => {
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
      className="relative w-full h-32 rounded-xl overflow-hidden shadow group cursor-grab"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img
        src={url}
        alt="preview"
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(id)}
        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Delete image"
      >
        <FaTimesCircle className="w-5 h-5" />
      </button>

      {/* Drag handle */}
      <div className="absolute top-2 left-2 p-1 bg-black/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <RxDragHandleDots2 className="w-5 h-5" />
      </div>
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
    location: '',
    coordinates: null, // Add a new state for coordinates
    amenities: { internal: [], external: [], nearby: [] },
    features: { bathrooms: '', bedrooms: '', rooms: '', size: '' },
    agentname: '',
    agentphone: '',
    agentwhatsapp: '',
    scrappingurl: '',
    featured: false,
    featuredexpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

    const handleLocationChange = useCallback((newLocation) => {
    setListing(prev => ({
      ...prev,
      location: newLocation.location,
      coordinates: newLocation.coordinates,
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

        // Update the image object with the final URL and mark as not uploading
        setImages(prev =>
          prev.map(img =>
            img.id === image.id
              ? { ...img, url: result.url, uploading: false }
              : img
          )
        );
        toast.success(`${image.name} uploaded successfully!`);

        // Clean up the progress state for this image once it's done
        setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[image.id];
          return newState;
        });

      } catch (err) {
        console.error("Upload failed", err);
        toast.error(`Failed to upload ${image.name}`);
        // Remove the failed image from the state
        setImages(prev => prev.filter(img => img.id !== image.id));
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

     if (!listing.location || !listing.coordinates) {
      toast.error('Please select a location on the map or type in an address.');
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
        { ...listing, images: imageUrls, coordinates: listing.coordinates },
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
      <div className="px-4 py-10 md:px-10 flex-1">
        <Title
          title="Add New Listing"
          subTitle="Fill in the details to create a new listing for sale or rent."
        />
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-5 text-gray-800 text-sm mt-6 max-w-xl"
        >
          {/* Upload Section */}
          <div className="flex flex-col gap-3 w-full">
            <label
              htmlFor="listing-images"
              className="flex items-center gap-2 border-2 border-blue-600 p-2 rounded-md cursor-pointer"
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

            {/* ✅ Preview & Drag-and-drop area */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {images.map((img, index) => {
                if (img.uploading) {
                  return (
                    <div key={img.id} className="relative w-full h-32 rounded-xl overflow-hidden shadow bg-gray-100 flex items-center justify-center">
                      <img
                        src={img.url}
                        alt="preview"
                        className="w-full h-full object-cover rounded-xl border border-blue-600 shadow opacity-50"
                      />
                      <div className="absolute inset-0 border border-blue-600 bg-black/20 flex flex-col items-center justify-center rounded-xl">
                        <p className="text-white text-sm">Uploading...</p>
                          </div>
                    </div>
                  );
                }
                return (
                  <DraggableImage
                    key={img.id}
                    id={img.id}
                    url={img.url}
                    index={index}
                    moveImage={moveImage}
                    onDelete={handleDeleteImage}
                  />
                );
              })}
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
                <label>Agent Name</label>
                <input
                  type="text"
                  name="agentname"
                  placeholder="John Doe"
                  required
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400"
                  value={listing.agentname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col w-full">
                <label>Agent Phone</label>
                <input
                  type="number"
                  name="agentphone"
                  placeholder="+1-555-1234"
                  required
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                  value={listing.agentphone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col w-full">
                <label>Agent WhatsApp</label>
                <input
                  type="number"
                  name="agentwhatsapp"
                  placeholder="+1-555-5678"
                  required
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                  value={listing.agentwhatsapp}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Beautiful 3-bedroom apartment"
                required
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                value={listing.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col w-full">
              <label>Description</label>
              <textarea
                rows={5}
                name="description"
                placeholder="e.g. A luxurious apartment with a spacious interior and a great view."
                required
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                value={listing.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col w-full">
                <label>Property Type</label>
                <select
                  name="propertytype"
                  value={listing.propertytype}
                  onChange={handleInputChange}
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                >
                  <option value="">Select a property type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Land">Land</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div className="flex flex-col w-full">
                <label>Offer Type</label>
                <select
                  name="offertype"
                  value={listing.offertype}
                  onChange={handleInputChange}
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                >
                  <option value="">Select an offer type</option>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
              <div className="flex flex-col w-full">
                <label>Price ({currency})</label>
                <input
                  type="number"
                  name="price"
                  placeholder="500000"
                  required
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                  value={listing.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
     
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col w-full">
                <label>Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="3"
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                  value={listing.features.bedrooms}
                  onChange={handleFeaturesChange}
                />
              </div>
              <div className="flex flex-col w-full">
                <label>Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="2"
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                  value={listing.features.bathrooms}
                  onChange={handleFeaturesChange}
                />
              </div>
              <div className="flex flex-col w-full">
                <label>Rooms</label>
                <input
                  type="number"
                  name="rooms"
                  placeholder="5"
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                  value={listing.features.rooms}
                  onChange={handleFeaturesChange}
                />
              </div>
              <div className="flex flex-col w-full">
                <label>Size</label>
                <input
                  type="number"
                  name="size"
                  placeholder="e.g. 120 sft"
                  className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                  value={listing.features.size}
                  onChange={handleFeaturesChange}
                />
              </div>
            </div>
            <div className="flex flex-col w-full gap-3">
              <label className="text-sm font-medium text-gray-700">Amenities</label>
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-800">Internal Amenities</h4>
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
                <div>
                  <h4 className="text-md font-semibold text-gray-800">External Amenities</h4>
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
                <div>
                  <h4 className="text-md font-semibold text-gray-800">Nearby Amenities</h4>
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
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={listing.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">
                Mark as Featured
              </label>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer"
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
  
    </DndProvider>
  );
};

export default AddListing;