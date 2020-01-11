import React from 'react';
import { Helmet } from '@plone/volto/helpers';
import { Container, Image } from 'semantic-ui-react';
import { settings } from '~/config';
import ConnectedChart from '../ConnectedChart';

const View = ({ content }) => {
  // TODO: explain the need for the /download/file link
  return (
    <Container id="page-visualization">
      <Helmet title={content.title} />
      <h1 className="documentFirstHeading">{content.title}</h1>
      {content.description && (
        <p className="documentDescription">{content.description}</p>
      )}
      {content.image && (
        <Image
          className="document-image"
          src={content.image.scales.thumb.download}
          floated="right"
        />
      )}
      {content.remoteUrl && (
        <span>
          The link address is:
          <a href={content.remoteUrl}>{content.remoteUrl}</a>
        </span>
      )}
      {content.text && (
        <div
          dangerouslySetInnerHTML={{
            __html: content.text.data.replace(
              /a href="([^"]*\.[^"]*)"/g,
              `a href="${settings.apiPath}$1/download/file"`,
            ),
          }}
        />
      )}
      {content.visualization && (
        <div>
          <ConnectedChart
            config={{ displayModeBar: true }}
            data={{ chartData: content.visualization }}
          />
        </div>
      )}
    </Container>
  );
};

export default View;
