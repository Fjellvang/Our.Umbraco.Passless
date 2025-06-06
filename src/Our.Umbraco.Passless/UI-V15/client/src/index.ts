// Import and register all components for the Umbraco package
import './external-login.js';
import './passkeys-manager.js';

// Also export them for potential direct usage
export { default as MyLitView } from './external-login.js';
export { default as PasskeysManager } from './passkeys-manager.js';