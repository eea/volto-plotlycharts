import React from 'react';
import ColorscalePicker from 'react-chart-editor/lib/components/fields/ColorscalePicker';
import CustomColorPicker from './CustomColorPicker';
import { Icon } from '@plone/volto/components';
import deleteSVG from '@plone/volto/icons/delete.svg';
import upIcon from '@plone/volto/icons/up-key.svg';
import downIcon from '@plone/volto/icons/down-key.svg';
import addIcon from '@plone/volto/icons/add.svg';
import autoIcon from '@plone/volto/icons/replace.svg';

const setColorValue = (i, length) => {
  var increment = 1 / (length - 1);

  var val = increment * i;
  return val;
};

const ColorscaleEditor = ({ colorscale, _, handleChange }) => {
  const [expand, setExpand] = React.useState(false);

  const handleColorChange = (color, index) => {
    var newColorscale = [...colorscale];
    newColorscale[index][1] = color;

    handleChange(newColorscale);
  };

  const handleValueChange = (value, index) => {
    var newColorscale = [...colorscale];
    newColorscale[index][0] = value;

    handleChange(newColorscale);
  };

  const handleAutoValues = (colorscale) => {
    const updatedValue = colorscale.map((item, i) => [
      `${setColorValue(i, colorscale.length)}`,
      item[1],
    ]);
    handleChange(updatedValue);
  };

  const handleDeleteColor = (colorscale, index) => {
    var newColorscale = [
      ...colorscale.slice(0, index),
      ...colorscale.slice(index + 1),
    ];

    handleAutoValues(newColorscale);
  };

  const handleAddColor = (colorscale) => {
    var newColorscale = [...colorscale, ['1', 'black']];

    handleAutoValues(newColorscale);
  };

  return (
    <div className="colors-edit-container">
      <button
        className="color-expand-button"
        onClick={() => setExpand(!expand)}
      >
        {!expand && (
          <Icon className="color-open-icon" name={upIcon} size="20px" />
        )}
        {expand && (
          <Icon className="color-close-icon" name={downIcon} size="20px" />
        )}
        {!expand ? 'Edit colors' : 'Close'}
      </button>

      {expand && (
        <React.Fragment>
          {colorscale &&
            colorscale.length > 0 &&
            colorscale.map((item, index) => (
              <div className="color-edit" key={index}>
                <input
                  className="color-value"
                  label="Value"
                  value={item[0]}
                  onChange={(e) => handleValueChange(e.target.value, index)}
                />
                <CustomColorPicker
                  selectedColor={item[1]}
                  onColorChange={(color) => handleColorChange(color, index)}
                />
                {colorscale.length > 2 && (
                  <Icon
                    onClick={() => handleDeleteColor(colorscale, index)}
                    className="color-delete-icon"
                    name={deleteSVG}
                    size="24px"
                  />
                )}
              </div>
            ))}
          <div className="color-buttons-container">
            <button
              className="color-add-button"
              title="Add new color"
              onClick={() => handleAddColor(colorscale)}
            >
              <Icon className="color-add-icon" name={addIcon} size="18px" />
              Add
            </button>
            <button
              className="color-auto-button"
              title="Set colorscale values automatically"
              onClick={() => handleAutoValues(colorscale)}
            >
              <Icon className="color-add-icon" name={autoIcon} size="18px" />
              Auto Value
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const CustomMarkerColorscales = ({ _, colorscale, handleChange }) => {
  return (
    <div>
      {colorscale && colorscale.length > 0 && (
        <ColorscaleEditor
          handleChange={handleChange}
          colorscale={colorscale}
          _={_}
        />
      )}
      <ColorscalePicker
        suppressMultiValuedMessage
        attr="marker.colorscale"
        updatePlot={(colorscale) => {
          handleChange(colorscale);
        }}
        colorscale={colorscale}
      />
    </div>
  );
};

export default CustomMarkerColorscales;
