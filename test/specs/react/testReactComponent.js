describe('Render React Component test', function() {
  let formComponent;

  it('checks the react component', async function() {
    formComponent = await browser.mountReactComponent('/test/components/react/Form.jsx', {});
    await browser.expect.element(formComponent).to.be.visible;
  });

  it('run accessibility tests for the component', function(browser) {
     browser.axeRun()
  })

});