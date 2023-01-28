using Microsoft.Extensions.Logging;
using Umbraco.Cms.Infrastructure.Migrations;

namespace Our.Umbraco.Passless.Credentials.Persistence.Migrations
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

            Create.Table<FidoCredentialEntity>()
                .Do();

            if (DatabaseType is NPoco.DatabaseTypes.SQLiteDatabaseType)
            {
                return; // SQLite doesnt support the clustered index. So lets return. 
            }

            //Since we're having a Guid as PK lets setup the clustered index https://stackoverflow.com/questions/11938044/what-are-the-best-practices-for-using-a-guid-as-a-primary-key-specifically-rega
            var sql = Sql(
                @"ALTER TABLE fidoCredential
ADD
    rowkey int identity(1,1);
CREATE UNIQUE CLUSTERED INDEX CIX_RowKey on fidoCredential(rowkey);
");

            Database.Execute(sql);
        }
    }
}
