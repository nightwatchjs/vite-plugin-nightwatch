describe('Render Vue Component test', function() {
  let formComponent;

  before(async function() {
    formComponent = await browser.mountVueComponent('/test/components/vue/Form.vue', {});
  });

  it('checks the vue component', function(browser) {
    browser.expect.element(formComponent).to.be.present;
    browser.setValue('#movie-input', 'A Serious Man');

    const inputEl = formComponent.find('input[type="radio"][value="3"]');

    browser.expect(inputEl).to.be.present;

    browser.click(inputEl);

    browser.expect(formComponent.property('rating')).to.equal('3');
    browser.expect(formComponent.property('title')).to.be.a('string').and.equal('A Serious Man');
  });

  it('run accessibilty tests for the component', function() {
    browser.axeRun()
  })

});