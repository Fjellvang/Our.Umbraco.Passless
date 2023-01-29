using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;

namespace Our.Umbraco.Passless.Composing;

public class PasslessRemoteAuthenticationHandler : RemoteAuthenticationHandler<PasslessRemoteAuthenticationOptions>
{
    public PasslessRemoteAuthenticationHandler(IOptionsMonitor<PasslessRemoteAuthenticationOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock) : base(options, logger, encoder, clock)
    {
    }

    protected override Task<HandleRequestResult> HandleRemoteAuthenticateAsync() => Task.FromResult(HandleRequestResult.SkipHandler());
}
