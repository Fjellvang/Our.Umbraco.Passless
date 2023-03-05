using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Web.BackOffice.Security;

namespace Our.Umbraco.Passless.Configuration
{
    public class ConfigureBackOfficeExternalLoginProviderOptions : IConfigureNamedOptions<BackOfficeExternalLoginProviderOptions>
    {
        private readonly PasslessConfiguration passlessConfiguration;

        public ConfigureBackOfficeExternalLoginProviderOptions(IOptions<PasslessConfiguration> passlessConfiguration)
        {
            this.passlessConfiguration = passlessConfiguration.Value;
        }
        public void Configure(string name, BackOfficeExternalLoginProviderOptions options)
        {
            if (name != "Umbraco.PasslessLogin")
            {
                return;
            }

            Configure(options);
        }

        public void Configure(BackOfficeExternalLoginProviderOptions options)
        {
            options.CustomBackOfficeView = "~/App_Plugins/UmbracoPassless/BackOffice/custom-login.html";
            options.DenyLocalLogin = passlessConfiguration.DenyLocalLogin;
        }
    }
}
