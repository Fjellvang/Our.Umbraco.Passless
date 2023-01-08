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

        function submitRegisterFidoForm(e) {
            e.preventDefault();
            fetch(vm.fidoRegisterEndpoint)
                .then(x => x.json())
                .then(makeCredentialOptions => {
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
                    }).then((success) => {
                        console.log("sucess");
                        console.log(success);
                    });
                });
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoFido.CustomLoginController", CustomLoginController);
})();
