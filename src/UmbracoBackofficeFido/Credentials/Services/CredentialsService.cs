
using Fido2NetLib.Development;
using Fido2NetLib.Objects;
using System.Text;
using Umbraco.Cms.Core.Scoping;
using UmbracoFidoLogin.Credentials.Persistence;

namespace UmbracoFidoLogin.Credentials.Services
{
    public class CredentialsService : ICredentialsService
    {
        private readonly IFidoCredentialRepository fidoCredentialRepository;
        private readonly ICoreScopeProvider scopeProvider;

        public CredentialsService(IFidoCredentialRepository fidoCredentialRepository, ICoreScopeProvider scopeProvider)
        {
            this.fidoCredentialRepository = fidoCredentialRepository;
            this.scopeProvider = scopeProvider;
        }
        public async Task AddCredential(StoredCredential credential)
        {
            using var scope = scopeProvider.CreateCoreScope(autoComplete: true);

            var exsistingCredentials = await fidoCredentialRepository.GetCredentialsByIdAsync(credential.Descriptor.Id);

            //TODO: Not a fan of this. We shouldn't be over fetching. Refactor.
            if (exsistingCredentials is not null)
            {
                throw new InvalidOperationException("Credentials already registered to a user");
            }

            await fidoCredentialRepository.UpsertAsync(new Persistence.FidoCredentialEntity()
            {
                Id = Guid.NewGuid(),
                UserId = credential.UserId,
                Descriptor = credential.Descriptor.Id,
                PublicKey = credential.PublicKey,
                UserHandle = credential.UserHandle,
                SignatureCounter = credential.SignatureCounter,
                CredType = credential.CredType,
                RegDate = DateTime.UtcNow,
                AaGuid = credential.AaGuid
            });
        }

        public async Task<StoredCredential?> GetByDescriptorAsync(PublicKeyCredentialDescriptor descriptor, CancellationToken cancellationToken = default)
        {
            //TODO: Figure if we can use cancellation token with npoco
            using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
            var result = await fidoCredentialRepository.GetCredentialsByIdAsync(descriptor.Id);

            return MapCredentials(result);
        }

        public Task<List<StoredCredential>> GetCredentialsByUserIdAsync(string userEmail, CancellationToken cancellationToken = default)
        {
            return GetCredentialsByUserIdAsync(Encoding.UTF8.GetBytes(userEmail), cancellationToken);
        }
        public async Task<List<StoredCredential>> GetCredentialsByUserIdAsync(byte[] userId, CancellationToken cancellationToken = default)
        {
            //TODO: Figure if we can use cancellation token with npoco
            using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
            var result = await fidoCredentialRepository.GetCredentialsByUserIdAsync(userId);

            return Map(result);
        }

        private static List<StoredCredential> Map(List<FidoCredentialEntity> result)
        {
            return result.Select(MapCredentials).ToList();
        }

        private static StoredCredential? MapCredentials(FidoCredentialEntity x)
        {
            if (x is null)
            {
                return null;
            }

            return new StoredCredential() // TODO: do we even want to use this model ?
            {
                UserId = x.UserId,
                Descriptor = new PublicKeyCredentialDescriptor(x.Descriptor),
                PublicKey = x.PublicKey,
                UserHandle = x.UserHandle,
                SignatureCounter = Convert.ToUInt32(x.SignatureCounter),
                CredType = x.CredType,
                AaGuid = x.AaGuid,
                RegDate = x.RegDate
            };
        }

        public async Task UpdateCounterAsync(byte[] credentialsId, long counter)
        {
            //TODO: clean this up - decide on proper ID and preferable do the update in one call to DB
            using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
            var credential = await fidoCredentialRepository.GetCredentialsByIdAsync(credentialsId);

            credential.SignatureCounter = counter;

            await fidoCredentialRepository.UpsertAsync(credential);
        }

        public async Task DeleteCredentialsAsync(string userEmail, byte[] credentialsId)
        {
            using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
            var existing = await fidoCredentialRepository.GetCredentialsByIdAsync(credentialsId);

            var credentialEmail = Encoding.UTF8.GetString(existing.UserId);
            var noEmailMatch = !credentialEmail.Equals(userEmail, StringComparison.Ordinal);
            if (noEmailMatch)
            {
                throw new InvalidOperationException("You can only delete your own credentials");
            }

            await fidoCredentialRepository.DeleteCredentialsAsync(existing);
        }
    }
}
