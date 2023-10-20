import React from 'react';
import cx from 'classnames';
import { UniversalLink } from '@plone/volto/components';

const Link = ({ children, ...props }) => {
  if (props.href) {
    return <UniversalLink {...props}>{children}</UniversalLink>;
  }
  return <span {...props}>{children}</span>;
};

const MoreInfoWidget = ({ contentTypeLink }) => {
  return (
    <div className="plotly-more-info-container">
      <Link href={contentTypeLink}>
        <button className={cx('plotly-notes-button')}>More info {'>'}</button>
      </Link>
    </div>
  );
};

export default MoreInfoWidget;
