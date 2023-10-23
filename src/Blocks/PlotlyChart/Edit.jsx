import React from 'react';
import { Button } from 'semantic-ui-react'; // , Modal, Grid
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import { PlotlyEditorModal } from '@eeacms/volto-plotlycharts/Widgets/VisualizationWidget';

import schema from './schema';
import ViewPlotyChartBlock from './View';
import { withServerOnly } from '@eeacms/volto-plotlycharts/Utils';

import '@eeacms/volto-plotlycharts/less/plotly.less';

function PlotlyChartBlockEdit(props) {
  const { selected, onChangeBlock, block, data = {} } = props;
  const [showChartEditor, setShowChartEditor] = React.useState(false);
  const { visualization = {} } = data;

  // This is the structure of value
  // value = {
  //   chartData: {
  //     data: data || [],
  //     layout: layout || {},
  //     frames: frames || [],
  //     provider_url: provider_url || undefined
  //   }
  //   provider_url: provider_url
  // }

  const handleModalChange = React.useCallback(
    (value) => {
      onChangeBlock(block, {
        ...data,
        visualization: {
          chartData: {
            ...value.chartData,
            provider_url: value.provider_url,
          },
          provider_url: value.provider_url,
        },
      });
      setShowChartEditor(false);
    },
    [block, onChangeBlock, data],
  );

  return (
    <>
      <div className="wrapper">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowChartEditor(true);
          }}
        >
          Open Chart Editor
        </Button>
      </div>
      <ViewPlotyChartBlock {...props} mode="edit" />
      {showChartEditor && (
        <PlotlyEditorModal
          value={visualization}
          onChange={(changedValue) => handleModalChange(changedValue)}
          onClose={() => setShowChartEditor(false)}
        />
      )}

      <SidebarPortal selected={selected}>
        <BlockDataForm
          block={block}
          title={schema.title}
          schema={schema}
          onChangeBlock={onChangeBlock}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </>
  );
}

export default withServerOnly(PlotlyChartBlockEdit);
