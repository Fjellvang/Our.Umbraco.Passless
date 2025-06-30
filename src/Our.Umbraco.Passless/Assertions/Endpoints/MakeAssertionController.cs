using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text;
using System.Text.Json;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Services;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Hosting;
using Umbraco.Cms.Web.Common.Security;

namespace Our.Umbraco.Passless.Assertions.Endpoints
{
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
            this.backOfficePath =
                "umbraco/section/content"; //globalSettings.CurrentValue.GetBackOfficePath(hostingEnvironment);
        }

        [HttpPost]
        public async Task<IActionResult> Index(CancellationToken cancellationToken)
        {
            try
            {
                var clientResponse = await ParseBody(cancellationToken);

                if (clientResponse == null)
                {
                    return BadRequest("Client response is null");
                }
                // 1. Get the assertion options we sent the client TODO: Consider session alternatives? maybe make it configurable with default to session
                var assertionOptionsString = HttpContext.Session.GetString("fido2.assertionOptions");
                var options = AssertionOptions.FromJson(assertionOptionsString);

                var creds = await credentialsService.GetByDescriptorAsync(new PublicKeyCredentialDescriptor(clientResponse.Id), cancellationToken);
                if (creds is null)
                {
                    return new UnauthorizedResult();
                }
                var publicKey = creds.PublicKey;
                uint storedCounter = creds.SignatureCounter;

                IsUserHandleOwnerOfCredentialIdAsync callback = async (args, ct) =>
                {
                    var storedCreds = await credentialsService.GetCredentialsByUserIdAsync(args.UserHandle, ct);
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

        private async Task<AuthenticatorAssertionRawResponse?> ParseBody(CancellationToken cancellationToken)
        {
            string json;
            // Manually deserialize the request body to handle both System.Text.Json and Newtonsoft.Json
            AuthenticatorAssertionRawResponse? clientResponse;
            using (var reader = new StreamReader(Request.Body))
            {
                json = await reader.ReadToEndAsync(cancellationToken);

                try
                {
                    clientResponse = JsonSerializer.Deserialize<AuthenticatorAssertionRawResponse>(json);
                }
                catch
                {
                    // return BadRequest("Invalid JSON format");
                    clientResponse = null;  
                }
            }

            return clientResponse;
        }
    }
}
