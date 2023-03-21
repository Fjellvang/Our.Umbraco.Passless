import { coerceToArrayBuffer, coerceToBase64Url } from "../helpers";
import { AttestationVerificationSuccess, UserCredentials } from "../types";

// TODO: define a type for this variable
declare const Umbraco: any;

export class CredentialsService {
    static $inject: Array<string> = ["$http"];

    private makeCredentialsEndpoint: string;
    private credentialsOptionsEndpoint: string;
    private getCredentialsEndpoint: string;
    private deleteCredentialsEndpoint: string;

    constructor(
        private $http: angular.IHttpService) {

        this.makeCredentialsEndpoint = '/umbraco/backoffice/passless/makecredentials';
        this.credentialsOptionsEndpoint = '/umbraco/backoffice/passless/credentialsoptions'

        this.getCredentialsEndpoint = '/umbraco/backoffice/passless/getcredentials'
        this.deleteCredentialsEndpoint = '/umbraco/backoffice/passless/deletecredentials'

    }

    public deleteCredential(credentialsId: string): angular.IHttpPromise<void>  {
        return this.$http.post(`${this.deleteCredentialsEndpoint}?id=${credentialsId}`, {});
    }

    public getCredentials(): angular.IHttpPromise<UserCredentials> {
        return this.$http.get<UserCredentials>(this.getCredentialsEndpoint);
    }

    public registerNewCredentials(registrationAlias: string): angular.IHttpPromise<AttestationVerificationSuccess>  {
        return this.$http.get<PublicKeyCredentialCreationOptions>(`${this.credentialsOptionsEndpoint}`)
            .then(success => {
                const makeCredentialsOptions = success.data;

                return this.handleUserCredentials(makeCredentialsOptions, registrationAlias)
            }, failure => {
                console.log(failure)
                throw new Error('Error contacting server');
            });
    }

    private handleUserCredentials(makeCredentialOptions: PublicKeyCredentialCreationOptions, registrationAlias: string): angular.IHttpPromise<AttestationVerificationSuccess>  {

        // Turn the challenge back into the accepted format of padded base64
        makeCredentialOptions.challenge = coerceToArrayBuffer(makeCredentialOptions.challenge);
        // Turn ID into a UInt8Array Buffer for some reason
        makeCredentialOptions.user.id = coerceToArrayBuffer(makeCredentialOptions.user.id);

        makeCredentialOptions.excludeCredentials = makeCredentialOptions.excludeCredentials?.map((c: any) => {
            c.id = coerceToArrayBuffer(c.id);
            return c;
        });

        if (makeCredentialOptions.authenticatorSelection?.authenticatorAttachment === null) makeCredentialOptions.authenticatorSelection.authenticatorAttachment = undefined;

        return navigator.credentials.create({
            publicKey: makeCredentialOptions
        }).then(newCredential => {
            return this.prepareNewCredentials(newCredential as PublicKeyCredential, registrationAlias);
        }, failure => {
            throw new Error(failure);
        });
    }

    private prepareNewCredentials(newCredentials: PublicKeyCredential, registrationAlias: string): angular.IHttpPromise<AttestationVerificationSuccess> {
        // Move data into Arrays incase it is super long
        const attestationObject = new Uint8Array((newCredentials.response as AuthenticatorAttestationResponse).attestationObject);
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

        return this.registerCredentialWithServer(data, registrationAlias);
    }

    private registerCredentialWithServer(formData: any, registrationAlias: string): angular.IHttpPromise<AttestationVerificationSuccess> {
        const body = JSON.stringify(formData);
        return this.$http.post<AttestationVerificationSuccess>(`${this.makeCredentialsEndpoint}?alias=${registrationAlias}`, body);
    }

}