using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.BackOffice.Security;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[UmbracoRequireHttps]
[DisableBrowserCache]
[Area(UmbracoPasslessConstants.AreaName)]
public class VerifyResetCredentialsController : UmbracoApiController
{
    private const string backofficeLandingPageUrl = "/umbraco"; //todo read from settings
    private readonly IBackOfficeSignInManager signInManager;
    private readonly IBackOfficeUserManager userManager;
    private readonly ILogger<VerifyResetCredentialsController> logger;

    public VerifyResetCredentialsController(IBackOfficeSignInManager signInManager,
        IBackOfficeUserManager userManager,
        ILogger<VerifyResetCredentialsController> logger
        )
    {
        this.signInManager = signInManager;
        this.userManager = userManager;
        this.logger = logger;
    }

    // Logic copied from CMS Source - needs to be adapted
    [HttpGet]
    public async Task<IActionResult> Index([FromQuery] string invite)
    {
        AuthenticateResult authenticate = await this.AuthenticateBackOfficeAsync();

        //if you are hitting VerifyInvite, you're already signed in as a different user, and the token is invalid
        //you'll exit on one of the return RedirectToAction(nameof(Default)) but you're still logged in so you just get
        //dumped at the default admin view with no detail
        if (authenticate.Succeeded)
        {
            await signInManager.SignOutAsync();
        }

        if (string.IsNullOrWhiteSpace(invite))
        {
            logger.LogWarning("VerifyUser endpoint reached with invalid token: NULL");
            return new RedirectResult(backofficeLandingPageUrl);
        }

        var parts = WebUtility.UrlDecode(invite).Split('|');

        if (parts.Length != 2)
        {
            logger.LogWarning("VerifyUser endpoint reached with invalid token: {Invite}", invite);
            return new RedirectResult(backofficeLandingPageUrl);
        }

        var token = parts[1];

        var decoded = token.FromUrlBase64();
        if (decoded.IsNullOrWhiteSpace())
        {
            logger.LogWarning("VerifyUser endpoint reached with invalid token: {Invite}", invite);
            return new RedirectResult(backofficeLandingPageUrl);
        }

        var id = parts[0];

        BackOfficeIdentityUser? identityUser = await userManager.FindByIdAsync(id);
        if (identityUser == null)
        {
            logger.LogWarning("VerifyUser endpoint reached with non existing user: {UserId}", id);
            return new RedirectResult(backofficeLandingPageUrl);
        }

        var verified = await userManager.VerifyUserTokenAsync(identityUser, "Default", "ResetPassword", decoded);

        //IdentityResult result = await userManager.ConfirmEmailAsync(identityUser, decoded!);

        if (!verified)
        {
            logger.LogWarning("Could not verify token");
            return new RedirectResult("/umbraco#/login/false?invite=3");
        }

        //sign the user in
        DateTime? previousLastLoginDate = identityUser.LastLoginDateUtc;
        await signInManager.SignInAsync(identityUser, false);
        //reset the lastlogindate back to previous as the user hasn't actually logged in, to add a flag or similar to BackOfficeSignInManager would be a breaking change
        identityUser.LastLoginDateUtc = previousLastLoginDate;
        await userManager.UpdateAsync(identityUser);

        return new RedirectResult("/umbraco#/login/false?invite=1");
    }
}
