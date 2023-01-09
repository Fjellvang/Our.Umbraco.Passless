using Serilog;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;
using UmbracoFidoLogin.Persistence.Migrations;

namespace UmbracoFidoLogin.Persistence
{
    public class MigrationsComponent : IComponent
    {
        private readonly ICoreScopeProvider scopeProvider;
        private readonly IMigrationPlanExecutor migrationPlanExecutor;
        private readonly IKeyValueService keyValueService;

        public MigrationsComponent(
            ICoreScopeProvider scopeProvider,
            IMigrationPlanExecutor migrationPlanExecutor,
            IKeyValueService keyValueService
            )
        {
            this.scopeProvider = scopeProvider;
            this.migrationPlanExecutor = migrationPlanExecutor;
            this.keyValueService = keyValueService;
        }
        public void Initialize()
        {
            var migrationPlan = new MigrationPlan("FidoCredentialsEntity");
            migrationPlan.From(string.Empty)
                .To<AddFidoCredentialEntity>("fidocredetials-db");

            var upgrader = new Upgrader(migrationPlan);

            upgrader.Execute(migrationPlanExecutor, scopeProvider, keyValueService);
        }

        public void Terminate()
        {
        }
    }
}
