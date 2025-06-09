
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AuthService } from './auth-service.ts';
import passkeyIconUrl from './assets/FIDO-Passkey_Icon-White.svg';

/**
 * Passless authentication component for Umbraco 15
 */
@customElement('my-lit-view')
export default class MyLitView extends LitElement {
  @property({ type: Object }) manifest: any;
  @property({ type: Function }) onSubmit!: (providerName: string) => void;
  @state() userLoginState: string = '';
  @state() isLoading: boolean = false;
  @state() errorMessage: string = '';

  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  get displayName() {
    return this.manifest.meta?.label ?? this.manifest.forProviderName;
  }

  private async handlePasslessLogin() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.userLoginState = 'Authenticating...';
      
      await this.authService.handleSignInSubmit(true);
      // HacK: We call the default onSubmit method, since the backoffice controller signed us in.
      this.onSubmit('Umbraco');
      // If we reach this point, authentication was successful
      // The auth service will handle the redirect
      this.userLoginState = 'Authentication successful!';
    } catch (error) {
      console.error('Passless login failed:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      this.userLoginState = 'Authentication failed';
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return html`
        <h3>Passless Authentication</h3>
        <p>Sign in to Umbraco using your passkey or security key.</p>
        ${this.userLoginState ? html`<p>Status: ${this.userLoginState}</p>` : ''}
        ${this.errorMessage ? html`<p style="color: red;">Error: ${this.errorMessage}</p>` : ''}
        <uui-button 
          type="button" 
          id="button" 
          look="primary" 
          label="${this.displayName}" 
          ?disabled=${this.isLoading}
          @click=${this.handlePasslessLogin}>
          <img src="${passkeyIconUrl}" alt="Passkey" style="width: 16px; height: 16px;">
          ${this.isLoading ? 'Authenticating...' : this.displayName}
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
    p[style*="color: red"] {
      margin: 8px 0;
      font-size: 14px;
    }
  `;
}

// customElements.define('my-lit-view', MyLitView);