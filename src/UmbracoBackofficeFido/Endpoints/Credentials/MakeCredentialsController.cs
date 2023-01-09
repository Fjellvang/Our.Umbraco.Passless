using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using UmbracoFidoLoginCore.Persistance;

namespace UmbracoFidoLogin.Endpoints.Credentials;

[UmbracoRequireHttps]
[DisableBrowserCache]
[Area(UmbracoFidoConstants.AreaName)]
public class MakeCredentialsController : UmbracoAuthorizedController
{
    private readonly IFido2 fido2;
    private readonly IFidoCredentialRepository fidoCredentialRepository;

    public MakeCredentialsController(IFido2 fido2, IFidoCredentialRepository fidoCredentialRepository)
    {
        this.fido2 = fido2;
        this.fidoCredentialRepository = fidoCredentialRepository;
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

            // 4. TODO: Add the credentials to the user. in the database.
            // TODO: DO not use repository directly. Add service and mapping
            await fidoCredentialRepository.UpsertAsync(new Persistence.FidoCredentialEntity()
            {
                Descriptor = success.Result.CredentialId,
                PublicKey = success.Result.PublicKey,
                UserHandle = success.Result.User.Id,
                SignatureCounter = success.Result.Counter,
                CredType = success.Result.CredType,
                RegDate = DateTime.Now,
                AaGuid = success.Result.Aaguid
            });
        

            return new JsonResult(success);
        }
        catch (Exception)
        {
            //TODO: cleanup error message
            throw;
        }
    }
}
