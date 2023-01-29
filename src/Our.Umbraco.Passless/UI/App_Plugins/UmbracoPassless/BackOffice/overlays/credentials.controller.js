(function () {
    "use strict";

    function CredentialsController($scope, $http, overlayService, notificationsService) {
        var vm = this;
        vm.close = close;
        vm.state = 'ready'

        vm.getCredentials = getCredentials;
        vm.submitRegisterPasslessForm = submitRegisterPasslessForm;
        vm.addNewCredentials = addNewCredentials;
        vm.deleteCredentials = deleteCredentials;
        vm.onCrossplaftormChange = onCrossplaftormChange;
        vm.registrationAlias = '';
        vm.crossPlatform = true;
        vm.loading = true;

        function init() {
            vm.credentialsOptionsEndpoint = Umbraco.Sys.ServerVariables.passlessLogin.urls.credentialsOptions;
            vm.makeCredentialsEndpoint    = Umbraco.Sys.ServerVariables.passlessLogin.urls.makeCredentials;
            vm.getCredentialsEndpoint    = Umbraco.Sys.ServerVariables.passlessLogin.urls.getCredentials;
            vm.deleteCredentialsEndpoint    = Umbraco.Sys.ServerVariables.passlessLogin.urls.deleteCredentials;
            getCredentials();
        }

        function onCrossplaftormChange() {
            console.log("changed");
            vm.crossPlatform = !vm.crossPlatform;
        }

        function deleteCredentials(reg) {
            overlayService.open({
                title: 'Confirm delete credentials',
                content: 'Are you sure you want to delete the credentials?',
                submitButtonLabel: 'Yes, delete',
                submitButtonStyle: 'danger',
                closeButtonLabel: 'Cancel',
                submit: () => {
                    $http.post(`${vm.deleteCredentialsEndpoint}?id=${reg.credentialsId}`)
                        .then((response) => {
                            if (response.status == 200) {
                                notificationsService.success('Registration deleted. ' + reg.alias);
                                const index = vm.credentials.userCredentials.indexOf(reg);
                                vm.credentials.userCredentials.splice(index, 1);
                            } else {
                                notificationsService.error('Error deleting registration.');
                            }
                        overlayService.close();
                    }, () => {
                        notificationsService.error('Error deleting registration.');
                    });
                },
                close: () => {
                    overlayService.close();
                },
            });
        }

        function getCredentials() {
            vm.loading = true;
            $http.get(vm.getCredentialsEndpoint)
                .then(response => {
                    vm.credentials = response.data;
                    vm.loading = false;
                })
        }

        function addNewCredentials() {
            vm.state = 'adding';
        }

        function submitRegisterPasslessForm() {
            console.log(`Submitting ${vm.registrationAlias}`)

            $http.get(`${vm.credentialsOptionsEndpoint}?crossPlatform=${vm.crossPlatform}`)
                .then(success => {
                    const makeCredentialsOptions = success.data;

                    handleUserCredentials(makeCredentialsOptions);
                }, failure => {
                    console.log(failure);
                    notificationsService.error(`failed getting credential options from server`);
                });

        } 

        function handleUserCredentials(makeCredentialOptions) {
             // Turn the challenge back into the accepted format of padded base64
            makeCredentialOptions.challenge = coerceToArrayBuffer(makeCredentialOptions.challenge);
            // Turn ID into a UInt8Array Buffer for some reason
            makeCredentialOptions.user.id = coerceToArrayBuffer(makeCredentialOptions.user.id);

            makeCredentialOptions.excludeCredentials = makeCredentialOptions.excludeCredentials.map((c) => {
                c.id = coerceToArrayBuffer(c.id);
                return c;
            });

            if (makeCredentialOptions.authenticatorSelection.authenticatorAttachment === null) makeCredentialOptions.authenticatorSelection.authenticatorAttachment = undefined;

            navigator.credentials.create({
                publicKey: makeCredentialOptions
            }).then(newCredential => {
                prepareNewCredentials(newCredential);
            }, failure => {
                console.log(failure);
                notificationsService.error("Failed to register authenticator, possibly due to it already being registered");
            });
        }

        function prepareNewCredentials(newCredentials) {
            // Move data into Arrays incase it is super long
            const attestationObject = new Uint8Array(newCredentials.response.attestationObject);
            const clientDataJSON = new Uint8Array(newCredentials.response.clientDataJSON);
            const rawId = new Uint8Array(newCredentials.rawId);
            const base64UrlRawId = coerceToBase64Url(rawId);

            localStorage.setItem("lastCredentials", btoa(rawId));

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

            registerCredentialWithServer(data)
                .then(success => {
                    onKeyRegisteredWithServer(success.data.result);
                }, failure => {
                    notificationsService.error("Failed to add authenticator to you account");
                    console.log("Error creating credential");
                    console.log(failure);
                });
        }

        function onKeyRegisteredWithServer(credentials) {
            localStorage.setItem("lastCredentials", credentials.credentialId)
            notificationsService.success(`Successfully added new credentials with the alias ${vm.registrationAlias}`);
            vm.state = 'ready';
            getCredentials();
        }

        function registerCredentialWithServer(formData) {
            const body = JSON.stringify(formData);
            return $http.post(`${vm.makeCredentialsEndpoint}?alias=${vm.registrationAlias}`, body);
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoPassless.CredentialsController", CredentialsController);
})();