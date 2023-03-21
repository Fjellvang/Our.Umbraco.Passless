using Microsoft.Extensions.Logging;
using Umbraco.Cms.Infrastructure.Migrations;

namespace Our.Umbraco.Passless.Credentials.Persistence.Migrations;

public class AddIsPassKeyToFidoCredential : MigrationBase
{
    public AddIsPassKeyToFidoCredential(IMigrationContext context) : base(context)
    {
    }

    protected override void Migrate()
    {
        if (ColumnExists("fidoCredential", "isPasskey"))
        {
            Logger.LogDebug("The fido Credential table already exists, skipping");
            return;
        }

        Create.Column("isPasskey")
            .OnTable("fidoCredential")
            .AsBoolean()
            .WithDefaultValue(false)
            .Do();
    }
}
