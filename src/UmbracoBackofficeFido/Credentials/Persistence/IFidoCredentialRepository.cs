namespace UmbracoFidoLogin.Credentials.Persistence;

public interface IFidoCredentialRepository
{
    Task<List<FidoCredentialEntity>> GetCredentialsByUserIdAsync(byte[] userId);
    Task<List<FidoCredentialEntity>> GetUsersByCredentialIdAsync(byte[] credentialId);
    Task UpsertAsync(FidoCredentialEntity entity);
}
