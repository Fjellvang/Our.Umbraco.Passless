import { CustomLoginController } from "./BackOffice/customlogin.controller";
import { CredentialsController } from "./BackOffice/overlays/credentials.controller";

(function () {

    const module = angular.module("umbraco");

    // controllers
    module.controller("UmbracoPassless.CustomLoginController", CustomLoginController);
    module.controller("UmbracoPassless.CredentialsController", CredentialsController);
})();