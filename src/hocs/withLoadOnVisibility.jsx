import React, { useState, useEffect, useRef } from 'react';
import qs from 'query-string';
import { useLocation } from 'react-router-dom';
import loadable from '@loadable/component';

const withLoadOnVisibility = (loadComponent) => {
  return (props) => {
    const location = useLocation();
    const queryParams = qs.parse(location?.search);
    // Mount regardless of viewport position when the visibility sensor is
    // disabled via ?visibility_sensor=off, so charts render for indexing
    // without needing to be scrolled into view.
    const forceVisible = queryParams?.visibility_sensor === 'off';

    const [isVisible, setIsVisible] = useState(forceVisible);
    const [DynamicComponent, setDynamicComponent] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
      if (forceVisible) {
        setIsVisible(true);
        return;
      }

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
    }, [forceVisible]);

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
