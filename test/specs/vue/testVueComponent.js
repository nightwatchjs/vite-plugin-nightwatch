describe('Render Vue Component test', function() {

  it('checks the vue component', async function(browser) {
    const formComponent = await browser.mountVueComponent('/test/components/vue/Form.vue', {});

    browser.expect.element(formComponent).to.be.present;
    browser.setValue('#movie-input', 'A Serious Man');

    const inputEl = formComponent.find('input[type="radio"][value="3"]');

    browser.expect(inputEl).to.be.present;

    browser.click(inputEl);

    browser.expect(formComponent.property('rating')).to.equal('3');
    browser.expect(formComponent.property('title')).to.be.a('string').and.equal('A Serious Man');
  });

  it.only('checks rendring', async function (browser) {
    const welcomeComponent = await browser.mountVueComponent('/test/components/vue/Welcome.vue', {props: {username: 'John Doe'}}, {});

    browser.expect.element(welcomeComponent).to.be.present;
    browser.expect.element('h1').text.to.contain('John Doe');
  });
});
