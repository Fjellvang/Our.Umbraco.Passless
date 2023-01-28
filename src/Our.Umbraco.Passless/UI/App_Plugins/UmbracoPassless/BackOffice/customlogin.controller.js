(function () {
    "use strict";

    function CustomLoginController($scope, $window, $http, userService, editorService) {

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
            }, () => { });
        }
        function toggleLastCredentials() {
            vm.useLastCredentials = !vm.useLastCredentials;
        }
        //Assertion
        function handleSignInSubmit() {
            $http.post(vm.assertionOptionsEndpoint,
                JSON.stringify({
                    lastCredentialId: vm.useLastCredentials ? vm.lastCredentials : ''
                })
            ).then(success => {
                getCredentials(success.data);
            });
        }

        function getCredentials(makeAssertionOptions) {
            // Turn the challenge back into the accepted format of padded base64
            makeAssertionOptions.challenge = coerceToArrayBuffer(makeAssertionOptions.challenge);
            makeAssertionOptions.allowCredentials = makeAssertionOptions.allowCredentials.map((c) => {
                c.id = coerceToArrayBuffer(c.id);
                return c;
            });

            // ask browser for credentials (browser will ask connected authenticators)
           navigator.credentials.get({ publicKey: makeAssertionOptions })
                .then(credential => {
                    verifyAssertionWithServer(credential);
                })
        }

        /**
         * Sends the credential to the the FIDO2 server for assertion
         * @param {any} assertedCredential
         */
        function verifyAssertionWithServer(assertedCredential) {
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

            $http.post(vm.makeAssertionEndpoint,JSON.stringify(data))
                .then(success => {
                    const response = success.data;
                    $window.location.href = response.redirectUrl
                }, () => {
                    console.log("Error doing assertion");
                    //TODO: Do some proper error messaging
                });
        }


        //Registration
        function openFidoOverlay() 
        {
            editorService.open({
                title: 'Fido Registrations',
                view: '/App_Plugins/UmbracoPassless/BackOffice/overlays/credentials.html',
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
