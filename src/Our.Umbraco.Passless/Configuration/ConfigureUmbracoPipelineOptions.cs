using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Hosting;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using Umbraco.Extensions;
using Our.Umbraco.Passless.Credentials.Endpoints;
using Our.Umbraco.Passless.Assertions.Endpoints;

namespace Our.Umbraco.Passless.Configuration;

/// <summary>
/// Creates custom routes for our custom controllers
/// </summary>
public class ConfigureUmbracoPipelineOptions : IConfigureOptions<UmbracoPipelineOptions>
{
    private readonly IHostingEnvironment _hostingEnvironment;

    public ConfigureUmbracoPipelineOptions(
        IHostingEnvironment hostingEnvironment)
    {
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
                        var backOfficePath = _hostingEnvironment.GetBackOfficePath();
                        // Credentials controllers now use Management API routing
                        endpoints.MapUmbracoRoute<AssertionOptionsController>(
                            backOfficePath,
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<MakeAssertionController>(
                            backOfficePath,
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        // DeleteCredentialsController now uses Management API routing
                        endpoints.MapUmbracoRoute<ForgotCredentialsController>(
                            backOfficePath,
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                        endpoints.MapUmbracoRoute<VerifyResetCredentialsController>(
                            backOfficePath,
                            UmbracoPasslessConstants.AreaName,
                            UmbracoPasslessConstants.AreaName);
                    });
                }
            });
}
