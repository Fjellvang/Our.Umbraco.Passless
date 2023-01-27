using Microsoft.AspNetCore.Http;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace UmbracoFidoLogin;

public static class IUmbracoBuilderExtensions
{
    public static IUmbracoBuilder AddFidoBackofficeAuthentication(this IUmbracoBuilder builder)
    {
        builder.AddBackOfficeExternalLogins(logins =>
        {
            logins.AddBackOfficeLogin(
                backOfficeAuthenticationBuilder =>
                {
                    backOfficeAuthenticationBuilder.AddRemoteScheme<FidoRemoteAuthOptions, FidoRemoteAuthenticationHandler>(
                        // The scheme must be set with this method to work for the backoffice
                        backOfficeAuthenticationBuilder.SchemeForBackOffice("FidoLogin")!,
                        "Fido Login",
                        options =>
                        {
                            options.CallbackPath = new PathString("/umbraco-pwl-login");
                        }
                        );

                }, options => {
                    options.CustomBackOfficeView = "~/App_Plugins/UmbracoFido/BackOffice/custom-login.html";
                    });
        });
        return builder;
    }
}
