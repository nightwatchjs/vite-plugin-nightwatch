describe('importScript Component test', function() {
  let formComponent;

  before(async () => {
    await browser
      .launchComponentRenderer()

      // When running on Github, Vite often thinks dependencies have been updated and reloads the page, so we
      // need to do a warmup run before rendering
      .execute(function(scriptFileName) {
        var scriptEl = document.createElement('script');
        scriptEl.type = 'module';
        scriptEl.src = scriptFileName;
        document.body.appendChild(scriptEl);
      }, ['/test/lib/scriptToImport.js'])
      .pause(1000)
      .launchComponentRenderer();

    formComponent = await browser.importScript('/test/lib/scriptToImport.js')
  })

  it('checks the vue component rendered with importScript', function(browser) {
    browser.expect.element(formComponent).to.be.visible;
    browser.setValue('#movie-input', 'A Serious Man');

    const inputEl = formComponent.find('input[type="radio"][value="3"]');

    browser.expect(inputEl).to.be.present;

    browser.click(inputEl);

    browser.expect(formComponent.property('rating')).to.equal('3');
    browser.expect(formComponent.property('title'), 'custom message').to.be.a('string').and.equal('A Serious Man');
  });

});