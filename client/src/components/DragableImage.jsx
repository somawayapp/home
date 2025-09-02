// src/components/owner/DraggableImage.jsx
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  IMAGE: 'image',
};

const DraggableImage = ({ image, index, onMove, onRemove }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: { id: image.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
        src={image.url}   // use optimized URL directly
        alt={image.name}
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