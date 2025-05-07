
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * This is an example how to set up a LitElement component.
 */
@customElement('my-lit-view')
export default class MyLitView extends LitElement {
  @property({ type: Object }) manifest: any;
  @property({ type: Function }) onSubmit!: (providerName: string) => void;
  @state() userLoginState: string = '';
  // static get properties() {
  //   return {
  //     manifest: { type: Object },
  //     onSubmit: { type: Function },
  //     userLoginState: { type: String, state: true }
  //   };
  // }

  get displayName() {
    return this.manifest.meta?.label ?? this.manifest.forProviderName;
  }

  render() {
    return html`
        <h3>Our Company</h3>
        <p>If you have an account with Our Company, you can sign in to Umbraco by clicking the button below. HELLO VITE</p>
        <p>The user is currently: ${this.userLoginState}</p>
        <uui-button type="button" id="button" look="primary" label="${this.displayName}" @click=${() => this.onSubmit(this.manifest.forProviderName)}>
          <uui-icon name="icon-cloud"></uui-icon>
          ${this.displayName}
        </uui-button>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    #button {
      width: 100%;
    }
  `;
}

// customElements.define('my-lit-view', MyLitView);