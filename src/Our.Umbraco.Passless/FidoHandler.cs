using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace Our.Umbraco.Passless
{

    public class FidoRemoteAuthenticationHandler : RemoteAuthenticationHandler<FidoRemoteAuthOptions>
    {
        public FidoRemoteAuthenticationHandler(IOptionsMonitor<FidoRemoteAuthOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock) : base(options, logger, encoder, clock)
        {
        }

        protected override Task<HandleRequestResult> HandleRemoteAuthenticateAsync() => Task.FromResult(HandleRequestResult.SkipHandler());
    }
}
