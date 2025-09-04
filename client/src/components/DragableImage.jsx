import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { assets } from '../assets/assets'; // Adjust the path if necessary

const ItemTypes = {
    IMAGE: 'image',
};

const DraggableImage = ({ id, url, index, moveImage, deleteImage, uploading, uploadProgress }) => {
    const ref = useRef(null);

    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.IMAGE,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            moveImage(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations, but it's essential here to prevent flickering
            // as it's a performance optimization.
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.IMAGE,
        item: () => {
            return { id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // Combine the drag and drop refs
    drag(drop(ref));

    return (
        <div
            ref={ref}
            className="relative w-full h-32 group"
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'grab' }}
            data-handler-id={handlerId}
        >
            <img
                src={url}
                alt="preview"
                className="w-full h-full object-cover rounded-xl shadow transition-transform duration-300 group-hover:scale-105"
            />
            {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-xl">
                    <p className="text-white text-sm">Uploading...</p>
                    {uploadProgress !== undefined && (
                        <div className="w-2/3 mt-2 bg-gray-300 rounded-full h-1">
                            <div
                                className="bg-blue-500 h-1 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            )}
            {!uploading && (
                <button
                    onClick={() => deleteImage(id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Delete image"
                >
                    <img src={assets.cross_icon} alt="Delete" className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default DraggableImage;