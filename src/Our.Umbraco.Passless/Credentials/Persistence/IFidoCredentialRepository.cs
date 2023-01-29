using System.Collections.Generic;
using System.Threading.Tasks;

namespace Our.Umbraco.Passless.Credentials.Persistence
{

    public interface IFidoCredentialRepository
    {
        Task<List<FidoCredentialEntity>> GetCredentialsByUserIdAsync(byte[] userId);
        Task<FidoCredentialEntity?> GetCredentialsByIdAsync(byte[] credentialId);
        Task DeleteCredentialsAsync(FidoCredentialEntity credentials);
        Task UpsertAsync(FidoCredentialEntity entity);
    }
}
