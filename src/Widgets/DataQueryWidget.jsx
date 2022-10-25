import React from 'react';
import { FormFieldWrapper, Field } from '@plone/volto/components';
import { Accordion, Segment } from 'semantic-ui-react';

const DataQueryWidget = (props) => {
  const { value, onChange, id } = props;

  const onChangeAlias = (fieldId, fieldValue) => {
    let altValue = value;
    value[fieldId] = { ...value[fieldId], alias: fieldValue };
    onChange(id, altValue);
  };

  return (
    <div>
      <FormFieldWrapper {...props} noForInFieldLabel></FormFieldWrapper>
      <div className="data-query-widget-field">
        {value && value.length > 0 ? (
          value.map((param, i) => (
            <Accordion
              key={i}
              fluid
              styled
              style={{ border: '1px solid lightgray', marginBottom: '15px' }}
            >
              <Accordion.Content active={true}>
                <Segment>
                  <p className="data-param-title">
                    <strong>{param.i}:</strong> {param.v.join(', ')}
                  </p>
                  <Field
                    id={i}
                    title="Map to"
                    type="string"
                    onChange={onChangeAlias}
                    value={param?.alias}
                  />
                </Segment>
              </Accordion.Content>
            </Accordion>
          ))
        ) : (
          <p style={{ textAlign: 'center' }}>No parameters set</p>
        )}
      </div>
    </div>
  );
};

export default DataQueryWidget;
