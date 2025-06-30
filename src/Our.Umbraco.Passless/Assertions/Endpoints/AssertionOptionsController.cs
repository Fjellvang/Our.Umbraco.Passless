using System.Text.Json;
using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Our.Umbraco.Passless.Assertions.Models;

namespace Our.Umbraco.Passless.Assertions.Endpoints
{
    [DisableBrowserCache]
    [Area(UmbracoPasslessConstants.AreaName)]
    public class AssertionOptionsController : UmbracoController
    {
        private readonly IFido2 fido2;

        public AssertionOptionsController(IFido2 fido2)
        {
            this.fido2 = fido2;
        }

        /// <summary>
        /// Returns the Assertion options used by WebAuthN to collect the user Assertion
        /// </summary>
        /// <param name="lastCredentialId">base64 encoded credential id, which can help the user sign in quicker</param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult Index([FromBody] AssertionOptionsRequest assertionOptions)
        {
            var allowedCredentials = new List<PublicKeyCredentialDescriptor>();
            if (!string.IsNullOrEmpty(assertionOptions.LastCredentialId))
            {
                var credentialId = Convert.FromBase64String(assertionOptions.LastCredentialId);
                PublicKeyCredentialDescriptor item = new(credentialId);
                allowedCredentials.Add(item);
            }

            var options = fido2.GetAssertionOptions(
                allowedCredentials,
                UserVerificationRequirement.Required,
                new AuthenticationExtensionsClientInputs
                {
                    UserVerificationMethod = true
                }
            );

            // Temporarily store options, session/in-memory cache/redis/db
            HttpContext.Session.SetString("fido2.assertionOptions", options.ToJson());

            // Use local JsonOptions, since the umbraco solution might have passed custom options
            // which could cause our code to fail.
            var jsonOptions = new JsonSerializerOptions {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };
            //  Return options to client
            return Json(options, jsonOptions);
        }
    }
}
