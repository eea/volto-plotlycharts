import React from 'react';
import cx from 'classnames';
import { Popup } from 'semantic-ui-react';
import { UniversalLink } from '@plone/volto/components';

import './style.css';

const Link = ({ children, ...props }) => {
  if (props.href) {
    return <UniversalLink {...props}>{children}</UniversalLink>;
  }
  return <span {...props}>{children}</span>;
};

const Source = ({ source }) => {
  if (source.chart_source_link && source.chart_source) {
    return <Link href={source.chart_source_link}>{source.chart_source}</Link>;
  }
  if (source.chart_source) {
    return <span>{source.chart_source}</span>;
  }
  return (
    <>
      <Link className="embed-sources-param-title" href={source.link}>
        {source.title}
      </Link>
      ,
      <span className="embed-sources-param-description">
        {source.organisation}
      </span>
    </>
  );
};

const SourcesWidget = ({ sources }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="plotly-sources-container">
      <Popup
        content={
          sources?.length ? (
            <ol className="sources-list">
              {sources?.map((source, index) => {
                return (
                  <li key={index}>
                    <Source source={source} />
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>Data provenance is not set for this visualization.</p>
          )
        }
        position="bottom left"
        popper={{ id: 'plotly-sources-popup' }}
        trigger={
          <button className={cx('plotly-sources-button', { expanded })}>
            Sources
          </button>
        }
        on="click"
        onClose={() => {
          setExpanded(false);
        }}
        onOpen={() => {
          setExpanded(true);
        }}
      />
    </div>
  );
};

export default SourcesWidget;
