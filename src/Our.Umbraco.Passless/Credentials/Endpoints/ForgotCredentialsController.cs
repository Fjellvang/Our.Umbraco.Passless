﻿using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Our.Umbraco.Passless.Assertions.Endpoints;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Mail;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Email;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Extensions;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[UmbracoRequireHttps]
[DisableBrowserCache]
[Area(UmbracoPasslessConstants.AreaName)]
public class ForgotCredentialsController : UmbracoApiController
{
    private readonly IBackOfficeUserManager userManager;
    private readonly IUserService userService;
    private readonly GlobalSettings globalSettings;
    private readonly IEmailSender emailSender;
    private readonly ILocalizedTextService textService;
    private readonly LinkGenerator linkGenerator;
    private readonly WebRoutingSettings webRoutingSettings;

    public ForgotCredentialsController(IBackOfficeUserManager userManager,
                                       IUserService userService,
                                       IOptionsSnapshot<GlobalSettings> globalSettings,
                                       IEmailSender emailSender,
                                       ILocalizedTextService textService,
                                       LinkGenerator linkGenerator,
                                       IOptions<WebRoutingSettings> webRoutingSettings
        )
    {
        this.userManager = userManager;
        this.userService = userService;
        this.globalSettings = globalSettings.Value;
        this.emailSender = emailSender;
        this.textService = textService;
        this.linkGenerator = linkGenerator;
        this.webRoutingSettings = webRoutingSettings.Value;
    }

    public async Task<IActionResult> Index(RequestPasswordResetModel model)
    {
        if (!this.globalSettings.IsSmtpServerConfigured)
        {
            return StatusCode(501);
        }


        //The following logic is more or less copy pasted from umbraco CMS, just adapted for our use.
        BackOfficeIdentityUser? identityUser = await userManager.FindByEmailAsync(model.Email);
        if (identityUser is null)
        {
            return Ok(); // We don't want to indicate user isn't found, but maybe we should log the request?
        }

        IUser? user = userService.GetByEmail(model.Email);
        if (user is null)
        {
            return Ok(); // We don't want to indicate user isn't found, but maybe we should log?
                         // It would be quite unexpected that the identity user is found, but not the IUser?
        }

        var from = globalSettings.Smtp?.From;
        var code = await userManager.GeneratePasswordResetTokenAsync(identityUser);
        var callbackUrl = ConstructCallbackUrl(identityUser.Id, code);

        var message = textService.Localize("login", "resetPasswordEmailCopyFormat",
            // Ensure the culture of the found user is used for the email!
            UmbracoUserExtensions.GetUserCulture(identityUser.Culture, textService, globalSettings),
            new[] { identityUser.UserName, callbackUrl });

        var subject = textService.Localize("login", "resetPasswordEmailCopySubject",
            // Ensure the culture of the found user is used for the email!
            UmbracoUserExtensions.GetUserCulture(identityUser.Culture, textService, globalSettings));

        var mailMessage = new EmailMessage(from, user.Email, subject, message, true);

        await emailSender.SendAsync(mailMessage, Constants.Web.EmailTypes.PasswordReset, true);

        userManager.NotifyForgotPasswordRequested(User, user.Id.ToString());

        return Ok();
    }

    private string ConstructCallbackUrl(string id, string code)
    {
        var action = linkGenerator.GetUmbracoControllerUrl(
            nameof(VerifyResetCredentialsController.Index),
            typeof(VerifyResetCredentialsController),
            new Dictionary<string, object?>() { { "area", UmbracoPasslessConstants.AreaName }, { "invite", $"{id}|{code.ToUrlBase64()}" } });

        var applicationUri = HttpContext.Request
                        .GetApplicationUri(webRoutingSettings);
        var callbackUri = new Uri(applicationUri, action);
        return callbackUri.ToString();
    }
}
