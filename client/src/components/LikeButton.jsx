
// components/LikeButton.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";



const LikeButton = ({ carId }) => {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Check if liked when component mounts
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await axios.get(`/api/likes/checkiflisted?carId=${carId}`);
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
      const res = await axios.post("/api/likes/togglelike", { carId });
      if (res.data.success) {
        setLiked(res.data.liked);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (

 <button
      onClick={handleToggleLike}
className={`  relative hover:opacity-80 transition cursor-pointer transition-transform duration-200 hover:scale-105 ${
  animating ? "animate-bounce-heart" : ""
}`}
aria-label="Like"
>



<AiOutlineHeart
  size={28}
  className="
    text-gray-50
    absolute
    -top-[2px]
    -right-[2px]
  "
/>
<AiFillHeart
  size={24}
  className={(liked ? "fill-red-500" : "fill-gray-100/20")}
/>
</button>
   
  );
};

export default LikeButton;




