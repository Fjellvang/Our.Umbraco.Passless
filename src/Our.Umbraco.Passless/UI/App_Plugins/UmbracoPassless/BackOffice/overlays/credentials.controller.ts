import { CredentialsService } from "../services/credentialsService";
import { AttestationVerificationSuccess, UserCredential, UserCredentials } from "../types";

// TODO: define a type for this variable
declare const Umbraco: any;

// TODO: define a type for the model
export interface ICredentialsControllerScope extends angular.IScope {
    model: any;
}

export class CredentialsController {
    static $inject: Array<string> = ["$scope", "$http", "overlayService", "notificationsService", "UmbracoPassless.CredentialsService"];

    private state: string;
    private registrationAlias: string;
    private loading: boolean;


    private credentials: UserCredentials | null;

    // TODO: define types for the Umbraco services
    constructor(
        private $scope: ICredentialsControllerScope,
        private $http: angular.IHttpService,
        private overlayService: any,
        private notificationsService: any,
        private registrationService: CredentialsService
    ) {

        this.state = 'ready'
        this.registrationAlias = '';
        this.loading = true;
        this.credentials = null;
        this.init();
    }

    private init(): void {
        this.getCredentials();
    }

    public deleteCredentials(reg: UserCredential): void {
        this.overlayService.open({
            title: 'Confirm delete credentials',
            content: 'Are you sure you want to delete the credentials?',
            submitButtonLabel: 'Yes, delete',
            submitButtonStyle: 'danger',
            closeButtonLabel: 'Cancel',
            submit: () => {
                this.registrationService.deleteCredential(reg.credentialsId)
                    .then((response) => {
                        if (response.status == 200) {
                            this.notificationsService.success('Registration deleted. ' + reg.alias);
                            const index = this.credentials!.userCredentials.indexOf(reg);
                            this.credentials!.userCredentials.splice(index, 1);
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
        this.registrationService.getCredentials()
            .then(response => {
                this.credentials = response.data;
                this.loading = false;
            })
    }

    public addNewCredentials(): void {
        this.state = 'adding';
    }

    public submitRegisterPasslessForm(): void {
        this.registrationService.registerNewCredentials(this.registrationAlias)
            .then(success => {
                this.onKeyRegisteredWithServer(success.data.result)
            }, failure => {
                this.notificationsService.error(failure);
            })
    }

    public close(): void {
        if (this.$scope.model.close) {
            this.$scope.model.close();
        }
    }
    
    private onKeyRegisteredWithServer(credentials: AttestationVerificationSuccess): void {
        localStorage.setItem("lastCredentials", (credentials.credentialId))
        this.notificationsService.success(`Successfully added new credentials with the alias ${this.registrationAlias}`);
        this.state = 'ready';
        this.getCredentials();
    }

}