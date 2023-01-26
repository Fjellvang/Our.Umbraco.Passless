using Fido2NetLib;
using Newtonsoft.Json;

namespace UmbracoFidoLogin.Credentials.Models
{
    public class AssertionOptionsRequest
    {
        /// <summary>
        /// Base 64Encoded credential ID
        /// </summary>
        [JsonConverter(typeof(Base64UrlConverter))]
        public byte[] LastCredentialId { get; set; }
    }
}
