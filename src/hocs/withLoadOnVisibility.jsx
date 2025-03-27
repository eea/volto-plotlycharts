import React, { useState, useEffect, useRef } from 'react';
import loadable from '@loadable/component';

const withLoadOnVisibility = (loadComponent) => {
  return (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const [DynamicComponent, setDynamicComponent] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 },
      );

      const currentElement = ref.current;
      if (currentElement) {
        observer.observe(currentElement);
      }

      return () => {
        if (currentElement) {
          observer.unobserve(currentElement);
        }
      };
    }, []);

    useEffect(() => {
      if (isVisible && !DynamicComponent) {
        setDynamicComponent(() => loadable(loadComponent));
      }
    }, [isVisible, DynamicComponent]);

    return (
      <div ref={ref}>
        {isVisible && DynamicComponent ? <DynamicComponent {...props} /> : null}
      </div>
    );
  };
};

export default withLoadOnVisibility;
