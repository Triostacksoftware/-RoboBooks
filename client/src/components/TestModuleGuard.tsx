"use client";

import React from 'react';

interface TestModuleGuardProps {
  moduleName: string;
  children: React.ReactNode;
}

const TestModuleGuard: React.FC<TestModuleGuardProps> = ({ moduleName, children }) => {
  console.log('🧪 TEST GUARD: Component rendered for module:', moduleName);
  
  return (
    <div>
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'red', 
        color: 'white', 
        padding: '10px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        🧪 TEST GUARD ACTIVE: {moduleName}
      </div>
      {children}
    </div>
  );
};

export default TestModuleGuard;
