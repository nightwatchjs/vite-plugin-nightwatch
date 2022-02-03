describe('Render React Component test', function() {
  let formComponent;

  it('checks the react component', async function(browser) {
    formComponent = await browser.mountReactComponent('/test/components/react/Form.jsx', {});
    await browser.expect.element(formComponent).to.be.visible;
  });

});