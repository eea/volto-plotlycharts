import React from 'react';
import { Grid } from 'semantic-ui-react';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const View = (props) => {
  const { data = {} } = props;

  const hasText =
    (data.text?.blocks?.length > 1 && data.text?.blocks) ||
    (data.text?.blocks?.length === 1 && data.text?.blocks?.[0].text);

  const grid = {
    text_column: {
      mobile: 12,
      tablet: 12,
      computer: 4,
    },
    chart_column: {
      mobile: 12,
      tablet: 12,
      computer: hasText ? 8 : 12,
    },
  };

  return (
    <div className="embed-visualization">
      {data.block_title ? <h5>{data.block_title}</h5> : ''}
      <Grid container>
        <Grid.Row>
          {hasText ? (
            <Grid.Column
              mobile={grid.text_column.mobile}
              tablet={grid.text_column.tablet}
              computer={grid.text_column.computer}
            >
              <div className="text-content">
                <ViewText data={data} {...props} />
              </div>
            </Grid.Column>
          ) : (
            ''
          )}
          <Grid.Column
            mobile={grid.chart_column.mobile}
            tablet={grid.chart_column.tablet}
            computer={grid.chart_column.computer}
          >
            <ConnectedChart
              data={{
                chartSources: data.chartSources,
                data_query: data.data_query,
                download_button: data.download_button,
                has_data_query_by_context: data.has_data_query_by_context,
                has_data_query_by_provider: data.has_data_query_by_provider,
                use_live_data: data.use_live_data,
                vis_url: data.vis_url,
                with_sources: data.with_sources,
              }}
              hoverFormatXY={data.hover_format_xy}
              withSources={true}
              width={data.width}
              height={data.height}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default View;