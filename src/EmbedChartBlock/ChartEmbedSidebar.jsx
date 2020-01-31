import React from 'react';

import { Button } from 'semantic-ui-react';
import { TextWidget } from '@plone/volto/components';
import { Field, SidebarPortal } from '@plone/volto/components'; // EditBlock
import { Segment } from 'semantic-ui-react';
import MultiValuesEdit from 'volto-datablocks/DataConnectedBlock/MultiValuesEdit';

import PickVisualization from '../PickVisualization';

const ChartEmbedSidebar = ({
  block,
  data,
  onChangeBlock,
  schema,
  selected,
  title,
}) => (
  <SidebarPortal selected={selected}>
    <Segment.Group raised>
      <header className="header pulled">
        <h2>{title || 'Edit chart options'}</h2>
      </header>
      <Segment className="form sidebar-image-data">
        <PickVisualization
          id={`vis-${block}`}
          onLoadChartData={chartData =>
            onChangeBlock(block, {
              ...data,
              chartData,
            })
          }
          currentChartData={data?.chartData}
          onChange={url =>
            onChangeBlock(block, {
              ...data,
              vis_url: url,
            })
          }
          value={data?.vis_url || ''}
        />
        <Field
          title="Hover format"
          id="hover-format"
          type="text"
          value={data.hover_format_xy || ''}
          description={
            <div>
              See{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/d3/d3-3.x-api-reference/blob/master/Formatting.md#d3_format"
              >
                d3 format documentation
              </a>
            </div>
          }
          required={false}
          onChange={(e, d) =>
            onChangeBlock(block, {
              ...data,
              hover_format_xy: d,
            })
          }
        />
        <Field
          title="Source"
          id="chart-source"
          type="text"
          value={data.chart_source || ''}
          required={false}
          onChange={(e, d) =>
            onChangeBlock(block, {
              ...data,
              chart_source: d,
            })
          }
        />
        <Field
          title="Source Link"
          id="chart-source-link"
          type="text"
          value={data.chart_source_link || ''}
          required={false}
          onChange={(e, d) =>
            onChangeBlock(block, {
              ...data,
              chart_source_link: d,
            })
          }
        />
        {data.chartSources && data.chartSources.length
          ? data.chartSources.map((item, index) => (
              <React.Fragment>
                <TextWidget
                  title="Source"
                  id={`chart-source_${index}`}
                  type="text"
                  value={item.chart_source}
                  required={false}
                  onChange={(e, d) => {
                    const dataClone = JSON.parse(
                      JSON.stringify(data.chartSources),
                    );
                    dataClone[index].chart_source = d;
                    onChangeBlock(block, {
                      ...data,
                      chartSources: dataClone,
                    });
                  }}
                />
                <TextWidget
                  title="Source Link"
                  id={`chart-source_link_${index}`}
                  type="text"
                  value={item.chart_source_link}
                  required={false}
                  onChange={(e, d) => {
                    const dataClone = JSON.parse(
                      JSON.stringify(data.chartSources),
                    );
                    dataClone[index].chart_source_link = d;
                    onChangeBlock(block, {
                      ...data,
                      chartSources: dataClone,
                    });
                  }}
                />
              </React.Fragment>
            ))
          : ''}
        <Button
          primary
          onClick={() => {
            const chartSources =
              data.chartSources && data.chartSources.length
                ? JSON.parse(JSON.stringify(data.chartSources))
                : [];
            chartSources.push({
              chart_source_link: '',
              chart_source: '',
            });
            onChangeBlock(block, {
              ...data,
              chartSources: chartSources,
            });
          }}
        >
          Add source
        </Button>
        <MultiValuesEdit
          schema={schema || {}}
          onChange={data => onChangeBlock(block, data)}
          data={data}
        />
      </Segment>
    </Segment.Group>
  </SidebarPortal>
);

export default ChartEmbedSidebar;
