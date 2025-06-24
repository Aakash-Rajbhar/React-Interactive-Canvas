import { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

// Custom Block Component with delete functionality
const CustomBlock = ({ data, isConnectable, selected }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const { deleteElements } = useReactFlow();

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };

  const handleDelete = () => {
    try {
      deleteElements({ nodes: [{ id: data.nodeId }] });
      setShowContextMenu(false);
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  return (
    <>
      <div
        className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 relative transition-all duration-200 ${
          data.type === 'blockA'
            ? 'border-green-500 bg-green-50'
            : 'border-yellow-500 bg-yellow-50'
        } ${selected ? 'ring-2 ring-blue-400 ring-opacity-75' : ''}`}
        onContextMenu={handleContextMenu}
        style={{ minWidth: '100px', textAlign: 'center' }}
      >
        {/* Delete button (visible when selected) */}
        {selected && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center font-bold z-10"
            title="Delete block"
          >
            ✕
          </button>
        )}

        {/* Source handle - only for Block A */}
        {data.type === 'blockA' && (
          <Handle
            type="source"
            position={Position.Right}
            id="source"
            isConnectable={isConnectable}
            className="w-3 h-3 !bg-green-600 !border-2 !border-white hover:!bg-green-700 transition-colors"
            style={{ right: -6 }}
          />
        )}

        {/* Target handle - only for Block B */}
        {data.type === 'blockB' && (
          <Handle
            type="target"
            position={Position.Left}
            id="target"
            isConnectable={isConnectable}
            className="w-3 h-3 !bg-yellow-600 !border-2 !border-white hover:!bg-yellow-700 transition-colors"
            style={{ left: -6 }}
          />
        )}

        <div className="font-semibold text-sm text-gray-800">{data.label}</div>
        <div className="text-xs text-gray-500 mt-1">
          {data.type === 'blockA' ? 'Source' : 'Target'}
        </div>
      </div>

      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseContextMenu}
          />
          <div
            className="fixed bg-white border border-gray-300 rounded-lg shadow-xl z-50 py-1 min-w-36"
            style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          >
            <div
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-700"
              onClick={handleCloseContextMenu}
            >
              Hello World
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CustomBlock;
