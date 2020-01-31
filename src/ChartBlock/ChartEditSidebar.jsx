import React from 'react';
import { Segment } from 'semantic-ui-react'; // , Dropdown
import { Field, SidebarPortal, TextWidget } from '@plone/volto/components';
import PickProvider from 'volto-datablocks/PickProvider';
import { AlignBlock } from '@plone/volto/helpers';
import { Form, Grid } from 'semantic-ui-react';
import { SourceEdit } from 'volto-datablocks/Sources';

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
        <Form.Field inline required={false}>
          <Grid>
            <Grid.Row>
              <Grid.Column width="4">
                <div className="wrapper">
                  <label htmlFor="field-align">Alignment</label>
                </div>
              </Grid.Column>
              <Grid.Column width="8" className="align-tools">
                <AlignBlock
                  align={data.align}
                  onChangeBlock={onChangeBlock}
                  data={data}
                  block={block}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form.Field>

        <SourceEdit data={data} onChangeBlock={onChangeBlock} block={block} />
      </Segment>
    </Segment.Group>
  </SidebarPortal>
);

export default ChartEditSidebar;
