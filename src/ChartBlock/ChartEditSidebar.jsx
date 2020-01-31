import React from 'react';
import { Segment } from 'semantic-ui-react'; // , Dropdown
import { Field, SidebarPortal, TextWidget } from '@plone/volto/components';
import { Button } from 'semantic-ui-react';
import PickProvider from 'volto-datablocks/PickProvider';

const ChartEditSidebar = ({ onChangeBlock, block, data }) => (
  <SidebarPortal selected={true}>
    <Segment.Group raised>
      <header className="header pulled">
        <h2>Edit chart options</h2>
      </header>
      <Segment className="form sidebar-image-data">
        <PickProvider
          onChange={url =>
            onChangeBlock(block, {
              ...data,
              url,
            })
          }
          value={data?.url}
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
      </Segment>
    </Segment.Group>
  </SidebarPortal>
);

export default ChartEditSidebar;
