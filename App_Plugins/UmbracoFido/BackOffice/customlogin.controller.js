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
                    console.log(coerceToArrayBuffer(makeCredentialOptions.challenge));
                });
        }

        init();
    }

    angular.module("umbraco").controller("UmbracoFido.CustomLoginController", CustomLoginController);
})();
