using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace UmbracoFidoLoginCore;

public static class UmbracoFidoConstants
{
    public const string AreaName = "Fido";
}
public static class IdExtensions
{
    public static IUmbracoBuilder AddFidoBackofficeAuthentication(this IUmbracoBuilder builder)
    {
        // Register OpenIdConnectBackOfficeExternalLoginProviderOptions here rather than require it in startup
        //builder.Services.ConfigureOptions<OpenIdConnectBackOfficeExternalLoginProviderOptions>();

        builder.AddBackOfficeExternalLogins(logins =>
        {
            logins.AddBackOfficeLogin(
                backOfficeAuthenticationBuilder =>
                {
                    backOfficeAuthenticationBuilder.AddRemoteScheme<FidoRemoteAuthOptions, FidoHandler>(
                        // The scheme must be set with this method to work for the back office
                        backOfficeAuthenticationBuilder.SchemeForBackOffice("FidoLogin")!,
                        "Fido Login",
                        options =>
                        {
                            options.ClaimsIssuer = "asdasA";
                        }
                        );

                }, options => {
                    options.CustomBackOfficeView = "~/App_Plugins/UmbracoFido/BackOffice/htmlpage.html";
                    options.AutoLinkOptions.OnExternalLogin = (user, loginInfo) => {
                        return true;
                    };
                    options.AutoLinkOptions.OnAutoLinking = (x, y) => { 
                    };

                    });
        });
        return builder;
    }
}
