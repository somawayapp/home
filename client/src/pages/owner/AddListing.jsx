import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Title from '../../components/owner/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { IKContext, IKUpload, IKCore } from 'imagekitio-react';
import DraggableImage from '../../components/DragableImage';

const AddListing = () => {
  const { axios, currency } = useAppContext();

  const coreImageKit = new IKCore({
    publicKey: 'public_GflbYmvPwwTVTeTjdNMkcUAwsiU=',
    urlEndpoint: 'https://ik.imagekit.io/somaway',
  });

  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [listingProgress, setListingProgress] = useState(0);

  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: 0,
    propertytype: '',
    offertype: '',
    location: '',
    amenities: { internal: [], external: [], nearby: [] },
    features: { bathrooms: 0, bedrooms: 0, rooms: 0, size: '' },
    agentname: '',
    agentphone: '',
    agentwhatsapp: '',
    scrappingurl: '',
    featured: false,
    featuredexpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

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

  // --- IMAGE UPLOAD HANDLERS ---
  const onUploadStart = (files) => {
    const totalFiles = files.length + images.length;
    if (totalFiles > 20) {
      toast.error('You can only upload up to 20 images.');
      return false;
    }

    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10 MB limit.`);
        return false;
      }
    }
    return true;
  };
  
  const onUploadSuccess = (result) => {
    setIsLoading(false);
    setUploadProgress((prev) => {
      const copy = { ...prev };
      delete copy[result.name];
      return copy;
    });

    const optimizedImageUrl = coreImageKit.url({
      path: result.filePath,
      transformation: [
        { width: '1280' },
        { quality: 'auto' },
        { format: 'webp' },
      ],
    });

    setImages((prevImages) => [
      ...prevImages,
      {
        id: result.fileId,
        name: result.name,
        url: optimizedImageUrl,
        originalUrl: result.url,
      },
    ]);
  };

  const onUploadError = (err) => {
    setIsLoading(false);
    toast.error('Failed to upload image.');
    console.error('ImageKit upload error:', err);
  };

  const onUploadProgress = (progressEvent) => {
    const { loaded, total } = progressEvent;
    const percent = Math.round((loaded / total) * 100);
    const fileName = progressEvent?.config?.data?.file?.name || 'file';
    setUploadProgress((prev) => ({
      ...prev,
      [fileName]: percent,
    }));
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

  // --- FORM SUBMIT ---
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return null;

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsLoading(true);
    setListingProgress(10);

    try {
      const imageUrls = images.map((img) => img.url);

      const { data } = await axios.post(
        '/api/owner/add-listing',
        { ...listing, images: imageUrls },
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
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
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- AMENITIES OPTIONS ---
  const internalAmenities = [
    'AC',
    'Heating',
    'Wi-Fi',
    'Bathtub',
    'Dishwasher',
    'Built-in washer',
    'Built-in dryer',
    'Smart home',
    'Balcony',
    'Security systems',
    'CCTV cameras',
    'Intercoms',
  ];

  const externalAmenities = [
    'Parking',
    'Pool',
    'Gym & Fitness center',
    'Social areas',
    'Rooftop gardens',
    'Back garden',
    'Bike parking',
    'Covered parking',
    'Package lockers',
    'Party room',
    'Billiards table',
    'Clubhouse',
    'Spa',
    'Playgrounds',
    'Walking paths',
    'Friendly spaces',
    'Valet trash',
    'Surveillance cameras',
    'Building Wi-Fi',
    'Greenery around the space',
  ];

  const nearbyAmenities = [
    'Gym',
    'Shopping Mall',
    'Public transportation access',
    'Airport',
    'Train',
    'Beach',
    'Parks',
    'Restaurants',
    'Coffee shops',
    'Grocery stores',
    'Schools',
    'Hospitals/Clinics',
    'Banks/ATMs',
    'Movie theaters',
    'Libraries',
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <IKContext
        publicKey="public_GflbYmvPwwTVTeTjdNMkcUAwsiU="
        urlEndpoint="https://ik.imagekit.io/somaway"
        authenticator={authenticator}
      >
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
                className="flex items-center gap-2 border-2 border-blue-400 p-2 rounded-md cursor-pointer"
              >
                <img
                  src={assets.upload_icon}
                  alt="Upload"
                  className="h-14 rounded"
                />
                <p className="text-sm text-gray-800">
                  Upload one or more pictures of your listing (max 20, 10MB each)
                </p>
              </label>

              <IKUpload
                className="hidden"
                id="listing-images"
                folder="/listings"
                onSuccess={onUploadSuccess}
                onError={onUploadError}
                onUploadProgress={onUploadProgress}
                onUploadStart={onUploadStart}
                validateFile={(file) => {
                  const validTypes = ["image/jpeg", "image/png", "image/webp"];
                  if (!validTypes.includes(file.type)) {
                    toast.error("Invalid file type. Only JPG, PNG, WEBP allowed.");
                    return false;
                  }
                  return true;
                }}
                useUniqueFileName={true}
                multiple
              />

              {/* Progress Bars */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Object.entries(uploadProgress).map(([fileName, percent]) => (
                    <div key={fileName} className="w-full">
                      <div className="w-full bg-gray-200 rounded-md overflow-hidden">
                        <div
                          className="bg-blue-500 h-2 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {fileName} ({percent}%)
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Uploaded Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <DraggableImage
                      key={img.id}
                      image={img}
                      index={index}
                      onMove={moveImage}
                      onRemove={handleImageRemove}
                    />
                  ))}
                </div>
              )}
            </div>

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
            <div className="flex flex-col w-full">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. New York, Houston..."
                required
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
                className="px-3 py-2 mt-1 border border-borderColor2 hover:border-blue200 rounded-md outline-none focus:ring focus:ring-blue-400  rounded-md outline-none"
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
      </IKContext>
    </DndProvider>
  );
};

export default AddListing;