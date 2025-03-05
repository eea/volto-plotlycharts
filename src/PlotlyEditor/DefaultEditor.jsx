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
} from 'react-chart-editor';
import Logo from 'react-chart-editor/lib/components/widgets/Logo';

import {
  GraphThemePanel,
  GraphTemplatePanel,
  GraphFilterPanel,
  StyleLayoutPanel,
  ThemeChosePanel,
} from './panels';

const ObjectBrowserButton = withObjectBrowser(
  ({ value, children, location, openObjectBrowser, onChangeValue }) => {
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
  render() {
    const _ = this.context.localize;
    const {
      actions,
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
          <Button variant="primary" label="apply" onClick={onApply} />
        </SingleSidebarItem>
        <SingleSidebarItem>
          <Button variant="secondary" label="close" onClick={onClose} />
        </SingleSidebarItem>
        <SingleSidebarItem className="end">
          <Popup
            disabled={!value.provider_url}
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
            }
            hoverable
          />
        </SingleSidebarItem>
      </PanelMenuWrapper>
    );
  }
}

export default DefaultEditor;
