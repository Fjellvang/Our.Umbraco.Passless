using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Our.Umbraco.Passless.Credentials.Services;
using Our.Umbraco.Passless.Credentials.Models;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[UmbracoRequireHttps]
[DisableBrowserCache]
[Area(UmbracoPasslessConstants.AreaName)]
public class MakeCredentialsController : UmbracoAuthorizedController
{
    private readonly IFido2 fido2;
    private readonly ICredentialsService credentialsService;

    public MakeCredentialsController(IFido2 fido2, ICredentialsService credentialsService)
    {
        this.fido2 = fido2;
        this.credentialsService = credentialsService;
    }

    [HttpPost]
    public async Task<IActionResult> Index([FromQuery] string alias, [FromBody] AuthenticatorAttestationRawResponse attestationResponse, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(alias))
        {
            return BadRequest("The alias field is required");
        }
        try
        {
            // 1. get the options we sent the client
            var jsonOptions = HttpContext.Session.GetString("fido2.attestationOptions"); // Get this from interface implementation so consumers can decide how to store the challenge 
            var options = CredentialCreateOptions.FromJson(jsonOptions);

            // 2. Make is unique callback
            IsCredentialIdUniqueToUserAsyncDelegate isUniqueCallback = async (args, cancellationToken) =>
            {
                var credentials = await credentialsService.GetByDescriptorAsync(new PublicKeyCredentialDescriptor(args.CredentialId), cancellationToken); 
                return credentials is null;
            };

            // 3. make the credentials
            var success = await fido2.MakeNewCredentialAsync(attestationResponse, options, isUniqueCallback, cancellationToken: cancellationToken);

            if (success.Result is null)
            {
                throw new InvalidOperationException("Unexpected, credentials result is null");
            }

            var isPasskey = success.Result.CredType.Equals("none", StringComparison.Ordinal); //TODO: This is not 100% correct. Local testing shows that if we request attestation and signin with passkeys, none is returned. There might be other cross-platform authenticators which return none?
            // 4. Add the credentials to the user. in the database.
            await credentialsService.AddCredential(new FidoCredentialModel(
                alias,
                options.User.Id,
                new PublicKeyCredentialDescriptor(success.Result.CredentialId),
                success.Result.PublicKey,
                success.Result.User.Id,
                success.Result.Counter,
                success.Result.CredType,
                DateTime.UtcNow,
                success.Result.Aaguid,
                isPasskey
            ));


            return new JsonResult(new
            {
                CredentialId = success.Result.CredentialId,
                IsPassKey = isPasskey
            });
        }
        catch (Exception ex)
        {
            return Problem(ex.StackTrace, statusCode: (int)HttpStatusCode.InternalServerError, title: ex.Message);
        }
    }
}
