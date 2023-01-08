(function () {
    "use strict";

    function CustomLoginController($scope, $location, userService, umbRequestHelper, $http, $cookies, authResource, currentUserResource) {

        var vm = this;
        vm.state = "login";
        vm.externalLoginFormAction = Umbraco.Sys.ServerVariables.umbracoUrls.externalLoginsUrl;
        vm.submitRegisterFidoForm = submitRegisterFidoForm;
        vm.loadingUmbracoIdSetting = true;


        function init() {
            userService.isAuthenticated().then(function () {
                vm.state = "backoffice";
                // set the back office custom form oauth challenge endpoint to our UmbracoIdProfileEditController
                vm.fidoRegisterEndpoint = Umbraco.Sys.ServerVariables.fidoLogin.urls.credentialsOptions;

            }, function () {
                //Do we even need to do set state if not authenticated?
            });
        }

        async function submitRegisterFidoForm(e) {
            e.preventDefault();
            const response = await fetch(vm.fidoRegisterEndpoint);
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

            console.log(newCredential);
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoFido.CustomLoginController", CustomLoginController);
})();
