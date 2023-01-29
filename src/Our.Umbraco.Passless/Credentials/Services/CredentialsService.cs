using Fido2NetLib.Objects;
using System.Text;
using Umbraco.Cms.Core.Scoping;
using Our.Umbraco.Passless.Credentials.Models;
using Our.Umbraco.Passless.Credentials.Persistence;

namespace Our.Umbraco.Passless.Credentials.Services;

public class CredentialsService : ICredentialsService
{
    private readonly IFidoCredentialRepository fidoCredentialRepository;
    private readonly ICoreScopeProvider scopeProvider;

    public CredentialsService(IFidoCredentialRepository fidoCredentialRepository, ICoreScopeProvider scopeProvider)
    {
        this.fidoCredentialRepository = fidoCredentialRepository;
        this.scopeProvider = scopeProvider;
    }
    public async Task AddCredential(FidoCredentialModel credential)
    {
        using var scope = scopeProvider.CreateCoreScope(autoComplete: true);

        var exsistingCredentials = await fidoCredentialRepository.GetCredentialsByIdAsync(credential.Descriptor.Id);

        //TODO: Not a fan of this. We shouldn't be over fetching. Refactor.
        if (exsistingCredentials is not null)
        {
            throw new InvalidOperationException("Credentials already registered to a user");
        }

        await fidoCredentialRepository.UpsertAsync(new FidoCredentialEntity()
        {
            Id = Guid.NewGuid(),
            Alias = credential.Alias,
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

    public async Task<FidoCredentialModel?> GetByDescriptorAsync(PublicKeyCredentialDescriptor descriptor, CancellationToken cancellationToken = default)
    {
        //TODO: Figure if we can use cancellation token with npoco
        using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
        var result = await fidoCredentialRepository.GetCredentialsByIdAsync(descriptor.Id);

        return MapCredentials(result);
    }

    public Task<List<FidoCredentialModel>> GetCredentialsByUserIdAsync(string userEmail, CancellationToken cancellationToken = default)
    {
        return GetCredentialsByUserIdAsync(Encoding.UTF8.GetBytes(userEmail), cancellationToken);
    }
    public async Task<List<FidoCredentialModel>> GetCredentialsByUserIdAsync(byte[] userId, CancellationToken cancellationToken = default)
    {
        //TODO: Figure if we can use cancellation token with npoco
        using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
        List<FidoCredentialEntity> result = await fidoCredentialRepository.GetCredentialsByUserIdAsync(userId);

        return Map(result);
    }

    private static List<FidoCredentialModel> Map(List<FidoCredentialEntity> result)
    {
        return result.Select(MapCredentials).OfType<FidoCredentialModel>().ToList();
    }

    private static FidoCredentialModel? MapCredentials(FidoCredentialEntity? entity)
    {
        if (entity is null)
        {
            return null;
        }

        return new FidoCredentialModel(
            entity.Alias,
            entity.UserId,
            new PublicKeyCredentialDescriptor(entity.Descriptor),
            entity.PublicKey,
            entity.UserHandle,
            Convert.ToUInt32(entity.SignatureCounter),
            entity.CredType,
            entity.RegDate,
            entity.AaGuid
        );
    }

    public async Task UpdateCounterAsync(PublicKeyCredentialDescriptor credentialsId, long counter)
    {
        //TODO: clean this up - decide on proper ID and preferable do the update in one call to DB
        using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
        var credential = await fidoCredentialRepository.GetCredentialsByIdAsync(credentialsId.Id);

        if (credential is null)
        {
            throw new InvalidOperationException("Unexpected, the credentials attempting to be updated doesn't exist");
        }

        credential.SignatureCounter = counter;

        await fidoCredentialRepository.UpsertAsync(credential);
    }

    public async Task DeleteCredentialsAsync(string userEmail, PublicKeyCredentialDescriptor credentialsId)
    {
        using var scope = scopeProvider.CreateCoreScope(autoComplete: true);
        var existing = await fidoCredentialRepository.GetCredentialsByIdAsync(credentialsId.Id);

        if (existing is null)
        {
            throw new InvalidOperationException("Unexepected: Credentials not found");
        }

        var credentialEmail = Encoding.UTF8.GetString(existing.UserId);
        var noEmailMatch = !credentialEmail.Equals(userEmail, StringComparison.Ordinal);
        if (noEmailMatch)
        {
            throw new InvalidOperationException("You can only delete your own credentials");
        }

        await fidoCredentialRepository.DeleteCredentialsAsync(existing);
    }
}
