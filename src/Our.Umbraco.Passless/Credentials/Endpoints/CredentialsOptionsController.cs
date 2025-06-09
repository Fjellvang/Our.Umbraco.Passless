using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using Asp.Versioning;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Services;
using Umbraco.Cms.Api.Management.Routing;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[ApiVersion("1.0")]
[VersionedApiBackOfficeRoute("passless/credentials/options")]
[ApiExplorerSettings(GroupName = "Passless")]
public class CredentialsOptionsController : ManagementApiControllerBase
{
    private readonly IFido2 fido2;
    private readonly ICredentialsService credentialsService;

    public CredentialsOptionsController(IFido2 fido2, ICredentialsService credentialsService)
    {
        this.fido2 = fido2;
        this.credentialsService = credentialsService;
    }
    
    [HttpGet]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(typeof(CredentialCreateOptions), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCredentialOptions([FromQuery] bool? crossPlatform, CancellationToken cancellationToken = default)
    {
        if (User.Identity is null)
        {
            throw new InvalidOperationException("Unexpected, user claims not initialized");
        }

        var useremail = User.Identity.GetEmail();

        if (useremail is null)
        {
            throw new InvalidOperationException("Unexpected, user email is null");
        }

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

        if (crossPlatform.HasValue)
        {
            authenticatorSelection.AuthenticatorAttachment = crossPlatform.Value ? AuthenticatorAttachment.CrossPlatform : AuthenticatorAttachment.Platform;
        }

        var exts = new AuthenticationExtensionsClientInputs()
        {
            Extensions = true,
            UserVerificationMethod = true,
        };

        var options = fido2.RequestNewCredential(user, existingKeys, authenticatorSelection, AttestationConveyancePreference.Direct, exts);

        // 4. Temporarily store options, session/in-memory cache/redis/db
        HttpContext.Session.SetString("fido2.attestationOptions", options.ToJson());

        return new JsonResult(options);
    }
}
