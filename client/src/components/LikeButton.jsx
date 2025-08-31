// components/LikeButton.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const LikeButton = ({ carId }) => {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState(""); // ✅ Message state

  // Check if liked when component mounts
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await axios.get(`/api/user/checkifliked?carId=${carId}`);
        if (res.data.success) setLiked(res.data.liked);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLikeStatus();
  }, [carId]);

  const handleToggleLike = async () => {
    if (loading) return;
    setLoading(true);

    const newLikedState = !liked;
    setLiked(newLikedState);
    setAnimating(true);

    try {
      const res = await axios.post("/api/user/togglelike", { carId });

      if (res.data.success) {
        setLiked(res.data.liked);
        // ✅ Show message when liked/unliked
        setMessage(res.data.liked ? "Added to favourites ❤️" : "Removed from favourites 💔");

        // Auto-hide message after 2 seconds
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.log(error);
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
      >
        <AiOutlineHeart
          size={28}
          className="text-gray-50 absolute -top-[2px] -right-[2px]"
        />
        <AiFillHeart
          size={24}
          className={liked ? "fill-red-500" : "fill-neutral-500/70"}
        />
      </button>

      {/* ✅ Feedback Message */}
      {message && (
        <span className="mt-1 text-xs text-white bg-gray-900 px-2 py-1 rounded-md shadow-md animate-fade-in">
          {message}
        </span>
      )}
    </div>
  );
};

export default LikeButton;
