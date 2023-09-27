import React, { useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import loadable from '@loadable/component';

const LoadablePlotly = loadable(() => import('react-plotly.js'));

const EnlargeWidget = ({ data, layout, history }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="plotly-enlarge-container">
      <button className="plotly-enlarge-button" onClick={() => setIsOpen(true)}>
        Enlarge
      </button>
      <Modal open={isOpen} className="plotly-enlarge-modal">
        <Modal.Content>
          <LoadablePlotly
            useResizeHandler
            data={data}
            layout={layout}
            frames={[]}
            config={{
              displayModeBar: false,
              editable: false,
              responsive: true,
            }}
            onClick={(trace) => {
              const { customLink, clickmode, meta = [] } = layout;
              // Ex: catalogue?size=n_10_n&filters[0][field]={parent}&filters[0][values][0]={value}&filters[0][type]=any
              // will not redirect on clicking a parent of point (treemap has a zoom feature and usually parents don't have
              // the same significance as children, with relation to filter types)
              if (customLink && clickmode !== 'none') {
                const {
                  id,
                  label,
                  parent,
                  data = {},
                  curveNumber = 0,
                  pointIndex = 0,
                } = trace?.points[0] || {};
                const { type, parents = [], y = [], x = [] } = data;
                const shouldRedirect = type
                  ? type !== 'treemap'
                    ? true
                    : parents.indexOf(id) === -1
                    ? true
                    : false
                  : false;
                const shouldComposeLinks = meta.length > 0;

                if (type === 'bar' && shouldComposeLinks) {
                  if (customLink === 'allLinks') {
                    const yIsLabels = y.indexOf(label) > -1;
                    const labels = yIsLabels
                      ? y.filter((label) => label === 0 || label)
                      : x.filter((label) => label === 0 || label); //trimming
                    const noOfLabels = labels.length;
                    const correspondingLinkPosition =
                      noOfLabels * curveNumber + pointIndex;
                    const correspondingLink = meta[correspondingLinkPosition];

                    history.push(correspondingLink);
                  } else if (customLink === 'fullLinks') {
                    const correspondingLinkPosition = pointIndex;
                    const correspondingLink = meta[correspondingLinkPosition];

                    history.push(correspondingLink);
                  }
                } else if (shouldRedirect) {
                  const link = layout.customLink
                    .replace('{value}', id || label)
                    .replace('{parent}', parent);
                  history.push(link);
                }
              }
            }}
            onHover={(e) => {
              if (layout.customLink && layout.clickmode !== 'none') {
                e.event.target.style.opacity = 0.8;
                e.event.target.style.transition = 'opacity 0.1s ease-in-out';
                e.event.target.style.cursor = 'pointer';
              }
            }}
            onUnhover={(e) => {
              if (layout.customLink && layout.clickmode !== 'none') {
                e.event.target.style.opacity = 1;
                e.event.target.style.cursor = 'default';
              }
            }}
            style={{
              position: 'relative',
              display: 'block',
              ...(!layout.height ? { minHeight: '450px' } : {}),
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          {' '}
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default EnlargeWidget;
