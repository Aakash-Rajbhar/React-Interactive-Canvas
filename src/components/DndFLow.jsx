import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import ErrorNotification from './ErrorNotification';
import SuccessNotification from './SuccessNotification';
import { useCallback, useEffect, useRef, useState } from 'react';
import API_BLOCKS_DATA from '../constant';
import CustomBlock from './CustomBlock';
import CustomEdge from './CustomEdge';
import 'reactflow/dist/style.css';

const nodeTypes = {
  customBlock: CustomBlock,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes = [];
const initialEdges = [];

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [blocksData, setBlocksData] = useState([]);
  const [history, setHistory] = useState([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const { project, getNodes, getEdges } = useReactFlow();

  const nodeIdRef = useRef(null);
  const getId = () => `dndnode_${nodeIdRef.current++}`;

  // Simulate API call with error handling
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        // Simulate API delay and potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate 10% chance of API failure for demonstration
            if (Math.random() < 0.9) {
              resolve();
            } else {
              reject(new Error('Failed to fetch blocks from API'));
            }
          }, 500);
        });

        setBlocksData(API_BLOCKS_DATA);
        setSuccessMessage('Blocks loaded successfully');
      } catch (error) {
        console.error('Error fetching blocks:', error);
        setErrorMessage('Failed to load blocks. Using default blocks.');
        // Fallback to default blocks
        setBlocksData(API_BLOCKS_DATA);
      }
    };

    fetchBlocks();
  }, []);

  // Enhanced history management with error handling
  const saveToHistory = useCallback(
    (newNodes, newEdges) => {
      try {
        const newState = {
          nodes: JSON.parse(JSON.stringify(newNodes)),
          edges: JSON.parse(JSON.stringify(newEdges)),
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);

        // Limit history to 50 steps to prevent memory issues
        if (newHistory.length > 50) {
          newHistory.shift();
        } else {
          setHistoryIndex(historyIndex + 1);
        }

        setHistory(newHistory);
      } catch (error) {
        console.error('Error saving to history:', error);
        setErrorMessage('Failed to save state for undo/redo');
      }
    },
    [history, historyIndex]
  );

  // Enhanced undo with error handling
  const undo = useCallback(() => {
    try {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const prevState = history[newIndex];

        if (prevState && prevState.nodes && prevState.edges) {
          setNodes(prevState.nodes);
          setEdges(prevState.edges);
          setHistoryIndex(newIndex);
          setSuccessMessage('Undo successful');
        } else {
          throw new Error('Invalid history state');
        }
      } else {
        setErrorMessage('Nothing to undo');
      }
    } catch (error) {
      console.error('Error during undo:', error);
      setErrorMessage('Undo failed');
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Enhanced redo with error handling
  const redo = useCallback(() => {
    try {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        const nextState = history[newIndex];

        if (nextState && nextState.nodes && nextState.edges) {
          setNodes(nextState.nodes);
          setEdges(nextState.edges);
          setHistoryIndex(newIndex);
          setSuccessMessage('Redo successful');
        } else {
          throw new Error('Invalid history state');
        }
      } else {
        setErrorMessage('Nothing to redo');
      }
    } catch (error) {
      console.error('Error during redo:', error);
      setErrorMessage('Redo failed');
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      try {
        // Undo
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === 'z' &&
          !event.shiftKey
        ) {
          event.preventDefault();
          undo();
        }
        // Redo
        else if (
          ((event.ctrlKey || event.metaKey) &&
            event.shiftKey &&
            event.key === 'Z') ||
          ((event.ctrlKey || event.metaKey) && event.key === 'y')
        ) {
          event.preventDefault();
          redo();
        }
        // Delete selected elements
        else if (event.key === 'Delete' || event.key === 'Backspace') {
          const selectedNodes = getNodes().filter((node) => node.selected);
          const selectedEdges = getEdges().filter((edge) => edge.selected);

          if (selectedNodes.length > 0 || selectedEdges.length > 0) {
            event.preventDefault();
            // This will be handled by React Flow's built-in delete functionality
          }
        }
      } catch (error) {
        console.error('Error handling keyboard shortcut:', error);
        setErrorMessage('Keyboard shortcut failed');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, getNodes, getEdges]);

  // Enhanced connection validation
  const onConnect = useCallback(
    (params) => {
      try {
        setIsConnecting(false);
        setConnectionStatus('');

        const sourceNode = nodes.find((node) => node.id === params.source);
        const targetNode = nodes.find((node) => node.id === params.target);

        // Comprehensive validation
        if (!sourceNode || !targetNode) {
          setErrorMessage(
            'Invalid connection: source or target node not found'
          );
          return;
        }

        if (sourceNode.data.type !== 'blockA') {
          setErrorMessage(
            'Invalid connection: connections must start from Block A'
          );
          return;
        }

        if (targetNode.data.type !== 'blockB') {
          setErrorMessage(
            'Invalid connection: connections must end at Block B'
          );
          return;
        }

        // Check for existing connection
        const existingConnection = edges.find(
          (edge) =>
            edge.source === params.source && edge.target === params.target
        );

        if (existingConnection) {
          setErrorMessage('Connection already exists between these blocks');
          return;
        }

        // Check if target already has a connection (prevent multiple inputs)
        const existingTargetConnection = edges.find(
          (edge) => edge.target === params.target
        );

        if (existingTargetConnection) {
          setErrorMessage('Block B can only have one input connection');
          return;
        }

        // Create valid connection
        const newEdge = {
          ...params,
          id: `edge-${params.source}-${params.target}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
        };

        const newEdges = addEdge(newEdge, edges);
        setEdges(newEdges);
        saveToHistory(nodes, newEdges);
        setSuccessMessage('Connection created successfully');
      } catch (error) {
        console.error('Error creating connection:', error);
        setErrorMessage('Failed to create connection');
      }
    },
    [nodes, edges, setEdges, saveToHistory]
  );

  // Connection start handler for visual feedback
  const onConnectStart = useCallback(() => {
    setIsConnecting(true);
    setConnectionStatus('Drag to Block B to create connection');
  }, []);

  // Connection end handler
  const onConnectEnd = useCallback(() => {
    setIsConnecting(false);
    setConnectionStatus('');
  }, []);

  // Enhanced drag over with validation
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Enhanced drop with comprehensive error handling
  const onDrop = useCallback(
    (event) => {
      try {
        event.preventDefault();

        if (!reactFlowWrapper.current) {
          setErrorMessage('Canvas not ready for drop operation');
          return;
        }

        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        const blockData = blocksData.find((block) => block.type === type);

        if (!type) {
          setErrorMessage('Invalid drag operation: no block type specified');
          return;
        }

        if (!blockData) {
          setErrorMessage(`Invalid block type: ${type}`);
          return;
        }

        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Validate position
        if (position.x < 0 || position.y < 0) {
          setErrorMessage('Invalid drop position');
          return;
        }

        const nodeId = getId();
        const newNode = {
          id: nodeId,
          type: 'customBlock',
          position,
          data: {
            label: blockData.label,
            type: blockData.type,
            nodeId: nodeId,
          },
        };

        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        saveToHistory(newNodes, edges);
        setSuccessMessage(`${blockData.label} added to canvas`);
      } catch (error) {
        console.error('Error during drop operation:', error);
        setErrorMessage('Failed to add block to canvas');
      }
    },
    [project, setNodes, nodes, edges, blocksData, saveToHistory]
  );

  const onDragStart = (event, nodeType) => {
    if (!nodeType) {
      setErrorMessage('Cannot drag: invalid block type');
      return;
    }
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Enhanced node change handler
  const handleNodesChange = useCallback(
    (changes) => {
      try {
        onNodesChange(changes);

        // Save to history for significant changes
        const hasSignificantChange = changes.some(
          (change) =>
            change.type === 'position' ||
            change.type === 'remove' ||
            change.type === 'add'
        );

        if (hasSignificantChange) {
          // Debounce rapid changes
          const timeoutId = setTimeout(() => {
            const currentNodes = getNodes();
            const currentEdges = getEdges();
            saveToHistory(currentNodes, currentEdges);
          }, 300);

          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Error handling node changes:', error);
        setErrorMessage('Error updating nodes');
      }
    },
    [onNodesChange, getNodes, getEdges, saveToHistory]
  );

  // Enhanced edge change handler
  const handleEdgesChange = useCallback(
    (changes) => {
      try {
        onEdgesChange(changes);

        const hasSignificantChange = changes.some(
          (change) => change.type === 'remove' || change.type === 'add'
        );

        if (hasSignificantChange) {
          const timeoutId = setTimeout(() => {
            const currentNodes = getNodes();
            const currentEdges = getEdges();
            saveToHistory(currentNodes, currentEdges);
          }, 100);

          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Error handling edge changes:', error);
        setErrorMessage('Error updating connections');
      }
    },
    [onEdgesChange, getNodes, getEdges, saveToHistory]
  );

  // Clear all elements
  const clearCanvas = useCallback(() => {
    try {
      setNodes([]);
      setEdges([]);
      saveToHistory([], []);
      setSuccessMessage('Canvas cleared');
    } catch (error) {
      console.error('Error clearing canvas:', error);
      setErrorMessage('Failed to clear canvas');
    }
  }, [setNodes, setEdges, saveToHistory]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Error/Success Notifications */}
      {errorMessage && (
        <ErrorNotification
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
      {successMessage && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {/* Connection Status */}
      {isConnecting && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
            <span className="font-medium">{connectionStatus}</span>
          </div>
        </div>
      )}

      {/* Block Panel - Right Side */}
      <aside className="w-64 bg-white border-l border-gray-200 p-4 shadow-lg order-2">
        <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
          Block Panel
        </h3>

        {blocksData.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading blocks...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blocksData.map((block) => (
              <div
                key={block.id}
                className={`p-4 rounded-lg border-2 cursor-move shadow-sm transition-all hover:shadow-md transform hover:scale-105 ${
                  block.type === 'blockA'
                    ? 'bg-green-50 border-green-300 hover:bg-green-100'
                    : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                }`}
                onDragStart={(event) => onDragStart(event, block.type)}
                draggable
                title={`Drag ${block.label} to canvas`}
              >
                <div className="font-semibold text-sm text-center text-gray-800">
                  {block.label}
                </div>
                <div className="text-xs text-center text-gray-500 mt-1">
                  {block.type === 'blockA' ? 'Source Block' : 'Target Block'}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm text-blue-800 mb-2">
            Controls:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Drag blocks to canvas</li>
            <li>• A → B connections only</li>
            <li>• Right-click for context menu</li>
            <li>• Select + Delete key to remove</li>
            <li>• Ctrl+Z: Undo | Ctrl+Y: Redo</li>
          </ul>
        </div>

        {/* Control Buttons */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex-1 px-3 py-2 text-xs font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex-1 px-3 py-2 text-xs font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>

          <button
            onClick={clearCanvas}
            className="w-full px-3 py-2 text-xs font-medium rounded-md border bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
            title="Clear entire canvas"
          >
            🗑️ Clear Canvas
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
          <div className="flex justify-between">
            <span>Blocks:</span>
            <span className="font-medium">{nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Connections:</span>
            <span className="font-medium">{edges.length}</span>
          </div>
          <div className="flex justify-between">
            <span>History:</span>
            <span className="font-medium">
              {historyIndex + 1}/{history.length}
            </span>
          </div>
        </div>
      </aside>

      {/* Canvas Area */}
      <div className="flex-1 order-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-25"
          connectionLineStyle={{
            stroke: '#10b981',
            strokeWidth: 3,
            strokeDasharray: '5,5',
          }}
          connectionLineType="smoothstep"
          deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode={['Meta', 'Ctrl']}
        >
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              switch (node.data.type) {
                case 'blockA':
                  return '#10b981';
                case 'blockB':
                  return '#f59e0b';
                default:
                  return '#6b7280';
              }
            }}
            className="!bg-white !border-gray-300"
          />
          <Background variant="dots" gap={25} size={4} color="#e5e7eb" />
          <Panel position="top-center">
            <div className="bg-white px-6 py-3 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Interactive Canvas
              </h2>
              <p className="text-sm text-gray-600">
                {isConnecting
                  ? '🔗 Creating connection...'
                  : 'Drop blocks and connect A → B'}
              </p>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DnDFlow;
