import React from 'react';
import CustomColorPicker from './CustomColorPicker';
import { Icon } from '@plone/volto/components';
import deleteSVG from '@plone/volto/icons/delete.svg';
import upIcon from '@plone/volto/icons/up-key.svg';
import downIcon from '@plone/volto/icons/down-key.svg';
import addIcon from '@plone/volto/icons/add.svg';
import { Colorscale } from 'react-colorscales';
import { PlotlySection } from 'react-chart-editor';

//a similar colorscale editor but withouth the values, only colors

const ColorscaleColorsEditor = ({ colorscale, _, handleChange }) => {
  const [expand, setExpand] = React.useState(false);

  const handleColorChange = (color, index) => {
    const newColorscale = [...colorscale];
    newColorscale[index] = color;

    handleChange(newColorscale);
  };

  const handleDeleteColor = (colorscale, index) => {
    const newColorscale = [
      ...colorscale.slice(0, index),
      ...colorscale.slice(index + 1),
    ];
    handleChange(newColorscale);
  };

  const handleAddColor = (colorscale) => {
    const newColorscale = [...colorscale, 'black'];

    handleChange(newColorscale);
  };

  return (
    <PlotlySection name={_('Customize Colors')}>
      <div className="field field__colorscale colorscale-container">
        <p
          style={{
            width: '70px',
            fontSize: '12px',
            color: '#506784',
            marginLeft: '1em',
          }}
        >
          Active Colorscale
        </p>
        <div
          style={{
            width: '180px',
            'margin-left': '12px',
          }}
        >
          <Colorscale colorscale={colorscale} />
          <div className="colors-edit-container">
            <button
              className="color-expand-button"
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() => setExpand(!expand)}
            >
              {!expand && (
                <Icon className="color-open-icon" name={upIcon} size="20px" />
              )}
              {expand && (
                <Icon
                  className="color-close-icon"
                  name={downIcon}
                  size="20px"
                />
              )}
              {!expand ? 'Edit colors' : 'Close'}
            </button>

            {expand && (
              <React.Fragment>
                {colorscale &&
                  colorscale.length > 0 &&
                  colorscale.map((item, index) => (
                    <div
                      style={{ position: 'relative', margin: '5px 0' }}
                      key={index}
                    >
                      <CustomColorPicker
                        selectedColor={item}
                        onColorChange={(color) =>
                          handleColorChange(color, index)
                        }
                      />
                      {colorscale.length > 2 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon
                            onClick={() => handleDeleteColor(colorscale, index)}
                            name={deleteSVG}
                            size="24px"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                <div className="color-buttons-container">
                  <button
                    style={{ display: 'flex', alignItems: 'center' }}
                    className="color-add-button"
                    title="Add new color"
                    onClick={() => handleAddColor(colorscale)}
                  >
                    <Icon
                      className="color-add-icon"
                      name={addIcon}
                      size="18px"
                    />
                    Add
                  </button>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </PlotlySection>
  );
};

export default ColorscaleColorsEditor;
