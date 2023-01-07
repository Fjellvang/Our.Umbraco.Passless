using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using UmbracoFidoLoginCore.Endpoints;

namespace UmbracoFidoLoginCore;

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

        builder.AddFidoBackofficeAuthentication();
    }
}
