import { coerceToArrayBuffer, coerceToBase64Url } from "../helpers";
import { CredentialMakeResult, UserCredentials } from "../types";

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

        this.makeCredentialsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.makeCredentials;
        this.credentialsOptionsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.credentialsOptions;

        this.getCredentialsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.getCredentials;
        this.deleteCredentialsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.deleteCredentials;

    }

    public deleteCredential(credentialsId: string): angular.IHttpPromise<void>  {
        return this.$http.post(`${this.deleteCredentialsEndpoint}?id=${credentialsId}`, {});
    }

    public getCredentials(): angular.IHttpPromise<UserCredentials> {
        return this.$http.get<UserCredentials>(this.getCredentialsEndpoint);
    }

    public registerNewCredentials(registrationAlias: string, crossPlatform: boolean): angular.IHttpPromise<CredentialMakeResult>  {
        return this.$http.get<PublicKeyCredentialCreationOptions>(`${this.credentialsOptionsEndpoint}?crossPlatform=${crossPlatform}`)
            .then(success => {
                const makeCredentialsOptions = success.data;

                return this.handleUserCredentials(makeCredentialsOptions, registrationAlias)
            }, failure => {
                console.log(failure)
                throw new Error('Error contacting server');
            });
    }

    private handleUserCredentials(makeCredentialOptions: PublicKeyCredentialCreationOptions, registrationAlias: string): angular.IHttpPromise<CredentialMakeResult>  {

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

    private prepareNewCredentials(newCredentials: PublicKeyCredential, registrationAlias: string): angular.IHttpPromise<CredentialMakeResult> {
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

    private registerCredentialWithServer(formData: any, registrationAlias: string): angular.IHttpPromise<CredentialMakeResult> {
        const body = JSON.stringify(formData);
        return this.$http.post<CredentialMakeResult>(`${this.makeCredentialsEndpoint}?alias=${registrationAlias}`, body);
    }

}