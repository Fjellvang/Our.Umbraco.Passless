using NPoco;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Infrastructure.Persistence;

namespace UmbracoFidoLogin.Credentials.Persistence;

public interface ISqlTranslator
{
    Sql<ISqlContext> Translate<T>(Sql<ISqlContext> sql, IQuery<T> query);
}
