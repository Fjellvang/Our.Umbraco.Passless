
using Fido2NetLib.Development;
using Fido2NetLib.Objects;

namespace UmbracoFidoLogin.Credentials.Services
{
    public interface ICredentialsService
    {
        Task<List<StoredCredential>> GetCredentialsByUserIdAsync(string userEmail, CancellationToken cancellationToken = default);
        Task<List<StoredCredential>> GetCredentialsByUserIdAsync(byte[] userId, CancellationToken cancellationToken = default);
        Task<StoredCredential?> GetByDescriptorAsync(PublicKeyCredentialDescriptor descriptor, CancellationToken cancellationToken = default);
        Task AddCredential(StoredCredential credential);
        Task UpdateCounterAsync(byte[] credentialsId, long counter);
        Task DeleteCredentialsAsync(string userEmail, byte[] credentialsId);
    }
}
