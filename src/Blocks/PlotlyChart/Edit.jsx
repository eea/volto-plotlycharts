import React, { useEffect, useState, Component } from 'react';
import cx from 'classnames';
import { Button, Modal } from 'semantic-ui-react';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
// import PlotlyEditor from '@eeacms/volto-plotlycharts/PlotlyEditor';

import schema from './schema';
import View from './View';

const PlotlyEditorModal = (props) => {
  const [value, setValue] = useState(props.value);
  const [fadeInOut, setFadeInOut] = useState(true);
  // const [showImportJSON, setShowImportJSON] = useState(false);

  function onClose() {
    setFadeInOut(true);
    setTimeout(() => {
      props.onClose();
    }, 300);
  }

  useEffect(() => {
    setFadeInOut(false);
  }, []);

  return (
    <>
      <Modal
        open={true}
        size="fullscreen"
        className={cx('chart-editor-modal plotly-editor--theme-provider', {
          'fade-in-out': fadeInOut,
        })}
      >
        <Modal.Content scrolling>
          {/* <PlotlyEditor
            actions={[
              {
                variant: 'primary',
                // onClick: () => setShowImportJSON(true),
                children: 'DEV',
              },
            ]}
            value={value}
            onChangeValue={(value) => {
              setValue(value);
            }}
            onApply={() => {
              props.onChange(props.id, value);
              onClose();
            }}
            onClose={onClose}
          /> */}
        </Modal.Content>
      </Modal>
      {/* {showImportJSON && (
        <PlotlyJsonModal
          value={value}
          onChange={setValue}
          onClose={() => setShowImportJSON(false)}
        />
      )} */}
    </>
  );
};

class Edit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPlotlyEditor: false,
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      visualization: value,
    });
  }

  render() {
    const { block, data = {} } = this.props;
    const { visualization = {} } = data;

    if (__SERVER__) return '';

    return (
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="wrapper">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.setState({ showPlotlyEditor: true });
            }}
          >
            Open Chart Editor
          </Button>
        </div>
        <View {...this.props} mode="edit" />
        {this.state.showPlotlyEditor && (
          <PlotlyEditorModal
            value={visualization}
            onChange={this.onChange}
            onClose={() =>
              this.setState({
                showPlotlyEditor: false,
              })
            }
          />
        )}
        <SidebarPortal selected={this.props.selected}>
          <BlockDataForm
            block={block}
            title={schema.title}
            schema={schema}
            onChangeBlock={this.props.onChangeBlock}
            onChangeField={(id, value) => {
              this.props.onChangeBlock(this.props.block, {
                ...data,
                [id]: value,
              });
            }}
            formData={data}
          />
        </SidebarPortal>
      </div>
    );
  }
}

export default Edit;
