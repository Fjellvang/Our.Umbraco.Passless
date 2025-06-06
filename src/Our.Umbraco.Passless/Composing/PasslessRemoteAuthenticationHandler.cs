using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;

namespace Our.Umbraco.Passless.Composing;

public class PasslessRemoteAuthenticationHandler : RemoteAuthenticationHandler<PasslessRemoteAuthenticationOptions>
{
    public PasslessRemoteAuthenticationHandler(IOptionsMonitor<PasslessRemoteAuthenticationOptions> options, ILoggerFactory logger, UrlEncoder encoder) : base(options, logger, encoder)
    {
    }

    protected override Task<HandleRequestResult> HandleRemoteAuthenticateAsync() => Task.FromResult(HandleRequestResult.SkipHandler());
}
