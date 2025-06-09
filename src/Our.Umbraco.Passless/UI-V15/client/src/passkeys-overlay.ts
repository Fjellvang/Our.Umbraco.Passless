import { LitElement, css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { CredentialsService } from './credentials-service.js';
import type { UserCredentials, UserCredential } from './types.js';

/**
 * Passkeys management overlay component for Umbraco 15
 */
@customElement('passkeys-overlay')
export default class PasskeysOverlay extends LitElement {
  @property({ type: Boolean }) open: boolean = false;
  @property({ type: Function }) onClose!: () => void;
  
  @state() private loading: boolean = false;
  @state() private credentials: UserCredentials | null = null;
  @state() private state: 'ready' | 'adding' = 'ready';
  @state() private registrationAlias: string = '';
  @state() private errorMessage: string = '';
  @state() private successMessage: string = '';

  private credentialsService: CredentialsService;

  constructor() {
    super();
    this.credentialsService = new CredentialsService();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.open) {
      this.init();
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('open') && this.open) {
      this.init();
    }
  }

  private async init() {
    await this.getCredentials();
  }

  private async getCredentials() {
    try {
      this.loading = true;
      this.errorMessage = '';
      this.credentials = await this.credentialsService.getCredentials();
    } catch (error) {
      console.error('Failed to get credentials:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load credentials';
    } finally {
      this.loading = false;
    }
  }

  private async deleteCredential(credential: UserCredential) {
    if (!confirm(`Are you sure you want to delete the credential "${credential.alias}"?`)) {
      return;
    }

    try {
      await this.credentialsService.deleteCredential(credential.credentialsId);
      this.successMessage = `Registration deleted: ${credential.alias}`;
      
      // Remove from local state
      if (this.credentials) {
        const index = this.credentials.userCredentials.indexOf(credential);
        this.credentials.userCredentials.splice(index, 1);
        this.requestUpdate();
      }
    } catch (error) {
      console.error('Failed to delete credential:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete credential';
    }
  }

  private addNewCredentials() {
    this.state = 'adding';
    this.registrationAlias = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  private async submitRegisterPasslessForm() {
    if (!this.registrationAlias.trim()) {
      this.errorMessage = 'Please enter an alias for the authenticator';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';
      
      await this.credentialsService.registerNewCredentials(this.registrationAlias);
      
      this.onKeyRegisteredWithServer();
    } catch (error) {
      console.error('Registration failed:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Registration failed';
    } finally {
      this.loading = false;
    }
  }

  private onKeyRegisteredWithServer() {
    this.successMessage = `Successfully added new credentials with the alias "${this.registrationAlias}"`;
    this.state = 'ready';
    this.registrationAlias = '';
    this.getCredentials();
  }

  private handleClose() {
    this.state = 'ready';
    this.registrationAlias = '';
    this.errorMessage = '';
    this.successMessage = '';
    if (this.onClose) {
      this.onClose();
    }
  }

  private handleAliasInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.registrationAlias = target.value;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && this.state === 'adding') {
      this.submitRegisterPasslessForm();
    } else if (e.key === 'Escape') {
      this.handleClose();
    }
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="overlay-backdrop" @click=${this.handleClose}>
        <div class="overlay-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="overlay-header">
            <h2><umb-localize key="Passless_OverlayTitle"></umb-localize></h2>
            <uui-button 
              type="button" 
              look="primary" 
              @click=${this.handleClose}
              class="close-button">
              <uui-icon name="icon-delete"></uui-icon>
            </uui-button>
          </div>

          <div class="overlay-body">
            ${this.loading ? html`
              <div class="loading">
                <uui-loader></uui-loader>
                <p><umb-localize key="Passless_Loading"></umb-localize></p>
              </div>
            ` : html`
              <div class="content">
                <h3><umb-localize key="Passless_RegistrationsTitle"></umb-localize></h3>
                <p><umb-localize key="Passless_RegistrationsDescription"></umb-localize></p>

                ${this.errorMessage ? html`
                  <div class="message error">${this.errorMessage}</div>
                ` : ''}

                ${this.successMessage ? html`
                  <div class="message success">${this.successMessage}</div>
                ` : ''}

                <div class="credentials-list">
                  ${this.credentials?.userCredentials?.map(credential => html`
                    <div class="credential-item">
                      <span class="credential-info">
                        <uui-icon name="icon-keychain"></uui-icon>
                        ${credential.alias}
                      </span>
                      <uui-button 
                        type="button" 
                        look="primary" 
                        color="danger"
                        @click=${() => this.deleteCredential(credential)}>
                        <umb-localize key="Passless_Delete"></umb-localize>
                      </uui-button>
                    </div>
                  `)}

                  ${this.state === 'ready' ? html`
                    <uui-button 
                      type="button" 
                      look="primary" 
                      @click=${this.addNewCredentials}>
                      <umb-localize key="Passless_AddDevice"></umb-localize>
                    </uui-button>
                  ` : ''}

                  ${this.state === 'adding' ? html`
                    <div class="add-credential">
                      <uui-input 
                        type="text"
                        placeholder="Alias of the authenticator"
                        .value=${this.registrationAlias}
                        @input=${this.handleAliasInput}
                        @keydown=${this.handleKeyDown}
                        auto-focus>
                      </uui-input>
                      <uui-button 
                        type="button" 
                        look="primary" 
                        ?disabled=${this.loading}
                        @click=${this.submitRegisterPasslessForm}>
                        ${this.loading ? html`<umb-localize key="Passless_Adding"></umb-localize>` : html`<umb-localize key="Passless_Add"></umb-localize>`}
                      </uui-button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `}
          </div>

          <div class="overlay-footer">
            <uui-button 
              type="button" 
              look="secondary" 
              @click=${this.handleClose}>
              <umb-localize key="Passless_Close"></umb-localize>
            </uui-button>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .overlay-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .overlay-content {
      background: var(--uui-color-surface, #fff);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .overlay-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--uui-color-border, #e0e0e0);
    }

    .overlay-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .close-button {
      min-width: auto;
      padding: 8px;
    }

    .overlay-body {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      gap: 16px;
    }

    .content h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .content p {
      margin: 0 0 24px 0;
      color: var(--uui-color-text-alt, #666);
    }

    .message {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .message.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .message.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .credentials-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .credential-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid var(--uui-color-border, #e0e0e0);
      border-radius: 4px;
      background: var(--uui-color-surface-alt, #f9f9f9);
    }

    .credential-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .add-credential {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--uui-color-border, #e0e0e0);
      border-radius: 4px;
      background: var(--uui-color-surface-alt, #f9f9f9);
    }

    .add-credential uui-input {
      flex: 1;
    }

    .overlay-footer {
      padding: 20px;
      border-top: 1px solid var(--uui-color-border, #e0e0e0);
      display: flex;
      justify-content: flex-end;
    }
  `;
}