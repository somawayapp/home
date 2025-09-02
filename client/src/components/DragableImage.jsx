import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  IMAGE: 'image',
};

const DraggableImage = ({ image, index, onMove, onRemove }) => {
  if (!image) return null;

  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: { id: image.id || image.name || `temp-${index}`, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        onMove(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative border-2 border-blue-400 rounded-md cursor-grab ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={image.url}
        alt={image.name || `preview-${index}`}
        className="h-20 w-full object-cover rounded-md"
      />
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
