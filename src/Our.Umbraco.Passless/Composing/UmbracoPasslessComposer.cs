using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Our.Umbraco.Passless.Credentials.Persistence;
using Our.Umbraco.Passless.Credentials.Services;
using Our.Umbraco.Passless.Configuration;
using Umbraco.Cms.Api.Management.Security;
using Umbraco.Extensions;

namespace Our.Umbraco.Passless.Composing;

public class UmbracoPasslessComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        //Options
        builder.Services.ConfigureOptions<ConfigureUmbracoPipelineOptions>();

        var result = builder.Services.AddOptions<PasslessConfiguration>()
            .Bind(builder.Config.GetSection("Passless"))
            .ValidateDataAnnotations()
            .ValidateOnStart()
            ;

        //Fido
        builder.Services.AddFido2(options =>
        {
            options.ServerDomain = builder.Config["Passless:fido2:serverDomain"];
            options.ServerName = builder.Config["Passless:fido2:serverName"];
            options.Origins = builder.Config.GetSection("Passless:fido2:origins").Get<HashSet<string>>();
            options.TimestampDriftTolerance = builder.Config.GetValue<int>("Passless:fido2:timestampDriftTolerance");
            options.MDSCacheDirPath = builder.Config["Passless:fido2:MDSCacheDirPath"];
        });

        //TODO: Refactor this - we don't want people forced into using the session
        builder.Services.AddSession(options =>
        {
            // Set a short timeout for easy testing.
            options.IdleTimeout = TimeSpan.FromMinutes(2);
            options.Cookie.HttpOnly = true;

            options.Cookie.SameSite = SameSiteMode.Unspecified;
        });

        builder.Services.ConfigureOptions<ConfigureBackOfficeExternalLoginProviderOptions>();


        var useUmbDBConfigPresent = bool.TryParse(builder.Config["Passless:UseUmbracoDb"], out var useUmbracoDB);
        if (!useUmbDBConfigPresent || useUmbracoDB)
        {
            builder.AddComponent<MigrationsComponent>();
            builder.Services.AddTransient<IFidoCredentialRepository, FidoCredentialRepository>();
        }

        builder.Services.AddTransient<ICredentialsService, CredentialsService>();

        builder.AddBackOfficeExternalLogins(logins =>
        {
            logins.AddBackOfficeLogin(
                backOfficeAuthenticationBuilder =>
                {
                    backOfficeAuthenticationBuilder.AddRemoteScheme<PasslessRemoteAuthenticationOptions, PasslessRemoteAuthenticationHandler>(
                        // The scheme must be set with this method to work for the backoffice
                        BackOfficeAuthenticationBuilder.SchemeForBackOffice("PasslessLogin")!,
                        "Umbraco.PasslessLogin",
                        options =>
                        {
                            options.CallbackPath = new PathString("/umbraco-passless-login"); // Not really used for now.
                        }
                        );
                });
        });

    }
}
