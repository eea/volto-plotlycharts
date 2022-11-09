/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { UniversalLink, Icon } from '@plone/volto/components';

import rightKeySVG from '@plone/volto/icons/right-key.svg';
import downKeySVG from '@plone/volto/icons/down-key.svg';

import './style.css';

const SourcesWidget = ({ data }) => {
  const [expand, setExpand] = React.useState(true);

  return (
    <div>
      <a className="embed-sources-header" onClick={() => setExpand(!expand)}>
        <h3>
          <Icon
            name={expand ? downKeySVG : rightKeySVG}
            title={expand ? 'Collapse' : 'Expand'}
            size="17px"
          />
          Sources:
        </h3>
      </a>
      {expand && (
        <ul>
          {data.map((param, i) => (
            <li key={i} className="embed-source-param">
              <UniversalLink
                className="embed-sources-param-title"
                href={param.link}
              >
                {param.title}
              </UniversalLink>
              ,
              <span className="embed-sources-param-description">
                {param.organisation}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SourcesWidget;
