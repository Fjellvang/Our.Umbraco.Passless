(function () {
    "use strict";

    function RegistrationController($scope) {

        var vm = this;

        vm.submit = submit;
        vm.close = close;
        vm.state = 'ready'

        vm.submitRegisterFidoForm = submitRegisterFidoForm;
        vm.submitTest = submitTest;
        vm.addNewRegistration = addNewRegistration;
        vm.registrationAlias = '';

        function init() {
            vm.credentialsOptionsEndpoint = Umbraco.Sys.ServerVariables.fidoLogin.urls.credentialsOptions;
            vm.makeCredentialsEndpoint    = Umbraco.Sys.ServerVariables.fidoLogin.urls.makeCredentials;
        }

        function addNewRegistration() {
            vm.state = 'adding';
        }

        function submitTest() {
            alert(vm.registrationAlias);
            vm.state = 'ready';
        }

        async function submitRegisterFidoForm(e) {
            e.preventDefault();
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
            // redirect to dashboard?
            //window.location.href = "/dashboard/" + state.user.displayName;
        }

        //Copied from fido2-net-lib
        async function registerCredentialWithServer(formData) {
            let response = await fetch(vm.makeCredentialsEndpoint, {
                method: 'POST', 
                body: JSON.stringify(formData), // data can be `string` or {object}!
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            let data = await response.json();

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

    angular.module("umbraco").controller("UmbracoFido.RegistrationController", RegistrationController);
})();