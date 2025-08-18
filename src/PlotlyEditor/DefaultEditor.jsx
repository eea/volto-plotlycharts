import cx from 'classnames';
import { Popup } from 'semantic-ui-react';
import { UniversalLink } from '@plone/volto/components';
import withObjectBrowser from '@plone/volto/components/manage/Sidebar/ObjectBrowser';
import {
  DefaultEditor as PlotlyDefaultEditor,
  Button,
  SingleSidebarItem,
  PanelMenuWrapper,
  // Panels
  GraphCreatePanel,
  GraphTransformsPanel,
  GraphSubplotsPanel,
  StyleAxesPanel,
  StyleMapsPanel,
  StyleLegendPanel,
  StyleNotesPanel,
  StyleShapesPanel,
  StyleSlidersPanel,
  StyleImagesPanel,
  StyleTracesPanel,
  StyleColorbarsPanel,
  StyleUpdateMenusPanel,
} from '@eeacms/react-chart-editor';
import Logo from '@eeacms/react-chart-editor/lib/components/widgets/Logo';

import JsonEditor from '@eeacms/volto-plotlycharts/Utils/JsonEditor';
import { getPlotlyDataSources } from '@eeacms/volto-plotlycharts/helpers/plotly';

import {
  GraphThemePanel,
  GraphTemplatePanel,
  GraphFilterPanel,
  StyleLayoutPanel,
  ThemeChosePanel,
} from './panels';

const ObjectBrowserButton = withObjectBrowser(
  ({ value, children, openObjectBrowser, onChangeValue }) => {
    return (
      <Button
        variant="link"
        onClick={() => {
          openObjectBrowser({
            mode: 'link',
            overlay: true,
            onSelectItem: (provider_url) => {
              onChangeValue({
                ...value,
                provider_url,
              });
            },
            currentPath: value.provider_url,
          });
        }}
      >
        {children}
      </Button>
    );
  },
);

class DefaultEditor extends PlotlyDefaultEditor {
  constructor(props, context) {
    super(props, context);
    this.state = {
      autoSource: true,
      showImportJSON: false,
    };
  }

  render() {
    const _ = this.context.localize;
    const {
      actions,
      editor,
      value,
      connectorLoaded,
      connectorLoading,
      location,
      onChangeValue,
    } = this.context.ctx;
    const { logoSrc, logoLinkUrl, menuPanelOrder, children, onApply, onClose } =
      this.props;
    const logo = logoSrc && <Logo src={logoSrc} link={logoLinkUrl} />;

    return (
      <PanelMenuWrapper menuPanelOrder={menuPanelOrder}>
        {logo || null}
        {this.props.isTheme && (
          <GraphThemePanel group={_('Structure')} name={_('Template')} />
        )}
        {this.props.isTemplate && (
          <GraphTemplatePanel group={_('Structure')} name={_('Template')} />
        )}
        {!this.props.isTheme && (
          <GraphCreatePanel group={_('Structure')} name={_('Traces')} />
        )}
        {!this.props.isTheme && (
          <GraphSubplotsPanel group={_('Structure')} name={_('Subplots')} />
        )}
        {!this.props.isTheme && this.hasTransforms() && (
          <GraphTransformsPanel group={_('Structure')} name={_('Transforms')} />
        )}
        {!this.props.isTheme && (
          <GraphFilterPanel group={_('Structure')} name={_('Filters')} />
        )}
        {!this.props.isTheme && (
          <ThemeChosePanel group={_('Theme')} name={_('Chose')} />
        )}
        <StyleLayoutPanel group={_('Style')} name={_('General')} />
        {!this.props.isTheme && (
          <StyleTracesPanel group={_('Style')} name={_('Traces')} />
        )}
        {this.hasAxes() && (
          <StyleAxesPanel group={_('Style')} name={_('Axes')} />
        )}
        {this.hasMaps() && (
          <StyleMapsPanel group={_('Style')} name={_('Maps')} />
        )}
        {(this.hasLegend() || this.props.isTheme) && (
          <StyleLegendPanel group={_('Style')} name={_('Legend')} />
        )}
        {this.hasColorbars() && (
          <StyleColorbarsPanel group={_('Style')} name={_('Color Bars')} />
        )}
        <StyleNotesPanel group={_('Annotate')} name={_('Text')} />
        <StyleShapesPanel group={_('Annotate')} name={_('Shapes')} />
        <StyleImagesPanel group={_('Annotate')} name={_('Images')} />
        {this.hasSliders() && (
          <StyleSlidersPanel group={_('Control')} name={_('Sliders')} />
        )}
        {this.hasMenus() && (
          <StyleUpdateMenusPanel group={_('Control')} name={_('Menus')} />
        )}
        {children || null}
        {/* Actions */}
        {actions?.map((action, i) => (
          <SingleSidebarItem key={i}>
            <Button {...action} />
          </SingleSidebarItem>
        ))}
        <SingleSidebarItem>
          <Button
            variant="primary"
            label="JSON"
            onClick={() => this.setState({ showImportJSON: true })}
          />
        </SingleSidebarItem>
        <SingleSidebarItem>
          <Button variant="primary" label="apply" onClick={onApply} />
        </SingleSidebarItem>
        <SingleSidebarItem>
          <Button variant="secondary" label="close" onClick={onClose} />
        </SingleSidebarItem>
        {this.state.showImportJSON && (
          <SingleSidebarItem>
            <JsonEditor
              initialValue={{
                data: value.data,
                layout: value.layout,
              }}
              options={{
                mode: 'tree',
                // schema: {
                //   type: 'object',
                //   properties: {
                //     data: {
                //       type: 'array',
                //     },
                //     layout: {
                //       type: 'object',
                //     },
                //     frames: {
                //       type: 'array',
                //     },
                //   },
                //   required: ['data', 'layout'],
                //   additionalProperties: false,
                // },
              }}
              menu={
                <span style={{ display: 'inline-block', margin: '8px 20px' }}>
                  <input
                    type="checkbox"
                    id="auto-source"
                    name="auto-source"
                    style={{
                      marginRight: '0.5rem',
                      accentColor: '#00FF00',
                    }}
                    checked={this.state.autoSource}
                    onChange={(e) => {
                      this.setState({ autoSource: e.target.checked });
                    }}
                  />
                  <label for="auto-source">
                    Automatically extract data sources
                  </label>
                </span>
              }
              onChange={(v) => {
                const newValue = {
                  ...value,
                  ...v,
                };

                if (!this.state.autoSource) {
                  onChangeValue({ ...newValue });
                } else {
                  const [dataSources, update] = getPlotlyDataSources({
                    data: newValue.data,
                    layout: newValue.layout,
                    originalDataSources: value.dataSources,
                  });

                  onChangeValue({ ...newValue, dataSources });
                  editor().loadDataSources(dataSources, [], update);
                }
              }}
              onClose={() => this.setState({ showImportJSON: false })}
            />
          </SingleSidebarItem>
        )}
        <SingleSidebarItem className="end">
          <Popup
            disabled={!connectorLoaded}
            className="editor_controls"
            content={
              <>
                <p>
                  Current connector is:{' '}
                  <UniversalLink href={value.provider_url} target="_blank">
                    {value.provider_url}
                  </UniversalLink>
                  <br />
                  Click{' '}
                  <span
                    role="button"
                    tabIndex={0}
                    className="action"
                    onKeyDown={() => {}}
                    onClick={() => {
                      onChangeValue({
                        ...value,
                        provider_url: null,
                      });
                    }}
                    style={{
                      textDecoration: 'underline',
                    }}
                  >
                    here
                  </span>{' '}
                  to remove it!
                </p>
              </>
            }
            trigger={
              <div>
                <ObjectBrowserButton
                  value={value}
                  location={location}
                  onChangeValue={onChangeValue}
                >
                  <span
                    className={cx({
                      'loading-dot': !!value.provider_url && connectorLoading,
                      'connected-dot': !!value.provider_url && connectorLoaded,
                      'disconnected-dot': !value.provider_url,
                    })}
                  />{' '}
                  {connectorLoading && 'Loading...'}
                  {connectorLoaded && 'Connected'}
                  {!value.provider_url && 'Connector'}
                </ObjectBrowserButton>
              </div>
            }
            hoverable
          />
        </SingleSidebarItem>
      </PanelMenuWrapper>
    );
  }
}

export default DefaultEditor;
