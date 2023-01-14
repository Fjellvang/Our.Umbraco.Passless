using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using UmbracoFidoLogin.Credentials.Persistence;
using UmbracoFidoLogin.Credentials.Services;
using UmbracoFidoLogin.Endpoints;

namespace UmbracoFidoLogin;

public class UmbracoFidoComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        //Options
        builder.Services.ConfigureOptions<ConfigureUmbracoPipelineOptions>();

        //Notification handlers
        builder.AddNotificationHandler<ServerVariablesParsingNotification, ServerVariablesParsingHandler>();

        //Fido
        builder.Services.AddFido2(options =>
        {
            options.ServerDomain = builder.Config["fido2:serverDomain"];
            options.ServerName = "FIDO2 Test";
            options.Origins = builder.Config.GetSection("fido2:origins").Get<HashSet<string>>();
            options.TimestampDriftTolerance = builder.Config.GetValue<int>("fido2:timestampDriftTolerance");
            options.MDSCacheDirPath = builder.Config["fido2:MDSCacheDirPath"];
        });

        //TODO: Refactor this - we don't want people forced into using the session
        builder.Services.AddSession(options =>
        {
            // Set a short timeout for easy testing.
            options.IdleTimeout = TimeSpan.FromMinutes(2);
            options.Cookie.HttpOnly = true;

            options.Cookie.SameSite = SameSiteMode.Unspecified;
        });


        //TODO: Refactor so we don't force users to use the umbraco DB
        builder.AddComponent<MigrationsComponent>();

        //TODO: Make sure we can let users bring their own interfaces
        builder.Services.AddTransient<IFidoCredentialRepository, FidoCredentialRepository>();
        builder.Services.AddTransient<ICredentialsService, CredentialsService>();

        builder.AddFidoBackofficeAuthentication();
    }
}
