using NPoco;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Infrastructure.Persistence.Querying;
using Umbraco.Cms.Infrastructure.Scoping;

namespace UmbracoFidoLogin.Credentials.Persistence;

public class FidoCredentialRepository : IFidoCredentialRepository
{
    private readonly IScopeAccessor scopeAccessor;
    private readonly AppCaches appCaches;
    private readonly ISqlTranslator sqlTranslator;

    protected Umbraco.Cms.Infrastructure.Scoping.IScope Scope => scopeAccessor?.AmbientScope ?? throw new InvalidOperationException("Ambient scope is null");
    protected Sql<ISqlContext> Sql() => Scope.SqlContext.Sql();
    protected IUmbracoDatabase Database => Scope.Database;
    protected ISqlContext SqlContext => Scope.SqlContext;

    public FidoCredentialRepository(IScopeAccessor scopeAccessor, AppCaches appCaches, ISqlTranslator sqlTranslator)
    {
        this.scopeAccessor = scopeAccessor;
        this.appCaches = appCaches;
        this.sqlTranslator = sqlTranslator;
    }



    /// <summary>
    /// Gets the isolated cache.
    /// </summary>
    /// <remarks>Depends on the ambient scope cache mode.</remarks>
    protected IAppPolicyCache IsolatedCache
    {
        get
        {
            switch (Scope.RepositoryCacheMode)
            {
                case RepositoryCacheMode.Default:
                    return appCaches.IsolatedCaches.GetOrCreate<FidoCredentialEntity>();
                case RepositoryCacheMode.Scoped:
                    return Scope.IsolatedCaches.GetOrCreate<FidoCredentialEntity>();
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

    public Task<List<FidoCredentialEntity>> GetCredentialsByUserIdAsync(byte[] userId)
    {
        var query = SqlContext.Query<FidoCredentialEntity>()
            .Where(x => x.UserId == userId)
            ;

        return Database.FetchAsync<FidoCredentialEntity>(sqlTranslator.Translate(Sql(), query));
    }

    public Task<List<FidoCredentialEntity>> GetUsersByCredentialIdAsync(byte[] credentialId)
    {
        var query = SqlContext.Query<FidoCredentialEntity>()
            .Where(x => x.Descriptor == credentialId)
            ;

        return Database.FetchAsync<FidoCredentialEntity>(sqlTranslator.Translate(Sql(), query));
    }
}