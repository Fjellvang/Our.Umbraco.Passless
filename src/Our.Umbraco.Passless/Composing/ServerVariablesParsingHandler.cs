using Microsoft.AspNetCore.Routing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Endpoints;
using Our.Umbraco.Passless.Assertions.Endpoints;

namespace Our.Umbraco.Passless.Composing
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
                new Dictionary<string, object?>() { ["area"] = UmbracoPasslessConstants.AreaName });

            var makeCredentialsUrl = linkGenerator.GetUmbracoControllerUrl(
                nameof(MakeCredentialsController.Index),
                typeof(MakeCredentialsController),
                new Dictionary<string, object?>() { ["area"] = UmbracoPasslessConstants.AreaName });

            var getCredentialsUrl = linkGenerator.GetUmbracoControllerUrl(
                nameof(GetCredentialsController.Index),
                typeof(GetCredentialsController),
                new Dictionary<string, object?>() { ["area"] = UmbracoPasslessConstants.AreaName });

            var deleteCredentialsUrl = linkGenerator.GetUmbracoControllerUrl(
                nameof(DeleteCredentialsController.Index),
                typeof(DeleteCredentialsController),
                new Dictionary<string, object?>() { ["area"] = UmbracoPasslessConstants.AreaName });

            var assertionOptionsUrl = linkGenerator.GetUmbracoControllerUrl(
                nameof(AssertionOptionsController.Index),
                typeof(AssertionOptionsController),
                new Dictionary<string, object?>() { ["area"] = UmbracoPasslessConstants.AreaName });

            var makeAssertionUrl = linkGenerator.GetUmbracoControllerUrl(
                nameof(MakeAssertionController.Index),
                typeof(MakeAssertionController),
                new Dictionary<string, object?>() { ["area"] = UmbracoPasslessConstants.AreaName });

            var passlessLogin = new Dictionary<string, object>()
            {
                ["urls"] = new Dictionary<string, object>()
                {
                    ["credentialsOptions"] = credentialsOptionsUrl ?? throw new InvalidOperationException("Credentials options url not found!"),
                    ["makeCredentials"] = makeCredentialsUrl ?? throw new InvalidOperationException("Make credentials url not found!"),
                    ["getCredentials"] = getCredentialsUrl ?? throw new InvalidOperationException("Get credentials url not found!"),
                    ["deleteCredentials"] = deleteCredentialsUrl ?? throw new InvalidOperationException("delete credentials url not found!"),
                    ["assertionOptions"] = assertionOptionsUrl ?? throw new InvalidOperationException("Assertion options url not found!"),
                    ["makeAssertion"] = makeAssertionUrl ?? throw new InvalidOperationException("Make assertion url not found!")
                }
            };

            notification.ServerVariables["passlessLogin"] = passlessLogin;
        }
    }
}