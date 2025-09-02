// src/components/owner/DraggableImage.jsx
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  IMAGE: 'image',
};

const DraggableImage = ({ image, index, onMove, onRemove }) => {
  if (!image) return null; // avoid breaking if image is missing

  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: { id: image.id || image.name || `temp-${index}`, index }, 
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // drop hook needs to be defined before combining
  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        onMove(draggedItem.index, index);
        draggedItem.index = index; // update so it doesn’t keep re-firing
      }
    },
  });

  drag(drop(ref));

  const src = image.url
    ? image.url
    : image instanceof File
      ? URL.createObjectURL(image)
      : '';

  return (
    <div
      ref={ref}
      className={`relative border-2 border-blue-400 rounded-md cursor-grab ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {src && (
        <img
          src={src}
          alt={image.name || `preview-${index}`}
          className="h-20 w-full object-cover rounded-md"
        />
      )}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 cursor-pointer bg-red-500 text-white rounded-full px-2 py-1 text-xs"
      >
        X
      </button>
    </div>
  );
};




export default DraggableImage;