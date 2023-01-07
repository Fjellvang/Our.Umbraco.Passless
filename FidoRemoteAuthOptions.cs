using Microsoft.AspNetCore.Authentication;

namespace UmbracoFidoLoginCore;

public class FidoRemoteAuthOptions : RemoteAuthenticationOptions
{
    public FidoRemoteAuthOptions()
    {
        CallbackPath = "/";
    }
}
