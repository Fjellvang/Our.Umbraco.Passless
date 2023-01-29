using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Services;
using System.Threading.Tasks;
using System.Threading;

namespace Our.Umbraco.Passless.Credentials.Endpoints
{

    [UmbracoRequireHttps]
    [DisableBrowserCache]
    [Area(UmbracoFidoConstants.AreaName)]
    public class CredentialsOptionsController : UmbracoAuthorizedController
    {
        private readonly IFido2 fido2;
        private readonly ICredentialsService credentialsService;

        public CredentialsOptionsController(IFido2 fido2, ICredentialsService credentialsService)
        {
            this.fido2 = fido2;
            this.credentialsService = credentialsService;
        }
        [HttpGet]
        public async Task<IActionResult> Index([FromQuery] bool crossPlatform, CancellationToken cancellationToken = default)
        {
            if (User.Identity is null)
            {
                throw new InvalidOperationException("Unexpected, user claims not initialized");
            }

            var useremail = User.Identity.GetEmail();

            var user = new Fido2User
            {
                DisplayName = useremail,
                Name = useremail,
                Id = Encoding.UTF8.GetBytes(useremail)
            };

            var existingKeys = (await credentialsService.GetCredentialsByUserIdAsync(useremail, cancellationToken))
                                .Select(x => x.Descriptor).ToList();

            var authenticatorSelection = new AuthenticatorSelection
            {
                RequireResidentKey = true,
                UserVerification = UserVerificationRequirement.Required //Since we're doing passwordless login, we require UserVerification
            };

            authenticatorSelection.AuthenticatorAttachment = crossPlatform ? AuthenticatorAttachment.CrossPlatform : AuthenticatorAttachment.Platform;

            var exts = new AuthenticationExtensionsClientInputs()
            {
                Extensions = true,
                UserVerificationMethod = true,
            };

            var options = fido2.RequestNewCredential(user, existingKeys, authenticatorSelection, AttestationConveyancePreference.None, exts);

            // 4. Temporarily store options, session/in-memory cache/redis/db
            HttpContext.Session.SetString("fido2.attestationOptions", options.ToJson());

            return new JsonResult(options);
        }
    }
}
