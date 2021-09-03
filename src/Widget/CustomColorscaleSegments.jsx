import React from 'react';

import { PlotlySection } from 'react-chart-editor';

import { Icon } from '@plone/volto/components';
import { Colorscale } from 'react-colorscales';
import CustomColorPicker from './CustomColorPicker';
import deleteSVG from '@plone/volto/icons/delete.svg';

const CustomColorscaleSegments = ({ colorscale, handleChange, _ }) => {
  const onChangeColor = (customColor, index) => {
    const newColorScale = [
      ...colorscale.slice(0, index),
      customColor,
      ...colorscale.slice(index + 1),
    ];

    handleChange(newColorScale);
  };

  const handleDeleteColor = (index) => {
    const newColorScale = [
      ...colorscale.slice(0, index),
      ...colorscale.slice(index + 1),
    ];

    handleChange(newColorScale);
  };

  const handleAddColor = (index) => {
    const newColorScale = [...colorscale, 'black'];

    handleChange(newColorScale);
  };

  return (
    <PlotlySection name={_('Custom Colorscale Segments')}>
      <div className="field field__colorscale colorscale-container">
        <p style={{ width: '70px', fontSize: '12px' }}>Active</p>
        <div
          style={{
            width: '180px',
            'margin-left': '12px',
          }}
        >
          <Colorscale colorscale={colorscale} />
        </div>
      </div>
      {colorscale.length > 0 &&
        colorscale.map((c, i) => (
          <div className="field field__colorscale colorscale-container">
            <p style={{ width: '70px', fontSize: '12px' }}>Color #{i}</p>
            <div style={{ marginLeft: '10px', position: 'relative' }}>
              <CustomColorPicker
                key={i}
                selectedColor={c}
                onColorChange={(selectedColor) =>
                  onChangeColor(selectedColor, i)
                }
              />
              {colorscale.length > 1 && (
                <Icon
                  onClick={() => handleDeleteColor(i)}
                  className="delete-icon"
                  name={deleteSVG}
                  size="24px"
                />
              )}
            </div>
          </div>
        ))}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="button-add-color" onClick={handleAddColor}>
          Add new color
        </button>
      </div>
    </PlotlySection>
  );
};

export default CustomColorscaleSegments;
