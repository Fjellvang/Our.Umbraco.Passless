using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using Asp.Versioning;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Api.Management.Routing;
using Our.Umbraco.Passless.Credentials.Services;
using Our.Umbraco.Passless.Credentials.Models;
using System.Text;
using System.Text.Json;

namespace Our.Umbraco.Passless.Credentials.Endpoints;

[ApiVersion("1.0")]
[VersionedApiBackOfficeRoute("passless/credentials/make")]
[ApiExplorerSettings(GroupName = "Passless")]
public class MakeCredentialsController : ManagementApiControllerBase
{
    private readonly IFido2 fido2;
    private readonly ICredentialsService credentialsService;

    public MakeCredentialsController(IFido2 fido2, ICredentialsService credentialsService)
    {
        this.fido2 = fido2;
        this.credentialsService = credentialsService;
    }

    [HttpPost]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MakeCredential([FromQuery] string alias, 
        //[FromBody] AuthenticatorAttestationRawResponse? credentialRequest,
        CancellationToken cancellationToken)
    {
        // read string from request
        var body = await new StreamReader(HttpContext.Request.Body, Encoding.UTF8).ReadToEndAsync();

        var credentialRequest = JsonSerializer.Deserialize<AuthenticatorAttestationRawResponse>(body); 
        if (string.IsNullOrEmpty(alias))
        {
            return BadRequest("The alias field is required");
        }

        if (credentialRequest == null)
        {
            return BadRequest("Credential request is required");
        }

        // Convert the custom model to AuthenticatorAttestationRawResponse
        // var attestationResponse = new AuthenticatorAttestationRawResponse
        // {
        //     Id = DecodeBase64Url(credentialRequest.Id),
        //     RawId = DecodeBase64Url(credentialRequest.RawId),
        //     Type = credentialRequest.Type,
        //     Extensions = credentialRequest.Extensions,
        //     Response = new AuthenticatorAttestationRawResponse.ResponseData
        //     {
        //         AttestationObject = DecodeBase64Url(credentialRequest.Response.AttestationObject),
        //         ClientDataJson = DecodeBase64Url(credentialRequest.Response.ClientDataJSON)
        //     }
        // };
        try
        {
            // 1. get the options we sent the client
            var jsonOptions = HttpContext.Session.GetString("fido2.attestationOptions"); // Get this from interface implementation so consumers can decide how to store the challenge 
            var options = CredentialCreateOptions.FromJson(jsonOptions);

            // 2. Make is unique callback
            IsCredentialIdUniqueToUserAsyncDelegate isUniqueCallback = async (args, cancellationToken) =>
            {
                var credentials = await credentialsService.GetByDescriptorAsync(new PublicKeyCredentialDescriptor(args.CredentialId), cancellationToken); 
                return credentials is null;
            };

            // 3. make the credentials
            var success = await fido2.MakeNewCredentialAsync(credentialRequest, options, isUniqueCallback, cancellationToken: cancellationToken);

            if (success.Result is null)
            {
                throw new InvalidOperationException("Unexpected, credentials result is null");
            }

            var isPasskey = success.Result.CredType.Equals("none", StringComparison.Ordinal); //TODO: This is not 100% correct. Local testing shows that if we request attestation and signin with passkeys, none is returned. There might be other cross-platform authenticators which return none?
            // 4. Add the credentials to the user. in the database.
            await credentialsService.AddCredential(new FidoCredentialModel(
                alias,
                options.User.Id,
                new PublicKeyCredentialDescriptor(success.Result.CredentialId),
                success.Result.PublicKey,
                success.Result.User.Id,
                success.Result.Counter,
                success.Result.CredType,
                DateTime.UtcNow,
                success.Result.Aaguid,
                isPasskey
            ));


            return new JsonResult(new
            {
                CredentialId = success.Result.CredentialId,
                IsPasskey = isPasskey
            });
        }
        catch (Exception ex)
        {
            return Problem(ex.StackTrace, statusCode: (int)HttpStatusCode.InternalServerError, title: ex.Message);
        }
    }
}
