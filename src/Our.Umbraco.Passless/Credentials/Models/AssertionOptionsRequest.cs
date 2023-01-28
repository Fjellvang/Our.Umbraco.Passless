namespace Our.Umbraco.Passless.Credentials.Models
{
    public class AssertionOptionsRequest
    {
        /// <summary>
        /// Base 64Encoded credential ID
        /// </summary>
        public string? LastCredentialId { get; set; }
    }
}
