using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;

namespace UmbracoFidoLoginCore;

public class FidoHandler : RemoteAuthenticationHandler<FidoRemoteAuthOptions>
{
    public FidoHandler(IOptionsMonitor<FidoRemoteAuthOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock) : base(options, logger, encoder, clock)
    {
    }

    protected override Task<HandleRequestResult> HandleRemoteAuthenticateAsync() => Task.FromResult(HandleRequestResult.SkipHandler());
}
