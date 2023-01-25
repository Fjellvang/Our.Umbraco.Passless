(function () {
    "use strict";

    function CredentialsController($scope, $http, overlayService, notificationsService) {

        var vm = this;

        vm.submit = submit;
        vm.close = close;
        vm.state = 'ready'

        vm.getCredentials = getCredentials;
        vm.submitRegisterFidoForm = submitRegisterFidoForm;
        vm.submitTest = submitTest;
        vm.addNewCredentials = addNewCredentials;
        vm.deleteCredentials = deleteCredentials;
        vm.registrationAlias = '';
        vm.loading = true;

        function init() {
            vm.credentialsOptionsEndpoint = Umbraco.Sys.ServerVariables.fidoLogin.urls.credentialsOptions;
            vm.makeCredentialsEndpoint    = Umbraco.Sys.ServerVariables.fidoLogin.urls.makeCredentials;
            vm.getCredentialsEndpoint    = Umbraco.Sys.ServerVariables.fidoLogin.urls.getCredentials;
            vm.deleteCredentialsEndpoint    = Umbraco.Sys.ServerVariables.fidoLogin.urls.deleteCredentials;
            getCredentials();
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

        function submitTest() {
            alert('testtwo ' + vm.registrationAlias);

        }

        async function submitRegisterFidoForm() {
            console.log(`Submitting ${vm.registrationAlias}`)

            const response = await fetch(vm.credentialsOptionsEndpoint);
            let makeCredentialOptions = await response.json();

            // Turn the challenge back into the accepted format of padded base64
            makeCredentialOptions.challenge = coerceToArrayBuffer(makeCredentialOptions.challenge);
            // Turn ID into a UInt8Array Buffer for some reason
            makeCredentialOptions.user.id = coerceToArrayBuffer(makeCredentialOptions.user.id);

            makeCredentialOptions.excludeCredentials = makeCredentialOptions.excludeCredentials.map((c) => {
                c.id = coerceToArrayBuffer(c.id);
                return c;
            });

            if (makeCredentialOptions.authenticatorSelection.authenticatorAttachment === null) makeCredentialOptions.authenticatorSelection.authenticatorAttachment = undefined;

            const newCredential = await navigator.credentials.create({
                publicKey: makeCredentialOptions
            });

            console.log("success");

            await registerNewCredential(newCredential);
        }

        // This should be used to verify the auth data with the server
        async function registerNewCredential(newCredential) {
            // Move data into Arrays incase it is super long
            let attestationObject = new Uint8Array(newCredential.response.attestationObject);
            let clientDataJSON = new Uint8Array(newCredential.response.clientDataJSON);
            let rawId = new Uint8Array(newCredential.rawId);

            const data = {
                id: newCredential.id,
                rawId: coerceToBase64Url(rawId),
                type: newCredential.type,
                extensions: newCredential.getClientExtensionResults(),
                response: {
                    attestationObject: coerceToBase64Url(attestationObject),
                    clientDataJSON: coerceToBase64Url(clientDataJSON)
                }
            };

            let response;
            try {
                response = await registerCredentialWithServer(data);
            } catch (e) {
                console.log("Server error " + e);
            }

            console.log("Credential Object", response);

            // TODO: show error
            if (response.status !== "ok") {
                console.log("Error creating credential");
                console.log(response.errorMessage);
                return;
            }

            // TODO: show success 
            console.log("Success");
            notificationsService.success(`Successfully added new credentials with the alias ${vm.registrationAlias}`);
            getCredentials();
            // redirect to dashboard?
            //window.location.href = "/dashboard/" + state.user.displayName;
        }

        //Copied from fido2-net-lib
        async function registerCredentialWithServer(formData) {
            let response = await fetch(`${vm.makeCredentialsEndpoint}?alias=${vm.registrationAlias}`, {
                method: 'POST', 
                body: JSON.stringify(formData), // data can be `string` or {object}!
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            let data = await response.json();

            vm.state = 'ready';
            return data;
        }


        function submit() {
            if ($scope.model.submit) {
                $scope.model.submit($scope.model);
            }
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoFido.CredentialsController", CredentialsController);
})();