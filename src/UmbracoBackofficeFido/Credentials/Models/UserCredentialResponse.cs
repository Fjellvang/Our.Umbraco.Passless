namespace UmbracoFidoLogin.Credentials.Models;

public class UserCredentialResponse
{
    public string UserEmail { get; set; } = null!;

    public UserCredentialResponse[] UserCredentials { get; set; } = Array.Empty<UserCredentialResponse>();
}

public class UserCredentialsResponse
{
    public string CredentialAlias { get; set; } = null!;
    public string CredentialsId { get; set; } = null!;
}
