import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { CredentialsService } from './credentials-service.js';

/**
 * Passkeys management component for Umbraco 15 current user actions
 */
@customElement('passkeys-manager')
export default class PasskeysManager extends LitElement {
  @state() isLoading: boolean = false;
  @state() errorMessage: string = '';
  @state() successMessage: string = '';

  // @ts-ignore
    private credentialsService: CredentialsService;

  constructor() {
    super();
    this.credentialsService = new CredentialsService();
  }

  private async handlePasskeysClick() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      // For now, just show that the button works
      console.log('Passkeys button clicked');
      this.successMessage = 'Passkeys feature coming soon!';
      
      // TODO: Implement actual credentials management
      // const credentials = await this.credentialsService.getCredentials();
      
    } catch (error) {
      console.error('Passkeys action failed:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Operation failed';
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return html`
      <div class="passkeys-container">
        <uui-button 
          type="button" 
          look="primary" 
          label="Manage Passkeys"
          ?disabled=${this.isLoading}
          @click=${this.handlePasskeysClick}>
          <uui-icon name="icon-fingerprint"></uui-icon>
          ${this.isLoading ? 'Loading...' : 'Passkeys'}
        </uui-button>
        
        ${this.successMessage ? html`
          <div class="message success">
            ${this.successMessage}
          </div>
        ` : ''}
        
        ${this.errorMessage ? html`
          <div class="message error">
            ${this.errorMessage}
          </div>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    .passkeys-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .message {
      padding: 8px 12px;
      border-radius: 4px;
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
  `;
}