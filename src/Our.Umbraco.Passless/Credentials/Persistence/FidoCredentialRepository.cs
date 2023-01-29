using NPoco;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Extensions;

namespace Our.Umbraco.Passless.Credentials.Persistence
{

    public class FidoCredentialRepository : IFidoCredentialRepository
    {
        private const string tableName = "fidoCredential";

        private readonly IScopeAccessor scopeAccessor;
        private readonly AppCaches appCaches;

        protected IScope Scope => scopeAccessor?.AmbientScope ?? throw new InvalidOperationException("Ambient scope is null");
        protected Sql<ISqlContext> Sql() => Scope.SqlContext.Sql();
        protected IUmbracoDatabase Database => Scope.Database;
        protected ISqlContext SqlContext => Scope.SqlContext;

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

        public async Task<List<FidoCredentialEntity>> GetCredentialsByUserIdAsync(byte[] userId)
        {
            var sql = Sql()
                .Select($"{tableName}.*")
                .From<FidoCredentialEntity>()
                .Where($"{tableName}.userId = @Id", new { Id = userId })
                ;

            var results = await Database.FetchAsync<FidoCredentialEntity>(sql);
            return results;
        }

        public async Task<FidoCredentialEntity?> GetCredentialsByIdAsync(byte[] credentialId)
        {
            var sql = Sql()
                .Select($"{tableName}.*")
                .From<FidoCredentialEntity>()
                .Where($"{tableName}.descriptor = @Id", new { Id = credentialId })
                ;

            return await Database.SingleOrDefaultAsync<FidoCredentialEntity>(sql);
        }

        public async Task DeleteCredentialsAsync(FidoCredentialEntity credentials)
        {
            await Database.DeleteAsync(credentials);
            IsolatedCache.ClearByKey(credentials.Id.ToString());
        }
    }
}