import React, { useCallback, useEffect, useRef, useState } from 'react';
import qs from 'query-string';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import loadable from '@loadable/component';

const withLoadOnVisibility = (loadComponent) => {
  return (props) => {
    const { onPrintStatusChange: notifyPrintStatus } = props;
    const location = useLocation();
    const queryParams = qs.parse(location?.search);
    const isPrint = useSelector((state) => state.print?.isPrint || false);
    // Mount regardless of viewport position when the visibility sensor is
    // disabled via ?visibility_sensor=off or when is prepared for print view.
    const forceVisible = isPrint || queryParams?.visibility_sensor === 'off';

    const [isVisible, setIsVisible] = useState(forceVisible);
    const [DynamicComponent, setDynamicComponent] = useState(null);
    const [printStatus, setPrintStatus] = useState('loading');
    const ref = useRef(null);

    const onPrintStatusChange = useCallback(
      (status) => {
        setPrintStatus(status);
        notifyPrintStatus?.(status);
      },
      [notifyPrintStatus],
    );

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
      <div
        ref={ref}
        data-print-block="plotly"
        data-print-block-id={props.block || props.id}
        data-print-status={printStatus}
      >
        {isVisible && DynamicComponent ? (
          <DynamicComponent
            {...props}
            onPrintStatusChange={onPrintStatusChange}
          />
        ) : null}
      </div>
    );
  };
};

export default withLoadOnVisibility;
