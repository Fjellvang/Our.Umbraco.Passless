using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Infrastructure.Scoping;
using UmbracoFidoLogin.Persistence;

namespace UmbracoFidoLoginCore.Persistance;

public class FidoCredentialRepository : IFidoCredentialRepository
{
    private readonly IScopeAccessor scopeAccessor;
    private readonly AppCaches appCaches;
    protected Umbraco.Cms.Infrastructure.Scoping.IScope? AmbientScope => scopeAccessor.AmbientScope;
    protected IUmbracoDatabase Database => AmbientScope?.Database ?? throw new InvalidOperationException("Ambient scope is null");


    public FidoCredentialRepository(IScopeAccessor scopeAccessor, AppCaches appCaches)
    {
        this.scopeAccessor = scopeAccessor;
        this.appCaches = appCaches;
    }

    /// <summary>
    /// Gets the isolated cache.
    /// </summary>
    /// <remarks>Depends on the ambient scope cache mode.</remarks>
    protected IAppPolicyCache IsolatedCache
    {
        get
        {
            if (AmbientScope is null)
            {
                throw new InvalidOperationException("Ambient Scope is null");
            }
            switch (AmbientScope.RepositoryCacheMode)
            {
                case RepositoryCacheMode.Default:
                    return appCaches.IsolatedCaches.GetOrCreate<FidoCredentialEntity>();
                case RepositoryCacheMode.Scoped:
                    return AmbientScope.IsolatedCaches.GetOrCreate<FidoCredentialEntity>();
                case RepositoryCacheMode.None:
                    return NoAppCache.Instance;
                case RepositoryCacheMode.Unspecified:
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
    }

    public async Task UpsertAsync(FidoCredentialEntity entity)
    {
        if (Database.Exists<FidoCredentialEntity>(entity.Id))
        {
            await Database.UpdateAsync(entity);
            IsolatedCache.ClearByKey(entity.Id.ToString());
            return;
        }

        await Database.InsertAsync(entity);
    }

    public Task<IEnumerable<FidoCredentialEntity>> GetByUserIdAsync(byte[] UserId)
    {
        throw new NotImplementedException();
    }
}