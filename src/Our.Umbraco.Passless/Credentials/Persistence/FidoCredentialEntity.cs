using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Our.Umbraco.Passless.Credentials.Persistence
{
    [TableName("fidoCredential")]
    [PrimaryKey(nameof(Id), AutoIncrement = false)]
    public class FidoCredentialEntity
    {
        [Column("id")]
        [PrimaryKeyColumn(AutoIncrement = false, Clustered = false)]
        public Guid Id { get; set; }
        [Column("alias")]
        public string Alias { get; set; } = null!;
        [Column("userId")]
        public byte[] UserId { get; set; } = null!;
        [Column("descriptor")]
        public byte[] Descriptor { get; set; } = null!;//TODO: Add unique descriptor???
        [Column("publicKey")]
        public byte[] PublicKey { get; set; } = null!;
        [Column("userHandle")]
        public byte[] UserHandle { get; set; } = null!;
        [Column("signatureCounter")]
        public long SignatureCounter { get; set; }
        [Column("credType")]
        public string CredType { get; set; } = null!;
        [Column("regDate")]
        public DateTime RegDate { get; set; }
        [Column("aaGuid")]
        public Guid AaGuid { get; set; }
    }
}
