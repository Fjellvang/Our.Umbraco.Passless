import { coerceToArrayBuffer, coerceToBase64Url } from "./helpers";
import { CredentialsService } from "./services/credentialsService";
import { AssertionResponse } from "./types";

// TODO: define a type for this variable
declare const Umbraco: any;

export class CustomLoginController {

    static $inject: Array<string> = ["$scope", "$window", "$http", "userService", "editorService", "$location", "UmbracoPassless.CredentialsService"];

    private state: string;
    private loadingUmbracoIdSetting: boolean;
    private assertionOptionsEndpoint: string;
    private makeAssertionEndpoint: string;
    private forgotCredentialsEndpoint: string;
    private lastCredentials: string | null;
    private useLastCredentials: boolean;
    private allowAuthReset: boolean;
    private errors: string[];

    private email = '';
    private showEmailResetConfirmation = false;

    // TODO: define types for umbraco services
    constructor(private $scope: angular.IScope,
        private $window: angular.IWindowService,
        private $http: angular.IHttpService,
        private userService: any,
        private editorService: any,
        private $location: angular.ILocationService,
        private credentialsService: CredentialsService
    ) {
        this.state = 'login';
        this.loadingUmbracoIdSetting = true;
        this.assertionOptionsEndpoint = '/umbraco/backoffice/passless/assertionoptions';// TODO: maybe find a better solution than hardcoding the endpoints?
        this.makeAssertionEndpoint = '/umbraco/backoffice/passless/makeassertion';
        this.forgotCredentialsEndpoint = '/umbraco/backoffice/passless/forgotcredentials';
        this.lastCredentials = '';
        this.useLastCredentials = true;
        this.allowAuthReset = Umbraco.Sys.ServerVariables.umbracoSettings.canSendRequiredEmail;
        this.errors = [];
        this.init();
    }

    private init(): void {
        this.lastCredentials = localStorage.getItem('lastCredentials');

        this.userService.isAuthenticated().then(() => {
            this.state = 'backoffice';
            // Check if it is a new user
            const resetValue = this.$location.search().reset;
            if (resetValue && resetValue === "1") {
                this.state = 'resetAuth';
            }
        }, () => { });
    }

    public toggleLastCredentials(): void {

        this.useLastCredentials = !this.useLastCredentials;
    }

    public showLogin(): void {
        this.state = 'login';
        this.showLoginForm();
    }

    public showAuthReset(): void {
        const loginBox = document.getElementsByClassName('ng-pristine ng-valid ng-scope')[0];
        if (loginBox) {
            loginBox.setAttribute('style','display: none');
        }
        this.state = 'requestAuthReset';
    }

    public requestAuthResetSubmit(email: string): void {
        //TODO: Do input validation.

        this.$http.post(this.forgotCredentialsEndpoint,
            JSON.stringify({
                email: email
            })
        ).then(() => {
            //remove the email entered
            this.email = "";
            this.showEmailResetConfirmation = true;
        });
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

    private showLoginForm() {
        const loginBox = document.getElementsByClassName('ng-pristine ng-valid ng-scope')[0];
        if (loginBox) {
            loginBox.setAttribute('style', '');
        }
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
            }, () => {
                this.errors.push("User cancelled, or the operation timed out");
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
                this.errors.push("Your credentials could not be validated, please try again");
            });
    }

    public registerLostCredential(): void {
        this.credentialsService.registerNewCredentials("Backup", true)
            .then(() => {
                this.$window.location.href = Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath;
            })
            ;
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
