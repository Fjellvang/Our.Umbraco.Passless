using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Hosting;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Endpoints;
using Our.Umbraco.Passless.Assertions.Endpoints;

namespace Our.Umbraco.Passless.Composing;

/// <summary>
/// Creates custom routes for our custom controllers
/// </summary>
public class ConfigureUmbracoPipelineOptions : IConfigureOptions<UmbracoPipelineOptions>
{
    private readonly GlobalSettings _globalSettings;
    private readonly IHostingEnvironment _hostingEnvironment;

    public ConfigureUmbracoPipelineOptions(
        IOptions<GlobalSettings> globalSettings,
        IHostingEnvironment hostingEnvironment)
    {
        _globalSettings = globalSettings.Value;
        _hostingEnvironment = hostingEnvironment;
    }

    public void Configure(UmbracoPipelineOptions options)
        => options.AddFilter(
            new UmbracoPipelineFilter(
                nameof(ConfigureUmbracoPipelineOptions))
            {
                Endpoints = app =>
                {
                    app.UseEndpoints(endpoints =>
                    {
                        endpoints.MapUmbracoRoute<CredentialsOptionsController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<MakeCredentialsController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<GetCredentialsController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<AssertionOptionsController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<MakeAssertionController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<DeleteCredentialsController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<ForgotCredentialsController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<VerifyResetCredentialsController>(
                            $"{_globalSettings.GetUmbracoMvcArea(_hostingEnvironment)}/{Constants.Web.Mvc.BackOfficePathSegment}",
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                    });
                }
            });
}
