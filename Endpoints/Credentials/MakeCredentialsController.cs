using Fido2NetLib;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;

namespace UmbracoFidoLoginCore.Endpoints.Credentials;

[UmbracoRequireHttps]
[DisableBrowserCache]
[Area(UmbracoFidoConstants.AreaName)]
public class MakeCredentialsController : UmbracoAuthorizedController
{
    private readonly IFido2 fido2;

    public MakeCredentialsController(IFido2 fido2)
    {
        this.fido2 = fido2;
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
            IsCredentialIdUniqueToUserAsyncDelegate isUniqueCallback = static async (args, cancellationToken) =>
            {
                return true; // TODO: Integrate with Database when we have migrations etc setup
            };

            // 3. make the credentials
            var success = await fido2.MakeNewCredentialAsync(attestationResponse, options, isUniqueCallback, cancellationToken: cancellationToken);

            // 4. TODO: Add the credentials to the user.
            return new JsonResult(success);
        }
        catch (Exception)
        {
            //TODO: cleanup error message
            throw;
        }
    }
}
