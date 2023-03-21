﻿using Fido2NetLib.Objects;

namespace Our.Umbraco.Passless.Credentials.Models;

public class FidoCredentialModel
{
    public FidoCredentialModel(string alias,
                               byte[] userId,
                               PublicKeyCredentialDescriptor descriptor,
                               byte[] publicKey,
                               byte[] userHandle,
                               uint signatureCounter,
                               string credType,
                               DateTime regDate,
                               Guid aaGuid,
                               bool isPasskey)
    {
        Alias = alias;
        UserId = userId;
        Descriptor = descriptor;
        PublicKey = publicKey;
        UserHandle = userHandle;
        SignatureCounter = signatureCounter;
        CredType = credType;
        RegDate = regDate;
        AaGuid = aaGuid;
        IsPasskey = isPasskey;
    }

    public string Alias { get; set; }
    public byte[] UserId { get; set; }
    public PublicKeyCredentialDescriptor Descriptor { get; set; }
    public byte[] PublicKey { get; set; }
    public byte[] UserHandle { get; set; }
    public uint SignatureCounter { get; set; }
    public string CredType { get; set; }
    public DateTime RegDate { get; set; }
    public Guid AaGuid { get; set; }
    public bool IsPasskey { get; set; }
}
