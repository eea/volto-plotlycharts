describe('Plotly Chart Block: View Mode Tests', () => {
  beforeEach(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    cy.autologin();
    cy.createContent({
      contentType: 'Document',
      contentId: 'cypress',
      contentTitle: 'Cypress',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'my-page',
      contentTitle: 'My Page',
      path: 'cypress',
    });
    cy.visit('/cypress/my-page');
    cy.waitForResourceToLoad('my-page');
    cy.navigate('/cypress/my-page/edit');
  });

  it('Plotly Chart Block: Add and save', () => {
    const titleSelector = '.block.inner.title [contenteditable="true"]';
    cy.get(titleSelector).clear();
    cy.get(titleSelector).type('Plotly Test');

    cy.get('.documentFirstHeading').contains('Plotly Test');

    cy.get(titleSelector).type('{enter}');

    // Add plotly chart block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser .title').contains('Data Visualizations').click();
    cy.get('.content.active.data_visualizations .button.plotly_chart')
      .click({ force: true });

    // Save
    cy.get('#toolbar-save').click({ force: true });
    cy.contains('Plotly Test');
  });
});