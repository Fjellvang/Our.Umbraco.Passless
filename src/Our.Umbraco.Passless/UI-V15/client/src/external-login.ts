
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AuthService } from './auth-service.ts';
import passkeyIconUrl from './assets/FIDO-Passkey_Icon-White.svg';

/**
 * Passless authentication component for Umbraco 15
 */
@customElement('passless-login-view')
export default class PasslessLoginView extends LitElement {
  @property({ type: Object }) manifest: any;
  @property({ type: Function }) onSubmit!: (providerName: string) => void;
  @state() isLoading: boolean = false;
  @state() errorMessage: string = '';
  @state() usePreviousAuthenticator: boolean = true;
  @state() hasLocalCredentials: boolean = false;

  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
    this.hasLocalCredentials = this.authService.hasLocalCredentials;
  }

  get displayName() {
    return this.manifest.meta?.label ?? this.manifest.forProviderName;
  }

  private async handlePasslessLogin() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      await this.authService.handleSignInSubmit(this.usePreviousAuthenticator);
      // HacK: We call the default onSubmit method, since the backoffice controller signed us in.
      this.onSubmit('Umbraco');
      // If we reach this point, authentication was successful
      // The auth service will handle the redirect
    } catch (error) {
      console.error('Passless login failed:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    } finally {
      this.isLoading = false;
    }
  }

  private handleCheckboxChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.usePreviousAuthenticator = target.checked;
  }

  render() {
    return html`
        <h3>Passless Authentication</h3>
        <p>Sign in to Umbraco using your passkey or security key.</p>
        
        ${this.errorMessage ? html`<p class="error-message">Error: ${this.errorMessage}</p>` : ''}
        
        ${this.hasLocalCredentials ? html`
          <div class="checkbox-container">
            <uui-checkbox
              .checked=${this.usePreviousAuthenticator}
              @change=${this.handleCheckboxChange}>
              Use previously used authenticator
            </uui-checkbox>
          </div>
        ` : ''}
        
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
    .error-message {
      margin: 8px 0;
      font-size: 14px;
      color: red;
    }
    .checkbox-container {
      margin: 16px 0;
    }
  `;
}

// customElements.define('passless-login-view', PasslessLoginView);