using Asp.Versioning;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Services;
using Umbraco.Cms.Api.Management.Routing;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[ApiVersion("1.0")]
[VersionedApiBackOfficeRoute("passless/credentials/delete")]
[ApiExplorerSettings(GroupName = "Passless")]
public class DeleteCredentialsController : ManagementApiControllerBase
{
    private readonly ICredentialsService credentialsService;

    public DeleteCredentialsController(ICredentialsService credentialsService)
    {
        this.credentialsService = credentialsService;
    }

    [HttpPost]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteCredential([FromQuery] string id)
    {
        var userEmail = User.Identity?.GetEmail();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is not available");
        }

        if (string.IsNullOrEmpty(id))
        {
            return BadRequest("Credential ID is required");
        }

        await credentialsService.DeleteCredentialsAsync(userEmail, new PublicKeyCredentialDescriptor(Convert.FromHexString(id)));

        return Ok();
    }
}
