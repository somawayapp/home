import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Title from '../../components/owner/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import ImageKit from "imagekitio-react";
import DraggableImage from '../../components/DragableImage';

const AddListing = () => {
  const { axios, currency } = useAppContext();

  const [images, setImages] = useState([]);
  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: 0,
    propertytype: '',
    offertype: '',
    location: '',
    amenities: {
      internal: [],
      external: [],
      nearby: [],
    },
    features: {
      bathrooms: 0,
      bedrooms: 0,
      rooms: 0,
      size: '',
    },
    agentname: '',
    agentphone: '',
    agentwhatsapp: '',
    scrappingurl: '',
    featured: false,
    featuredexpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize ImageKit SDK instance
  const imagekit = new ImageKit({
    publicKey: process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT,
    // Point to your new backend route for authentication
    authenticationEndpoint: `${axios.defaults.baseURL}/owner/imagekit-auth`,
  });

  // This handler now uploads directly to ImageKit
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsLoading(true);

    try {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          imagekit.upload(
            {
              file: file,
              fileName: file.name,
              folder: "/listings",
              onSuccess: (result) => {
                const optimizedImageUrl = imagekit.url({
                  path: result.filePath,
                  transformation: [
                    { width: "1280" },
                    { quality: "auto" },
                    { format: "webp" },
                  ],
                });
                resolve({ file: file, url: optimizedImageUrl });
              },
              onError: (error) => {
                reject(error);
              },
            }
          );
        });
      });

      const results = await Promise.all(uploadPromises);
      setImages((prevImages) => [
        ...prevImages,
        ...results,
      ]);
    } catch (error) {
      toast.error("Failed to upload images.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageRemove = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  
  const moveImage = useCallback((dragIndex, hoverIndex) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      const [draggedImage] = newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
  }, []);

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

  const internalAmenities = [
    'AC', 'Heating', 'Wi-Fi', 'Bathtub', 'Dishwasher', 'Built-in washer', 'Built-in dryer', 
    'Smart home', 'Balcony', 'Security systems', 'CCTV cameras', 'Intercoms',
  ];

  const externalAmenities = [
    'Parking', 'Pool', 'Gym & Fitness center', 'Social areas', 'Rooftop gardens', 'Back garden',
    'Bike parking', 'Covered parking', 'Package lockers', 'Party room', 'Billiards table',
    'Clubhouse', 'Spa', 'Playgrounds', 'Walking paths', 'Friendly spaces', 'Valet trash',
    'Surveillance cameras', 'Building Wi-Fi', 'Greenery around the space',
  ];

  const nearbyAmenities = [
    'Gym', 'Shopping Mall', 'Public transportation access', 'Airport', 'Train', 'Beach',
    'Parks', 'Restaurants', 'Coffee shops', 'Grocery stores', 'Schools', 'Hospitals/Clinics',
    'Banks/ATMs', 'Movie theaters', 'Libraries',
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return null;

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsLoading(true);
    try {
      // Extract just the URLs from the images state
      const imageUrls = images.map(img => img.url);

      const { data } = await axios.post('/owner/add-listing', {
        ...listing,
        images: imageUrls, // Send the array of URLs
      });

      if (data.success) {
        toast.success(data.message);
        setImages([]);
        setListing({
          title: '',
          description: '',
          price: 0,
          propertytype: '',
          offertype: '',
          location: '',
          amenities: {
            internal: [],
            external: [],
            nearby: [],
          },
          features: {
            bathrooms: 0,
            bedrooms: 0,
            rooms: 0,
            size: '',
          },
          agentname: '',
          agentphone: '',
          agentwhatsapp: '',
          scrappingurl: '',
          featured: false,
          featuredexpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* listing Images */}
          <div className="flex flex-col gap-3 w-full">
            <label
              htmlFor="listing-images"
              className="flex items-center gap-2 border-2 border-blue-400 p-2 rounded-md cursor-pointer"
            >
              <img
                src={assets.upload_icon}
                alt="Upload"
                className="h-14 rounded"
              />
              <input
                type="file"
                id="listing-images"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageUpload}
              />
              <p className="text-sm text-gray-800">
                Upload one or more pictures of your listing
              </p>
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <DraggableImage
                    key={img.url}
                    image={img.file}
                    imageUrl={img.url}
                    index={index}
                    onMove={moveImage}
                    onRemove={handleImageRemove}
                  />
                ))}
              </div>
            )}
          </div>
          {/* ... (rest of your form) */}
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
              className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
              className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
                value={listing.price}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. New York, Houston..."
              required
              className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
              value={listing.location}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Scrapping URL (optional)</label>
            <input
              type="url"
              name="scrappingurl"
              placeholder="https://example-listing.com"
              className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
              value={listing.scrappingurl}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col w-full">
              <label>Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                placeholder="3"
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
        </form>
      </div>
    </DndProvider>
  );
};

export default AddListing;