import { coerceToArrayBuffer, coerceToBase64Url } from './helpers.js';
import type { AssertionResponse } from './types.js';
import { Constants } from './constants.js';

export class AuthService {
    private assertionOptionsEndpoint: string;
    private makeAssertionEndpoint: string;
    private forgotCredentialsEndpoint: string;

    constructor() {
        this.assertionOptionsEndpoint = '/umbraco/backoffice/passless/assertionoptions';
        this.makeAssertionEndpoint = '/umbraco/backoffice/passless/makeassertion';
        this.forgotCredentialsEndpoint = '/umbraco/backoffice/passless/forgotcredentials';
    }

    public async handleSignInSubmit(useLastCredentials: boolean = true): Promise<void> {
        try {
            const lastCredentials = localStorage.getItem(Constants.lastCredentialsIdentifier);
            
            const response = await fetch(this.assertionOptionsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lastCredentialId: useLastCredentials ? lastCredentials : ''
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to get assertion options: ${response.statusText}`);
            }

            const makeAssertionOptions: PublicKeyCredentialRequestOptions = await response.json();
            await this.getCredentials(makeAssertionOptions);
        } catch (error) {
            console.error('Sign in failed:', error);
            throw new Error('Sign in failed. Please try again.');
        }
    }

    public async requestAuthReset(email: string): Promise<void> {
        try {
            const response = await fetch(this.forgotCredentialsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error(`Failed to request auth reset: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Auth reset failed:', error);
            throw new Error('Failed to send reset email. Please try again.');
        }
    }

    private async getCredentials(makeAssertionOptions: PublicKeyCredentialRequestOptions): Promise<void> {
        // Turn the challenge back into the accepted format of padded base64
        makeAssertionOptions.challenge = coerceToArrayBuffer(makeAssertionOptions.challenge);
        makeAssertionOptions.allowCredentials = makeAssertionOptions.allowCredentials?.map((c: any) => {
            c.id = coerceToArrayBuffer(c.id);
            return c;
        });

        try {
            // Ask browser for credentials (browser will ask connected authenticators)
            const credential = await navigator.credentials.get({ publicKey: makeAssertionOptions });
            
            if (!credential) {
                throw new Error('No credential received');
            }

            await this.verifyAssertionWithServer(credential as PublicKeyCredential);
        } catch (error) {
            console.error('Credential get failed:', error);
            throw new Error('User cancelled, or the operation timed out');
        }
    }

    /**
     * Sends the credential to the FIDO2 server for assertion
     */
    private async verifyAssertionWithServer(assertedCredential: PublicKeyCredential): Promise<void> {
        try {
            const response = assertedCredential.response as AuthenticatorAssertionResponse;
            
            // Move data into Arrays in case it is super long
            const authData = new Uint8Array(response.authenticatorData);
            const clientDataJSON = new Uint8Array(assertedCredential.response.clientDataJSON);
            const rawId = new Uint8Array(assertedCredential.rawId);
            const sig = new Uint8Array(response.signature);
            const userHandle = response.userHandle ? new Uint8Array(response.userHandle) : null;

            const data = {
                id: assertedCredential.id,
                rawId: coerceToBase64Url(rawId),
                type: assertedCredential.type,
                extensions: assertedCredential.getClientExtensionResults(),
                response: {
                    authenticatorData: coerceToBase64Url(authData),
                    clientDataJSON: coerceToBase64Url(clientDataJSON),
                    userHandle: userHandle ? coerceToBase64Url(userHandle) : null,
                    signature: coerceToBase64Url(sig)
                }
            };

            const serverResponse = await fetch(this.makeAssertionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!serverResponse.ok) {
                throw new Error(`Server validation failed: ${serverResponse.statusText}`);
            }

            const assertionResponse: AssertionResponse = await serverResponse.json();
            
            // Store credential ID for future use if it's not a passkey
            if (assertionResponse.isPasskey === false) {
                localStorage.setItem(Constants.lastCredentialsIdentifier, assertionResponse.credentialId);
            }

            // Redirect to the success URL
            window.location.href = assertionResponse.redirectUrl;
            
        } catch (error) {
            console.error('Assertion verification failed:', error);
            throw new Error('Your credentials could not be validated, please try again');
        }
    }
}