import React from 'react';

const ContentWrapper = ({ children }) => {
  return (
    <div style={{ paddingLeft: '220px', paddingTop: '20px' }}>
      {children}
    </div>
  );
};

export default ContentWrapper;