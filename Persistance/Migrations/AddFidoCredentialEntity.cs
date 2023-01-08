using Microsoft.Extensions.Logging;
using Umbraco.Cms.Infrastructure.Migrations;

namespace UmbracoFidoLoginCore.Persistance.Migrations
{
    public class AddFidoCredentialEntity : MigrationBase
    {
        public AddFidoCredentialEntity(IMigrationContext context) : base(context)
        {
        }

        protected override void Migrate()
        {
            if (TableExists("fidoCredential"))
            {
                Logger.LogDebug("The fido Credential table already exists, skipping");
                return;
            }

            Create.Table<FidoCredentialEntity>().Do();
        }
    }
}
