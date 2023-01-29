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
[Area(UmbracoFidoConstants.AreaName)]
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
            var jsonOptions = HttpContext.Session.GetString("fido2.attestationOptions");// This could just be posted to the endpoint aswell, but for now i'll do as in the Fido lib.
            var options = CredentialCreateOptions.FromJson(jsonOptions);

            // 2. Make is unique callback
            IsCredentialIdUniqueToUserAsyncDelegate isUniqueCallback = async (args, cancellationToken) =>
            {
                var credentials = await credentialsService.GetByDescriptorAsync(new PublicKeyCredentialDescriptor(args.CredentialId), cancellationToken); //TODO: Take a look again, do we want to new up a descriptor ???
                return credentials is null;
            };

            // 3. make the credentials
            var success = await fido2.MakeNewCredentialAsync(attestationResponse, options, isUniqueCallback, cancellationToken: cancellationToken);

            if (success.Result is null)
            {
                throw new InvalidOperationException("Unexpected, credentials result is null");
            }

            // 4. Add the credentials to the user. in the database.
            await credentialsService.AddCredential(new FidoCredentialModel(
                alias,
                options.User.Id,
                new PublicKeyCredentialDescriptor(success.Result.CredentialId),
                success.Result.PublicKey,
                success.Result.User.Id,
                success.Result.Counter,
                success.Result.CredType,
                DateTime.Now,
                success.Result.Aaguid
            ));


            return new JsonResult(success);
        }
        catch (Exception ex)
        {
            return Problem(ex.StackTrace, statusCode: (int)HttpStatusCode.InternalServerError, title: ex.Message);
        }
    }
}
