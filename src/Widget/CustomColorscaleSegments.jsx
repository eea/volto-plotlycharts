import React, { useState } from 'react';

import { PlotlySection } from 'react-chart-editor';

import { Icon } from '@plone/volto/components';
import { Colorscale } from 'react-colorscales';
import CustomColorPicker from './CustomColorPicker';
import deleteSVG from '@plone/volto/icons/delete.svg';
import listArrowsSVG from '@plone/volto/icons/list-arrows.svg';
import circleDismissSVG from '@plone/volto/icons/circle-dismiss.svg';

const CustomColorscaleSegments = ({ colorscale, handleChange, _ }) => {
  const [expand, setExpand] = useState(false);

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

  const onToggleList = () => {
    setExpand(!expand);
  };

  return (
    <PlotlySection name={_('Custom Colorscale Segments')}>
      <div className="field field__colorscale colorscale-container">
        <p style={{ width: '70px', fontSize: '12px', color: '#506784' }}>
          Active
        </p>
        <div
          style={{
            width: '180px',
            'margin-left': '12px',
          }}
        >
          <Colorscale onClick={onToggleList} colorscale={colorscale} />
          {!expand && (
            <Icon
              onClick={onToggleList}
              className="expand-icon"
              name={listArrowsSVG}
              size="30px"
            />
          )}
          {expand && (
            <Icon
              onClick={onToggleList}
              className="collapse-icon"
              name={circleDismissSVG}
              size="30px"
            />
          )}
        </div>
      </div>
      {expand && colorscale.length > 0 && (
        <React.Fragment>
          {colorscale.map((c, i) => (
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
        </React.Fragment>
      )}
    </PlotlySection>
  );
};

export default CustomColorscaleSegments;
