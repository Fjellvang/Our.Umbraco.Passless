using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;
using Our.Umbraco.Passless.Credentials.Persistence.Migrations;
using Umbraco.Cms.Core;

namespace Our.Umbraco.Passless.Credentials.Persistence;

public class MigrationsComponent : IComponent
{
    private readonly ICoreScopeProvider scopeProvider;
    private readonly IMigrationPlanExecutor migrationPlanExecutor;
    private readonly IKeyValueService keyValueService;
    private readonly IRuntimeState runtimeState;

    public MigrationsComponent(
        ICoreScopeProvider scopeProvider,
        IMigrationPlanExecutor migrationPlanExecutor,
        IKeyValueService keyValueService,
        IRuntimeState runtimeState
        )
    {
        this.scopeProvider = scopeProvider;
        this.migrationPlanExecutor = migrationPlanExecutor;
        this.keyValueService = keyValueService;
        this.runtimeState = runtimeState;
    }
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run)
        {
            return;
        }
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
