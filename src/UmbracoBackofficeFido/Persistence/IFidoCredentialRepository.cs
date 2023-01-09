using UmbracoFidoLogin.Persistence;

namespace UmbracoFidoLoginCore.Persistance;

public interface IFidoCredentialRepository
{
    Task<IEnumerable<FidoCredentialEntity>> GetByUserIdAsync(byte[] UserId);

    Task UpsertAsync(FidoCredentialEntity entity);
}
