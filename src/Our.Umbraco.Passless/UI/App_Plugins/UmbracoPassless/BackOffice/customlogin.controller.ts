import { coerceToArrayBuffer, coerceToBase64Url } from "./helpers";
import { AssertionResponse } from "./types";

export class CustomLoginController {

    static $inject: Array<string> = ["$scope", "$window", "$http", "userService", "editorService"];

    private state: string;
    private loadingUmbracoIdSetting: boolean;
    private assertionOptionsEndpoint: string;
    private makeAssertionEndpoint: string;
    private lastCredentials: string | null;
    private useLastCredentials: boolean;

    // TODO: define types for umbraco services
    constructor(private $scope: angular.IScope, private $window: angular.IWindowService, private $http: angular.IHttpService, private userService: any, private editorService: any) {

        this.state = "login";
        this.loadingUmbracoIdSetting = true;
        this.assertionOptionsEndpoint = '/umbraco/backoffice/passless/assertionoptions';
        this.makeAssertionEndpoint = '/umbraco/backoffice/passless/makeassertion';
        this.lastCredentials = '';
        this.useLastCredentials = true;

        this.init();
    }

    private init(): void {
        this.lastCredentials = localStorage.getItem("lastCredentials");

        this.userService.isAuthenticated().then(() => {
            this.state = "backoffice";
        }, () => { });
    }

    public toggleLastCredentials(): void {

        this.useLastCredentials = !this.useLastCredentials;
    }

    public handleSignInSubmit(): void {
        this.$http.post<PublicKeyCredentialRequestOptions>(this.assertionOptionsEndpoint,
            JSON.stringify({
                lastCredentialId: this.useLastCredentials ? this.lastCredentials : ''
            })
        ).then(success => {
            this.getCredentials(success.data);
        });
    }

    private getCredentials(makeAssertionOptions: PublicKeyCredentialRequestOptions): void {

        // Turn the challenge back into the accepted format of padded base64
        makeAssertionOptions.challenge = coerceToArrayBuffer(makeAssertionOptions.challenge);
        makeAssertionOptions.allowCredentials = makeAssertionOptions.allowCredentials?.map((c: any) => {
            c.id = coerceToArrayBuffer(c.id);
            return c;
        });

        // ask browser for credentials (browser will ask connected authenticators)
        navigator.credentials.get({ publicKey: makeAssertionOptions })
            .then(credential => {
                this.verifyAssertionWithServer(credential as PublicKeyCredential);
            })
    }

    /**
     * Sends the credential to the the FIDO2 server for assertion
     * @param {any} assertedCredential
     */
    private verifyAssertionWithServer(assertedCredential: PublicKeyCredential): void {

        const response = assertedCredential.response as AuthenticatorAssertionResponse;
        // Move data into Arrays incase it is super long
        let authData = new Uint8Array(response.authenticatorData);
        let clientDataJSON = new Uint8Array(assertedCredential.response.clientDataJSON);
        let rawId = new Uint8Array(assertedCredential.rawId);
        let sig = new Uint8Array(response.signature);
        let userHandle = new Uint8Array(response.userHandle!);
        const data = {
            id: assertedCredential.id,
            rawId: coerceToBase64Url(rawId),
            type: assertedCredential.type,
            extensions: assertedCredential.getClientExtensionResults(),
            response: {
                authenticatorData: coerceToBase64Url(authData),
                clientDataJSON: coerceToBase64Url(clientDataJSON),
                userHandle: userHandle !== null ? coerceToBase64Url(userHandle) : null,
                signature: coerceToBase64Url(sig)
            }
        };

        this.$http.post<AssertionResponse>(this.makeAssertionEndpoint, JSON.stringify(data))
            .then(success => {
                const response = success.data;
                localStorage.setItem("lastCredentials", response.credentialId);
                this.$window.location.href = response.redirectUrl
            }, () => {
                console.log("Error doing assertion");
                //TODO: Do some proper error messaging
            });
    }

    //Registration
    public openPasslessOverlay(): void {
        this.editorService.open({
            title: 'Passless Registrations',
            view: '/App_Plugins/UmbracoPassless/BackOffice/overlays/credentials.html',
            position: 'right',
            size: 'medium',
            close: (x: any) => {
                this.editorService.close();
            }
        })
    }
}
