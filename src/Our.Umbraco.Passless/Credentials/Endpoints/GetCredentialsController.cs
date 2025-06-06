using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Services;
using Our.Umbraco.Passless.Credentials.Models;
using Umbraco.Cms.Api.Management.Routing;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[ApiVersion("1.0")]
[VersionedApiBackOfficeRoute("passless/credentials")]
[ApiExplorerSettings(GroupName = "Passless")]
public class GetCredentialsController : ManagementApiControllerBase
{
    private readonly ICredentialsService credentialsService;

    public GetCredentialsController(ICredentialsService credentialsService)
    {
        this.credentialsService = credentialsService;
    }

    [HttpGet]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(typeof(UserCredentialsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCredentials(CancellationToken cancellationToken = default)
    {
        var userEmail = User.Identity?.GetEmail();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest("User email is not available");
        }

        var credentials = await credentialsService.GetCredentialsByUserIdAsync(userEmail, cancellationToken);

        return Ok(new UserCredentialsResponse()
        {
            UserEmail = userEmail,
            UserCredentials = credentials.Select(x => new UserCredentialResponse()
            {
                Alias = x.Alias,
                CredentialsId = Convert.ToHexString(x.Descriptor.Id)
            }).ToArray()
        });
    }
}
