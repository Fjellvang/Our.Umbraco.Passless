using Microsoft.AspNetCore.Routing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;
using UmbracoFidoLoginCore.Endpoints.Credentials;

namespace UmbracoFidoLoginCore
{
    public class ServerVariablesParsingHandler : INotificationHandler<ServerVariablesParsingNotification>
    {
        private readonly LinkGenerator linkGenerator;

        public ServerVariablesParsingHandler(LinkGenerator linkGenerator)
        {
            this.linkGenerator = linkGenerator;
        }
        public void Handle(ServerVariablesParsingNotification notification)
        {
            var credentialsOptionsUrl = linkGenerator.GetUmbracoControllerUrl(
                nameof(CredentialsOptionsController.Index),
                typeof(CredentialsOptionsController),
                new Dictionary<string, object?>() { ["area"] = UmbracoFidoConstants.AreaName, ["id"] = "credentialsOptions" });
            var fidoLogin = new Dictionary<string, object>()
            {
                ["urls"] = new Dictionary<string, object>()
                {
                    ["credentialsOptions"] = credentialsOptionsUrl ?? throw new InvalidOperationException("Credentials options url not found!")
                }
            };

            notification.ServerVariables["fidoLogin"] = fidoLogin;
        }
    }
}