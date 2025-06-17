import React from 'react';

const FakeComponent = ({ label, backgroundColor }) => {
  return (
    <div
      style={{
        backgroundColor,
        padding: '1rem',
        borderRadius: '8px',
        color: '#fff',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
};

export default FakeComponent;
