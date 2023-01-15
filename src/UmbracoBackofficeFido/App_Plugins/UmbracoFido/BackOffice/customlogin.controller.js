(function () {
    "use strict";

    function CustomLoginController($scope, $location, userService, umbRequestHelper, $http, $cookies, authResource, currentUserResource) {

        var vm = this;
        vm.state = "login";
        vm.externalLoginFormAction = Umbraco.Sys.ServerVariables.umbracoUrls.externalLoginsUrl;
        vm.submitRegisterFidoForm = submitRegisterFidoForm;
        vm.handleSignInSubmit = handleSignInSubmit;
        vm.loadingUmbracoIdSetting = true;

        vm.assertionOptionsEndpoint = '/umbraco/backoffice/fido/assertionoptions';
        vm.makeAssertionEndpoint = '/umbraco/backoffice/fido/makeassertion';

        function init() {
            userService.isAuthenticated().then(function () {
                vm.state = "backoffice";
                // set the back office custom form oauth challenge endpoint to our UmbracoIdProfileEditController
                vm.credentialsOptionsEndpoint = Umbraco.Sys.ServerVariables.fidoLogin.urls.credentialsOptions;
                vm.makeCredentialsEndpoint    = Umbraco.Sys.ServerVariables.fidoLogin.urls.makeCredentials;

            }, function () {
                //Do we even need to do set state if not authenticated?
            });
        }
        //Assertion
        async function handleSignInSubmit(e) {
            e.preventDefault();
            const response = await fetch(vm.assertionOptionsEndpoint, {method: 'POST'});
            let makeAssertionOptions = await response.json();

            // Turn the challenge back into the accepted format of padded base64
            makeAssertionOptions.challenge = coerceToArrayBuffer(makeAssertionOptions.challenge);
            makeAssertionOptions.excludeCredentials = makeAssertionOptions.allowCredentials.map((c) => {
                c.id = coerceToArrayBuffer(c.id);
                return c;
            });

            // ask browser for credentials (browser will ask connected authenticators)
            let credential;
            try {
                credential = await navigator.credentials.get({ publicKey: makeAssertionOptions })
            } catch (err) {
                console.log(err.message ? err.message : err);
            }
            try {
                await verifyAssertionWithServer(credential);
            } catch (e) {
                console.log("Could not verify assertion" + e);
            }
        }

        /**
         * Sends the credential to the the FIDO2 server for assertion
         * @param {any} assertedCredential
         */
        async function verifyAssertionWithServer(assertedCredential) {
            // Move data into Arrays incase it is super long
            let authData = new Uint8Array(assertedCredential.response.authenticatorData);
            let clientDataJSON = new Uint8Array(assertedCredential.response.clientDataJSON);
            let rawId = new Uint8Array(assertedCredential.rawId);
            let sig = new Uint8Array(assertedCredential.response.signature);
            let userHandle = new Uint8Array(assertedCredential.response.userHandle)
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

            let response;
            try {
                let res = await fetch(vm.makeAssertionEndpoint, {
                    method: 'POST', // or 'PUT'
                    body: JSON.stringify(data), // data can be `string` or {object}!
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                response = await res.json();
            } catch (e) {
                throw e;
            }

            console.log("Assertion Object", response);

            //// show error
            if (response.status !== "ok") {
                console.log("Error doing assertion");
                console.log(response.errorMessage);
                return;
            }

            window.location.href = response.redirectUrl
        }


        //Registration
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
                method: 'POST', // or 'PUT'
                body: JSON.stringify(formData), // data can be `string` or {object}!
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            let data = await response.json();

            return data;
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoFido.CustomLoginController", CustomLoginController);
})();
