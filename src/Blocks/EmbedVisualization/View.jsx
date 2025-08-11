import React from 'react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';
import {
  generateCSVForDataset,
  generateOriginalCSV,
} from '@eeacms/volto-plotlycharts/Utils/utils';

function EmbedData(props) {
  console.log(props);
  const { provider_metadata } = props; // reactChartEditorLib,
  const { dataSources = {} } = props.data?.visualization || {};
  const url_source = 'https://example.com';
  const {
    data_provenance,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = props.data?.properties || {};

  const core_metadata = {
    data_provenance: data_provenance?.data,
    other_organisations,
    temporal_coverage: temporal_coverage?.temporal,
    publisher,
    geo_coverage: geo_coverage?.geolocation,
  };

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
  console.log({ completeCSVData });
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
      <WithChartEditorLibEmbedData {...props} />
    </div>
  );
};

export default View;
