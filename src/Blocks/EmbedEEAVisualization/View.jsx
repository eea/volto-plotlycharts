import React from 'react';
import ConnectedChart2 from '@eeacms/volto-plotlycharts/ConnectedChart2';

import { StyleWrapperView } from '@eeacms/volto-block-style/StyleWrapper';

import cx from 'classnames';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const View = (props) => {
  const { data = {} } = props;

  return (
    <div className="embed-visualization">
      <StyleWrapperView
        {...props}
        data={data}
        styleData={{
          ...data.styles,
          customClass: cx(
            data.styles?.customClass || '',
            'columns-tabs-container',
          ),
        }}
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
            with_sources: data.show_sources,
            include_sources_download: data?.include_sources_download,
            include_other_org_download: data?.include_other_org_download,
            include_temporal_coverage_download:
              data?.include_temporal_coverage_download,
          }}
          hoverFormatXY={data.hover_format_xy}
          withSources={data.show_sources}
          width={data.width}
          height={data.height}
        />
      </StyleWrapperView>
    </div>
  );
};

export default View;
