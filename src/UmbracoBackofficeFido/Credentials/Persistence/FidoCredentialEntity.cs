using Fido2NetLib.Objects;
using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace UmbracoFidoLogin.Credentials.Persistence
{
    [TableName("fidoCredential")]
    [PrimaryKey(nameof(Id), AutoIncrement = false)]
    public class FidoCredentialEntity
    {
        [Column("id")]
        [PrimaryKeyColumn(AutoIncrement = false, Clustered = false)]
        public Guid Id { get; set; }
        [Column("userId")]
        public byte[] UserId { get; set; }
        [Column("descriptor")]
        public byte[] Descriptor { get; set; }
        [Column("publicKey")]
        public byte[] PublicKey { get; set; }
        [Column("userHandle")]
        public byte[] UserHandle { get; set; }
        [Column("signatureCounter")]
        public long SignatureCounter { get; set; }
        [Column("credType")]
        public string CredType { get; set; }
        [Column("regDate")]
        public DateTime RegDate { get; set; }
        [Column("aaGuid")]
        public Guid AaGuid { get; set; }
    }
}
