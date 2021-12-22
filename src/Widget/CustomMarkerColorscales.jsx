import React from 'react';
import ColorscalePicker from 'react-chart-editor/lib/components/fields/ColorscalePicker';
import CustomColorPicker from './CustomColorPicker';

const ColorscaleEditor = ({ colorscale, _, handleChange }) => {
  const handleColorChange = (color, index) => {
    var newColorscale = [...colorscale];
    newColorscale[index][1] = color;
    handleChange(newColorscale);
  };

  return (
    <React.Fragment>
      {colorscale &&
        colorscale.length > 0 &&
        colorscale.map((item, index) => (
          <CustomColorPicker
            key={index}
            selectedColor={item[1]}
            onColorChange={(color) => handleColorChange(color, index)}
          />
        ))}
    </React.Fragment>
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
