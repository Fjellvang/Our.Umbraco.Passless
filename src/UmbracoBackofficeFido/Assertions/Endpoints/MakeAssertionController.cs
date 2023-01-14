using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using UmbracoFidoLogin.Credentials.Services;
using static Umbraco.Cms.Core.Constants;

namespace UmbracoFidoLogin.Assertions.Endpoints
{
    [UmbracoRequireHttps]
    [DisableBrowserCache]
    [Area(UmbracoFidoConstants.AreaName)]
    public class MakeAssertionController : UmbracoController
    {
        private readonly IFido2 fido2;
        private readonly ICredentialsService credentialsService;

        public MakeAssertionController(IFido2 fido2, ICredentialsService credentialsService)
        {
            this.fido2 = fido2;
            this.credentialsService = credentialsService;
        }

        [HttpPost]
        public async Task<IActionResult> Index([FromBody] AuthenticatorAssertionRawResponse clientResponse, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Get the assertion options we sent the client TODO: Consider session alternatives? maybe make it configurable with default to session
                var jsonOptions = HttpContext.Session.GetString("fido2.assertionOptions");
                var options = AssertionOptions.FromJson(jsonOptions);

                // TODO: 2. Get stored Public key and stored counter so we can verity. This was in my other implementation handled by azure b2c.
                var publicKey = Array.Empty<byte>();

                // TODO: 3. stored counter
                uint storedCounter = 0;

                // TODO: 4. Create callback to check if userhandle owns the credentialId
                IsUserHandleOwnerOfCredentialIdAsync callback = async (args, cancellationToken) =>
                {
                    var storedCreds = await credentialsService.GetByDescriptorAsync(new PublicKeyCredentialDescriptor(args.CredentialId));
                    return storedCreds.Select(x => x.Descriptor.Id.AsSpan()).Any(c => c.SequenceEqual(args.CredentialId));
                };

                // 5. Make the assertion
                var res = await fido2.MakeAssertionAsync(clientResponse, options, publicKey, storedCounter, callback, cancellationToken: cancellationToken);

                //TODO: 6. update stored counter

                // Update(res.credentialId, res.Counter);

                return new JsonResult(res);
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
