using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Services;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[UmbracoRequireHttps]
[DisableBrowserCache]
[Area(UmbracoPasslessConstants.AreaName)]
public class DeleteCredentialsController : UmbracoAuthorizedController
{
    private readonly ICredentialsService credentialsService;

    public DeleteCredentialsController(ICredentialsService credentialsService)
    {
        this.credentialsService = credentialsService;
    }

    [HttpPost]
    public async Task<IActionResult> Index(string id)
    {
        var userEmail = User.Identity?.GetEmail();
        if (string.IsNullOrEmpty(userEmail))
        {
            throw new InvalidOperationException("Unexpected: User email is null");
        }

        await credentialsService.DeleteCredentialsAsync(userEmail, new PublicKeyCredentialDescriptor(Convert.FromHexString(id)));

        return Ok();
    }
}
