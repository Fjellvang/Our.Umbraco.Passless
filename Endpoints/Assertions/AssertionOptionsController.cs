using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;

namespace UmbracoFidoLoginCore.Endpoints.Assertions
{
    [UmbracoRequireHttps]
    [DisableBrowserCache]
    [Area(UmbracoFidoConstants.AreaName)]
    public class AssertionOptionsController : UmbracoController
    {
        private readonly IFido2 fido2;

        public AssertionOptionsController(IFido2 fido2)
        {
            this.fido2 = fido2;
        }

        [HttpPost]
        public IActionResult Index()
        {
            var options = fido2.GetAssertionOptions(
                new List<PublicKeyCredentialDescriptor>(),
                UserVerificationRequirement.Discouraged,
                new AuthenticationExtensionsClientInputs
                {
                    UserVerificationMethod = true
                }
                );

            // Temporarily store options, session/in-memory cache/redis/db
            HttpContext.Session.SetString("fido2.assertionOptions", options.ToJson());

            //  Return options to client
            return Json(options);
        }
    }
}
