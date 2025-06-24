// File: src/components/CustomEdge.jsx
import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, selected }) => {
  const { deleteElements } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const handleDelete = () => {
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <path
        d={`M${sourceX},${sourceY} Q${midX},${sourceY} ${targetX},${targetY}`}
        stroke={selected ? '#3b82f6' : '#10b981'}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        markerEnd="url(#arrow)"
        className="react-flow__edge-path"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {(hovered || selected) && (
        <foreignObject
          width={30}
          height={30}
          x={midX - 15}
          y={midY - 15}
          requiredExtensions="http://www.w3.org/1999/xhtml"
          style={{ overflow: 'visible' }}
        >
          <button
            onClick={handleDelete}
            className="w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow hover:bg-red-700"
            title="Delete edge"
          >
            ✕
          </button>
        </foreignObject>
      )}
    </>
  );
};

export default CustomEdge;
