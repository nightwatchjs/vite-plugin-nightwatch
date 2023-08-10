describe('Render Svelte Component test', function() {

  it('checks the svelte component', async function(browser) {
    const formComponent = await browser.mountSvelteComponent('/test/components/svelte/counter.svelte', {props: {count: 10}});

    browser.assert.textContains('p', 'Count: 10');

    const inputEl = formComponent.find('button');

    browser.expect(inputEl).to.be.present;

    browser.click(inputEl);

    browser.assert.textContains('p', 'Count: 11');
  });
});
