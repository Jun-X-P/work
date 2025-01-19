// src/App.tsx
import React from 'react';
import LLMDialog from './component/LLMDialog';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <LLMDialog title="LLM 对话框" />
    </div>
  );
};

export default App;