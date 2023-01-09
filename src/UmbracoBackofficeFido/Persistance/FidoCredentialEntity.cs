using Fido2NetLib.Objects;
using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace UmbracoFidoLogin.Persistance
{
    [TableName("fidoCredential")]
    [PrimaryKey(nameof(Id), AutoIncrement = false)]
    public class FidoCredentialEntity
    {
        [Column("id")]
        [PrimaryKeyColumn(AutoIncrement = false, Clustered = false)]
        public Guid Id { get; set; }

        [Column("rowKey")]
        [Index(IndexTypes.Clustered, Name = "IX_fidoCredential_rowKey", ForColumns = "rowKey")]
        public int RowKey { get; set; } // The clustered index since we're using non-clustered PK

        [Column("userId")]
        public byte[] UserId { get; set; }
        [Column("descriptor")]
        public byte[] Descriptor { get; set; }
        [Column("publicKey")]
        public byte[] PublicKey { get; set; }
        [Column("userHandle")]
        public byte[] UserHandle { get; set; }
        [Column("signatureCounter")]
        public uint SignatureCounter { get; set; }
        [Column("credType")]
        public string CredType { get; set; }
        [Column("regDate")]
        public DateTime RegDate { get; set; }
        [Column("aaGuid")]
        public Guid AaGuid { get; set; }
    }
}
