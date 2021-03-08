import { useState, useLayoutEffect } from 'react';

const useMarginCalculator = () => {
  const calculateMargins = () => {
    const view = document.getElementById('view');
    const viewWidth = __CLIENT__ && view ? view.offsetWidth : undefined;
    const grid = document.querySelector('#view #page-document');
    const gridWidth = __CLIENT__ && grid ? grid.offsetWidth : undefined;
    return (viewWidth - gridWidth) / 2;
  };

  const [margins, setMargins] = useState(0);

  useLayoutEffect(() => {
    if (!__CLIENT__) {
      return false;
    }
    setMargins(calculateMargins());
    function handleResize() {
      setMargins(calculateMargins());
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return margins;
};

export default useMarginCalculator;
