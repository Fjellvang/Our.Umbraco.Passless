import { LitElement, css, html, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './passkeys-overlay.js';

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

  private get passkeyIcon() {
    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
        <g>
          <circle cx="10.5" cy="6" r="4.5" style="fill:currentColor"/>
          <path d="M22.5,10.5a3.5,3.5,0,1,0-5,3.15V19L19,20.5,21.5,18,20,16.5,21.5,15l-1.24-1.24A3.5,3.5,0,0,0,22.5,10.5Zm-3.5,0a1,1,0,1,1,1-1A1,1,0,0,1,19,10.5Z" style="fill:currentColor"/>
          <path d="M14.44,12.52A6,6,0,0,0,12,12H9a6,6,0,0,0-6,6v2H16V14.49A5.16,5.16,0,0,1,14.44,12.52Z" style="fill:currentColor"/>
        </g>
      </svg>
    `;
  }

  render() {
    return html`
      <div class="passkeys-container">
        <uui-button 
          type="button" 
          look="primary" 
          label="Manage Passkeys"
          @click=${this.handlePasskeysClick}>
          ${this.passkeyIcon}
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