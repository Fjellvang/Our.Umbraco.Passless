using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.BackOffice.Security;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;
using static Umbraco.Cms.Core.Constants;
using Our.Umbraco.Passless.Credentials.Services;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Hosting;

namespace Our.Umbraco.Passless.Assertions.Endpoints
{
    [UmbracoRequireHttps]
    [DisableBrowserCache]
    [Area(UmbracoPasslessConstants.AreaName)]
    public class MakeAssertionController : UmbracoController
    {
        private readonly IFido2 fido2;
        private readonly ICredentialsService credentialsService;
        private readonly IBackOfficeSignInManager signInManager;
        private readonly IBackOfficeUserManager userService;
        private readonly string backOfficePath;

        public MakeAssertionController(IFido2 fido2,
                                       ICredentialsService credentialsService,
                                       IBackOfficeSignInManager signInManager,
                                       IOptionsMonitor<GlobalSettings> globalSettings,
                                       IHostingEnvironment hostingEnvironment,
                                       IBackOfficeUserManager userService)
        {
            this.fido2 = fido2;
            this.credentialsService = credentialsService;
            this.signInManager = signInManager;
            this.userService = userService;
            this.backOfficePath = globalSettings.CurrentValue.GetBackOfficePath(hostingEnvironment);
        }

        [HttpPost]
        public async Task<IActionResult> Index([FromBody] AuthenticatorAssertionRawResponse clientResponse, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Get the assertion options we sent the client TODO: Consider session alternatives? maybe make it configurable with default to session
                var jsonOptions = HttpContext.Session.GetString("fido2.assertionOptions");
                var options = AssertionOptions.FromJson(jsonOptions);

                var creds = await credentialsService.GetByDescriptorAsync(new PublicKeyCredentialDescriptor(clientResponse.Id));
                if (creds is null)
                {
                    return new UnauthorizedResult();
                }
                var publicKey = creds.PublicKey;
                uint storedCounter = creds.SignatureCounter;

                IsUserHandleOwnerOfCredentialIdAsync callback = async (args, cancellationToken) =>
                {
                    var storedCreds = await credentialsService.GetCredentialsByUserIdAsync(args.UserHandle);
                    return storedCreds.Select(x => x.Descriptor.Id).Any(c => c.SequenceEqual(args.CredentialId));
                };

                // 5. Make the assertion
                var res = await fido2.MakeAssertionAsync(clientResponse, options, publicKey, storedCounter, callback, cancellationToken: cancellationToken);

                // 6. update stored counter
                await credentialsService.UpdateCounterAsync(new PublicKeyCredentialDescriptor(res.CredentialId), res.Counter);

                //Sign the user in.
                var userEmail = Encoding.UTF8.GetString(creds.UserHandle);
                var user = await userService.FindByEmailAsync(userEmail);
                await signInManager.SignInAsync(user, true);

                return Ok(
                    new
                    {
                        RedirectUrl = backOfficePath,
                        Status = res.Status,
                        IsPasskey = creds.IsPasskey,
                        CredentialId = Convert.ToBase64String(res.CredentialId)
                    });
            }
            catch (Exception ex)
            {
                return Problem(ex.StackTrace, statusCode: (int)HttpStatusCode.InternalServerError, title: ex.Message);
            }
        }
    }
}
