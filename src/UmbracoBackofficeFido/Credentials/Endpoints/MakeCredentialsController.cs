using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using UmbracoFidoLogin.Credentials.Services;

namespace UmbracoFidoLogin.Credentials.Endpoints;

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
    public async Task<IActionResult> Index([FromBody] AuthenticatorAttestationRawResponse attestationResponse, CancellationToken cancellationToken)
    {
        try
        {
            // 1. get the options we sent the client
            var jsonOptions = HttpContext.Session.GetString("fido2.attestationOptions");// This could just be posted to the endpoint aswell, but for now i'll do as in the Fido lib.
            var options = CredentialCreateOptions.FromJson(jsonOptions);

            // 2. Make is unique callback
            IsCredentialIdUniqueToUserAsyncDelegate isUniqueCallback = async (args, cancellationToken) =>
            {
                var users = await credentialsService.GetByDescriptorAsync(new PublicKeyCredentialDescriptor(args.CredentialId), cancellationToken); //TODO: Take a look again, do we want to new up a descriptor ???
                return !(users.Count > 0);
            };

            // 3. make the credentials
            var success = await fido2.MakeNewCredentialAsync(attestationResponse, options, isUniqueCallback, cancellationToken: cancellationToken);

            if (success.Result is null)
            {
                throw new InvalidOperationException("Unexpected, credentials result is null");
            }

            // 4. Add the credentials to the user. in the database.
            await credentialsService.AddCredential(new Fido2NetLib.Development.StoredCredential()
            {
                UserId = options.User.Id,
                Descriptor = new PublicKeyCredentialDescriptor(success.Result.CredentialId),
                PublicKey = success.Result.PublicKey,
                UserHandle = success.Result.User.Id,
                SignatureCounter = success.Result.Counter,
                CredType = success.Result.CredType,
                RegDate = DateTime.Now,
                AaGuid = success.Result.Aaguid
            });


            return new JsonResult(success);
        }
        catch (Exception ex)
        {
            return Problem(ex.StackTrace, statusCode: (int)HttpStatusCode.InternalServerError, title: ex.Message);
        }
    }
}
