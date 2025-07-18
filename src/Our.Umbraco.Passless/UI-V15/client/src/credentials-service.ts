import { coerceToArrayBuffer, coerceToBase64Url } from './helpers.js';
import type { AttestationVerificationSuccess, UserCredentials } from './types.js';
import { OpenAPI } from '@umbraco-cms/backoffice/external/backend-api';

export class CredentialsService {
    private makeCredentialsEndpoint: string;
    private credentialsOptionsEndpoint: string;
    private getCredentialsEndpoint: string;
    private deleteCredentialsEndpoint: string;

    constructor() {
        this.makeCredentialsEndpoint = '/umbraco/management/api/v1/passless/credentials/make';
        this.credentialsOptionsEndpoint = '/umbraco/management/api/v1/passless/credentials/options';
        this.getCredentialsEndpoint = '/umbraco/management/api/v1/passless/credentials';
        this.deleteCredentialsEndpoint = '/umbraco/management/api/v1/passless/credentials/delete';
    }


    public async deleteCredential(credentialsId: string): Promise<void> {
        const tokenPromise = (OpenAPI.TOKEN as any as () => Promise<string>);
        const token = await tokenPromise();
        const response = await fetch(`${this.deleteCredentialsEndpoint}?id=${credentialsId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            credentials: 'include',
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`Failed to delete credential: ${response.statusText}`);
        }
    }

    public async getCredentials(): Promise<UserCredentials> {
        const tokenPromise = (OpenAPI.TOKEN as any as () => Promise<string>);
        const token = await tokenPromise();
        const response = await fetch(this.getCredentialsEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + token
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to get credentials: ${response.statusText}`);
        }

        return await response.json();
    }

    public async registerNewCredentials(registrationAlias: string): Promise<AttestationVerificationSuccess> {
        try {
            const tokenPromise = (OpenAPI.TOKEN as any as () => Promise<string>);
            const token = await tokenPromise();
            const response = await fetch(this.credentialsOptionsEndpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to get credential options: ${response.statusText}`);
            }

            const makeCredentialsOptions: PublicKeyCredentialCreationOptions = await response.json();
            return await this.handleUserCredentials(makeCredentialsOptions, registrationAlias);
        } catch (error) {
            console.error('Error contacting server:', error);
            throw new Error('Error contacting server');
        }
    }

    private async handleUserCredentials(
        makeCredentialOptions: PublicKeyCredentialCreationOptions,
        registrationAlias: string
    ): Promise<AttestationVerificationSuccess> {
        // Turn the challenge back into the accepted format of padded base64
        makeCredentialOptions.challenge = coerceToArrayBuffer(makeCredentialOptions.challenge);
        // Turn ID into a UInt8Array Buffer for some reason
        makeCredentialOptions.user.id = coerceToArrayBuffer(makeCredentialOptions.user.id);

        makeCredentialOptions.excludeCredentials = makeCredentialOptions.excludeCredentials?.map((c: any) => {
            c.id = coerceToArrayBuffer(c.id);
            return c;
        });


        if (makeCredentialOptions.authenticatorSelection?.authenticatorAttachment === null) {
            makeCredentialOptions.authenticatorSelection.authenticatorAttachment = undefined;
        }

        try {
            
            const newCredential = await navigator.credentials.create({
                publicKey: makeCredentialOptions
            });

            if (!newCredential) {
                throw new Error('Failed to create credentials');
            }

            return await this.prepareNewCredentials(newCredential as PublicKeyCredential, registrationAlias);
        } catch (error) {
            throw new Error(`Credential creation failed: ${error}`);
        }
    }

    private async prepareNewCredentials(
        newCredentials: PublicKeyCredential,
        registrationAlias: string
    ): Promise<AttestationVerificationSuccess> {
        // Move data into Arrays in case it is super long
        const attestationObject = new Uint8Array(
            (newCredentials.response as AuthenticatorAttestationResponse).attestationObject
        );
        const clientDataJSON = new Uint8Array(newCredentials.response.clientDataJSON);
        const rawId = new Uint8Array(newCredentials.rawId);
        const base64UrlRawId = coerceToBase64Url(rawId);

        const data = {
            id: newCredentials.id,
            rawId: base64UrlRawId,
            type: newCredentials.type,
            extensions: newCredentials.getClientExtensionResults(),
            response: {
                attestationObject: coerceToBase64Url(attestationObject),
                clientDataJSON: coerceToBase64Url(clientDataJSON)
            }
        };

        return await this.registerCredentialWithServer(data, registrationAlias);
    }

    private async registerCredentialWithServer(
        formData: any,
        registrationAlias: string
    ): Promise<AttestationVerificationSuccess> {
        const tokenPromise = (OpenAPI.TOKEN as any as () => Promise<string>);
        const token = await tokenPromise();
        const body = JSON.stringify(formData);
        const response = await fetch(`${this.makeCredentialsEndpoint}?alias=${registrationAlias}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            credentials: 'include',
            body: body
        });

        if (!response.ok) {
            throw new Error(`Failed to register credential: ${response.statusText}`);
        }

        return await response.json();
    }
}