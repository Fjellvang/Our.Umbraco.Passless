﻿(function () {
    "use strict";

    function CustomLoginController($scope, $location, $http, userService, editorService) {

        var vm = this;
        vm.state = "login";
        vm.handleSignInSubmit = handleSignInSubmit;
        vm.loadingUmbracoIdSetting = true;
        vm.openFidoOverlay = openFidoOverlay;
        vm.assertionOptionsEndpoint = '/umbraco/backoffice/fido/assertionoptions';
        vm.makeAssertionEndpoint = '/umbraco/backoffice/fido/makeassertion';
        vm.lastCredentials = '';
        vm.useLastCredentials = true;
        vm.toggleLastCredentials = toggleLastCredentials;

        function init() {
            vm.lastCredentials = localStorage.getItem("lastCredentials");

            userService.isAuthenticated().then(function () {

                vm.state = "backoffice";
            }, function () {
            });
        }
        function toggleLastCredentials() {
            vm.useLastCredentials = !vm.useLastCredentials;
        }
        //Assertion
        async function handleSignInSubmit(e) {
            e.preventDefault();

            const response = await $http.post(vm.assertionOptionsEndpoint,
                JSON.stringify({
                    lastCredentialId: vm.useLastCredentials ? vm.lastCredentials : ''
                })
            );
            let makeAssertionOptions = response.data;

            // Turn the challenge back into the accepted format of padded base64
            makeAssertionOptions.challenge = coerceToArrayBuffer(makeAssertionOptions.challenge);
            makeAssertionOptions.allowCredentials = makeAssertionOptions.allowCredentials.map((c) => {
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

            localStorage.setItem("lastCredentials", assertedCredential.id);
            window.location.href = response.redirectUrl
        }


        //Registration
        function openFidoOverlay() 
        {
            editorService.open({
                title: 'Fido Registrations',
                view: '/App_Plugins/UmbracoFido/BackOffice/overlays/credentials.html',
                position: 'right',
                size: 'medium',
                close: x => {
                    editorService.close();
                }
                })
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoFido.CustomLoginController", CustomLoginController);
})();
