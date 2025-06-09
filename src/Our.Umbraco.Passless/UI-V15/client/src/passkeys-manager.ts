import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './passkeys-overlay.js';
import passkeyIconUrl from './assets/FIDO-Passkey_Icon-White.svg';

/**
 * Passkeys management component for Umbraco 15 user profile actions
 */
@customElement('passkeys-manager')
export default class PasskeysManager extends LitElement {
  @state() private overlayOpen: boolean = false;

  private handlePasskeysClick() {
    this.overlayOpen = true;
  }

  private handleOverlayClose() {
    this.overlayOpen = false;
  }


  render() {
    return html`
      <div class="passkeys-container">
        <uui-button 
          type="button" 
          look="primary" 
          label="Manage Passkeys"
          @click=${this.handlePasskeysClick}>
          <img src="${passkeyIconUrl}" alt="Passkey" style="width: 16px; height: 16px;">
          Manage Passkeys
        </uui-button>
        
        <passkeys-overlay 
          .open=${this.overlayOpen}
          .onClose=${this.handleOverlayClose}>
        </passkeys-overlay>
      </div>
    `;
  }

  static styles = css`
    .passkeys-container {
      display: block;
      width: 100%;
    }
    
    uui-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;
}