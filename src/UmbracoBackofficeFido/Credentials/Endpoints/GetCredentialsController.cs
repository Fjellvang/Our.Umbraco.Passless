﻿using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;
using UmbracoFidoLogin.Credentials.Models;
using UmbracoFidoLogin.Credentials.Services;

namespace UmbracoFidoLogin.Credentials.Endpoints;

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

        return Ok(new UserCredentialResponse()
        {
            UserEmail = userEmail,
            UserCredentials = credentials.Select(x => new UserCredentialsResponse()
            {
                CredentialAlias = "TODO",
                CredentialsId = x.Descriptor.Id
            }).ToArray()
        });
    }
}