// components/LikeButton.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast"; // ✅ For notifications
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const LikeButton = ({ carId }) => {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  // ✅ Check if liked when component mounts
 useEffect(() => {
  const fetchLikeStatus = async () => {
    try {
      const res = await axios.get(`/api/user/checkifliked?carId=${carId}`);
      if (res.data.success) setLiked(res.data.liked);
    } catch (error) {
      if (error.response?.status === 401) {
        setLiked(false); // Explicitly set liked state to false if not logged in
      } else {
        console.error("Failed to fetch like status:", error);
      }
    }
  };
  fetchLikeStatus();
}, [carId]);


const handleToggleLike = async () => {
  if (loading) return;
  setLoading(true);

  try {
    const res = await axios.post("/api/user/togglelike", { carId });

    if (res.data.error === "NOT_AUTHENTICATED") {
      toast.error("You must be logged in to like a listing.");
      return;
    }

    if (res.data.success) {
      const newLikedState = res.data.liked;
      setLiked(newLikedState);
      setAnimating(true);
      toast.success(newLikedState ? "Added to favourites ❤️" : "Removed from favourites 💔");
    }
  } catch (error) {
    if (error.response?.status === 401) {
      toast.error("You must be logged in to like a listing.");
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Like Button */}
      <button
        onClick={handleToggleLike}
        className={`relative hover:opacity-80 transition cursor-pointer transition-transform duration-200 hover:scale-105 ${
          animating ? "animate-bounce-heart" : ""
        }`}
        aria-label="Like"
        disabled={loading}
      >
        <AiOutlineHeart
          size={28}
          className="text-gray-50 absolute -top-[2px] -right-[2px]"
        />
        <AiFillHeart
          size={24}
          className={liked ? "fill-red-500" : "fill-neutral-700"}
        />
      </button>
    </div>
  );
};

export default LikeButton;

