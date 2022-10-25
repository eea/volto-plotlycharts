import React from 'react';
import { UniversalLink, Icon } from '@plone/volto/components';

import rightKeySVG from '@plone/volto/icons/right-key.svg';
import downKeySVG from '@plone/volto/icons/down-key.svg';

const SourcesWidget = ({ data }) => {
  const [expand, setExpand] = React.useState(true);

  return (
    <div>
      <button className="legend-action" onClick={() => setExpand(!expand)}>
        <h3>
          <Icon
            name={expand ? downKeySVG : rightKeySVG}
            title={expand ? 'Collapse' : 'Expand'}
            size="17px"
          />
          Sources:
        </h3>
      </button>
      {expand && (
        <ul>
          {data.map((param, i) => (
            <li key={i}>
              <div className="map_source_param_container">
                <UniversalLink className="map_source_title" href={param.link}>
                  {param.title}
                </UniversalLink>
                ,
                <span className="map_source_description">
                  {param.organisation}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SourcesWidget;
