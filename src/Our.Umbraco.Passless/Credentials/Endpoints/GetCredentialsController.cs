using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Services;
using Our.Umbraco.Passless.Credentials.Models;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[UmbracoRequireHttps]
[DisableBrowserCache]
[Area(UmbracoFidoConstants.AreaName)]
public class GetCredentialsController : UmbracoAuthorizedController
{
    private readonly ICredentialsService credentialsService;

    public GetCredentialsController(ICredentialsService credentialsService)
    {
        this.credentialsService = credentialsService;
    }

    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken cancellationToken = default)
    {
        var userEmail = User.Identity?.GetEmail();
        if (string.IsNullOrEmpty(userEmail))
        {
            throw new InvalidOperationException("Unexpected: User email is null");
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
