import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import ConnectedChart2 from '@eeacms/volto-plotlycharts/ConnectedChart2';
import { connect } from 'react-redux';
import { compose } from 'redux';

import '@eeacms/volto-plotlycharts/less/visualization.less';
import Schema from './schema';

const Edit = (props) => {
  const { data, block, onChangeBlock } = props;
  const schema = React.useMemo(() => Schema(props), [props]);

  React.useEffect(() => {
    if (!Object.hasOwn(data, 'download_button')) {
      onChangeBlock(block, {
        ...data,
        download_button: true,
      });
    }
    if (!Object.hasOwn(data, 'show_sources')) {
      onChangeBlock(block, {
        ...data,
        show_sources: true,
      });
    }
  }, [block, data, onChangeBlock]);
  return (
    <>
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
          include_core_metadata_download: data.include_core_metadata_download,
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

      <SidebarPortal selected={props.selected}>
        <BlockDataForm
          block={block}
          title={schema.title}
          schema={schema}
          onChangeField={(id, value) => {
            props.onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </>
  );
};

export default compose(
  connect(
    (state, props) => ({
      //mapped core metadata data to props. Include more if needed
      temporal_coverage:
        state.content.subrequests?.[props.id]?.data?.temporal_coverage,
      other_organisations:
        state.content.subrequests?.[props.id]?.data?.other_organisations,
      data_provenance:
        state.content.subrequests?.[props.id]?.data?.data_provenance,
    }),
    {},
  ),
  //add extra hoc here
)(Edit);
