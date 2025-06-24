import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import DnDFlow from './components/DndFLow';

const App = () => {
  return (
    <ReactFlowProvider>
      <DnDFlow />
    </ReactFlowProvider>
  );
};

export default App;
