import React from 'react';
import { Grid } from 'semantic-ui-react';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';
import ConnectedChart2 from '@eeacms/volto-plotlycharts/ConnectedChart2';

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
            <ConnectedChart2
              id={props.id}
              data={{
                chartSources: data.chartSources,
                data_query: data.data_query,
                download_button: data.download_button,
                has_data_query_by_context: data.has_data_query_by_context,
                has_data_query_by_provider: data.has_data_query_by_provider,
                use_live_data: true,
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
