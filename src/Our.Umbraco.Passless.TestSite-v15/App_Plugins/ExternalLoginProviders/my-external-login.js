const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }
    #button {
      width: 100%;
    }
  </style>
  <h3>Our Company</h3>
  <p>If you have signed up with Our Company, you can sign in to Umbraco by clicking the button below.</p>
  <uui-button type="button" id="button" look="primary">
    <uui-icon name="icon-cloud"></uui-icon>
    Sign in with Our Company
  </uui-button>
`;

/**
 * This is an example how to set up a custom element as a Web Component. fromn https://docs.umbraco.com/umbraco-cms/reference/security/external-login-providers#examples
 */
export default class MyCustomView extends HTMLElement {
    manifest = {};
    onSubmit = () => {};
    userLoginState = '';

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.shadowRoot.getElementById('button').addEventListener('click', () => {
            alert('Button clicked!');
            // this.onSubmit(this.manifest.forProviderName);
        });
    }
}

customElements.define('my-custom-view', MyCustomView);