using Fido2NetLib.Objects;
using System.Threading;
using Our.Umbraco.Passless.Credentials.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Our.Umbraco.Passless.Credentials.Services
{
    public interface ICredentialsService
    {
        Task<List<FidoCredentialModel>> GetCredentialsByUserIdAsync(string userEmail, CancellationToken cancellationToken = default);
        Task<List<FidoCredentialModel>> GetCredentialsByUserIdAsync(byte[] userId, CancellationToken cancellationToken = default);
        Task<FidoCredentialModel?> GetByDescriptorAsync(PublicKeyCredentialDescriptor descriptor, CancellationToken cancellationToken = default);
        Task AddCredential(FidoCredentialModel credential);
        Task UpdateCounterAsync(PublicKeyCredentialDescriptor credentialsId, long counter);
        Task DeleteCredentialsAsync(string userEmail, PublicKeyCredentialDescriptor credentialsId);
    }
}
