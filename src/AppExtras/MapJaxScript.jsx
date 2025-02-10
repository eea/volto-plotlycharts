import { useEffect } from 'react';

const MathJaxScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-svg.min.js';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup on unmount
    };
  }, []);

  return null;
};

export default MathJaxScript;
