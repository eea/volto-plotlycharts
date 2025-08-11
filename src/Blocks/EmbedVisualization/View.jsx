import React from 'react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';
import { generateCSVForDataset } from '@eeacms/volto-plotlycharts/Utils/utils';

function EmbedData(props) {
  const { reactChartEditorLib } = props;
  const { dataSources } = props.data?.visualization || {};
  const url_source = '';

  const completeCSVData = generateOriginalCSV(
    dataSources,
    provider_metadata,
    url_source,
    core_metadata,
  );

  // const csvData = generateCSVForDataset(
  //   dataSources,
  //   datasetData,
  //   provider_metadata,
  //   core_metadata,
  //   url_source,
  //   reactChartEditorLib,
  // );

  //eslint-disable-next-line no-console
  console.log(csvData);
  return null;
}

const WithChartEditorLibEmbedData = injectLazyLibs(['reactChartEditorLib'])(
  EmbedData,
);

const View = (props) => {
  const { data = {} } = props;

  return (
    <div className="embed-visualization view">
      <PlotlyComponent
        {...props}
        mode={props.mode || 'view'}
        data={{
          ...data,
          download_button: true,
          has_data_query_by_context: data.has_data_query_by_context ?? true,
          with_sources: true,
        }}
      />
      <WithChartEditorLibEmbedData data={data} />
    </div>
  );
};

export default View;
