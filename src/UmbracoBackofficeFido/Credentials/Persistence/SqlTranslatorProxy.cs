using NPoco;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Infrastructure.Persistence.Querying;

namespace UmbracoFidoLogin.Credentials.Persistence;

public class SqlTranslatorProxy : ISqlTranslator
{
    public Sql<ISqlContext> Translate<T>(Sql<ISqlContext> sql, IQuery<T> query)
    {
        return new SqlTranslator<T>(sql, query).Translate();
    }
}
