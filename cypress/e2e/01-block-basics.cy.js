import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Addon Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Content Type: add Discodata Connector', () => {
    cy.visit('/add?type=discodataconnector');
    cy.get('#field-title').type('connector-demo');
    cy.get('#toolbar-save').click();
  });

  it('Add new page: Empty', () => {
    cy.get('[contenteditable=true]').first().clear();
    cy.get('[contenteditable=true]').first().clear();
    cy.get('[contenteditable=true]').first().type('Plotlycharts Demo');
    cy.get('.documentFirstHeading').contains('Plotlycharts Demo');
    cy.get('[contenteditable=true]').first().type('{enter}');
  });

  it('Add Content Type: add Visualization', () => {
    cy.visit('/add?type=visualization');
    cy.get('#field-title').type('volto-plotlycharts');
    cy.get('#field-description').type('Some details here');
    cy.contains('Open Chart Editor').click();
    cy.get('#field-provider-data').type('/connector-demo');
    cy.get('.button__label').click();
    cy.get('.css-19bqh2r').eq(0).click();
    cy.contains('COUNTRY').click();
    cy.contains('Apply changes').click();
    cy.contains('Settings').click();
    cy.get(
      '.react-select__indicator.react-select__dropdown-indicator.css-7hdh9a-DropdownIndicator',
    ).click();
    cy.contains('No').click();
    cy.get('#toolbar-save').click();
  });
});
