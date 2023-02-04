import { coerceToArrayBuffer, coerceToBase64Url } from "../helpers";

// TODO: define a type for this variable
declare const Umbraco: any;

// TODO: define a type for the model
export interface ICredentialsControllerScope extends angular.IScope {
    model: any;
}

export class CredentialsController {
    static $inject: Array<string> = ["$scope", "$http", "overlayService", "notificationsService"];

    private state: string;
    private registrationAlias: string;
    private crossPlatform: boolean;
    private loading: boolean;

    private credentialsOptionsEndpoint: string;
    private makeCredentialsEndpoint: string;
    private getCredentialsEndpoint: string;
    private deleteCredentialsEndpoint: string;

    // TODO define type
    private credentials: any;

    // TODO: define types for the Umbraco services
    constructor(private $scope: ICredentialsControllerScope, private $http: angular.IHttpService, private overlayService: any, private notificationsService: any) {

        this.state = 'ready'
        this.registrationAlias = '';
        this.crossPlatform = true;
        this.loading = true;

        // TODO: extract this to some sort of provider or service?
        this.credentialsOptionsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.credentialsOptions;
        this.makeCredentialsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.makeCredentials;
        this.getCredentialsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.getCredentials;
        this.deleteCredentialsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.deleteCredentials;

        this.init();
    }

    private init(): void {
        this.getCredentials();
    }

    public onCrossplaftormChange(): void {

        // TODO: use $log service
        console.log("changed");
        this.crossPlatform = !this.crossPlatform;
    }

    // TODO: define a type for the parameter
    public deleteCredentials(reg: any): void {
        this.overlayService.open({
            title: 'Confirm delete credentials',
            content: 'Are you sure you want to delete the credentials?',
            submitButtonLabel: 'Yes, delete',
            submitButtonStyle: 'danger',
            closeButtonLabel: 'Cancel',
            submit: () => {
                this.$http.post(`${this.deleteCredentialsEndpoint}?id=${reg.credentialsId}`, {})
                    .then((response) => {
                        if (response.status == 200) {
                            this.notificationsService.success('Registration deleted. ' + reg.alias);
                            const index = this.credentials.userCredentials.indexOf(reg);
                            this.credentials.userCredentials.splice(index, 1);
                        } else {
                            this.notificationsService.error('Error deleting registration.');
                        }
                        this.overlayService.close();
                    }, () => {
                        this.notificationsService.error('Error deleting registration.');
                    });
            },
            close: () => {
                this.overlayService.close();
            },
        });
    }

    public getCredentials(): void {
        this.loading = true;
        this.$http.get(this.getCredentialsEndpoint)
            .then(response => {
                this.credentials = response.data;
                this.loading = false;
            })
    }

    public addNewCredentials(): void {
        this.state = 'adding';
    }

    public submitRegisterPasslessForm(): void {
        console.log(`Submitting ${this.registrationAlias}`)

        this.$http.get(`${this.credentialsOptionsEndpoint}?crossPlatform=${this.crossPlatform}`)
            .then(success => {
                const makeCredentialsOptions = success.data;

                this.handleUserCredentials(makeCredentialsOptions);
            }, failure => {
                console.log(failure);
                this.notificationsService.error(`failed getting credential options from server`);
            });

    }

    public close(): void {
        if (this.$scope.model.close) {
            this.$scope.model.close();
        }
    }

    // TODO: define parameter type
    private handleUserCredentials(makeCredentialOptions: any) {
        // Turn the challenge back into the accepted format of padded base64
        makeCredentialOptions.challenge = coerceToArrayBuffer(makeCredentialOptions.challenge);
        // Turn ID into a UInt8Array Buffer for some reason
        makeCredentialOptions.user.id = coerceToArrayBuffer(makeCredentialOptions.user.id);

        makeCredentialOptions.excludeCredentials = makeCredentialOptions.excludeCredentials.map((c: any) => {
            c.id = coerceToArrayBuffer(c.id);
            return c;
        });

        if (makeCredentialOptions.authenticatorSelection.authenticatorAttachment === null) makeCredentialOptions.authenticatorSelection.authenticatorAttachment = undefined;

        navigator.credentials.create({
            publicKey: makeCredentialOptions
        }).then(newCredential => {
            this.prepareNewCredentials(newCredential as PublicKeyCredential);
        }, failure => {
            console.log(failure);
            this.notificationsService.error("Failed to register authenticator, possibly due to it already being registered");
        });
    }

    // TODO: define parameter type
    private prepareNewCredentials(newCredentials: PublicKeyCredential): void {
        // Move data into Arrays incase it is super long
        const attestationObject = new Uint8Array((newCredentials.response as AuthenticatorAttestationResponse).attestationObject);
        const clientDataJSON = new Uint8Array(newCredentials.response.clientDataJSON);
        const rawId = new Uint8Array(newCredentials.rawId);
        const base64UrlRawId = coerceToBase64Url(rawId);

        localStorage.setItem("lastCredentials", newCredentials.id);

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

        this.registerCredentialWithServer(data)
            .then(success => {
                this.onKeyRegisteredWithServer(success.data.result);
            }, failure => {
                this.notificationsService.error("Failed to add authenticator to you account");
                console.log("Error creating credential");
                console.log(failure);
            });
    }

    // TODO: define parameter type
    private onKeyRegisteredWithServer(credentials: any): void {
        localStorage.setItem("lastCredentials", credentials.credentialId)
        this.notificationsService.success(`Successfully added new credentials with the alias ${this.registrationAlias}`);
        this.state = 'ready';
        this.getCredentials();
    }

    // TODO: define parameter and return types
    private registerCredentialWithServer(formData: any): angular.IHttpPromise<any> {
        const body = JSON.stringify(formData);
        return this.$http.post<any>(`${this.makeCredentialsEndpoint}?alias=${this.registrationAlias}`, body);
    }
}