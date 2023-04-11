export interface AssertionResponse {
    readonly redirectUrl: string;
    // Base 64 encoded credentials
    readonly credentialId: string;

    readonly isPasskey: boolean;
}

//Incomplete model, we've for now only added what we need
export interface AttestationVerificationSuccess {
    readonly credentialId: string;
    readonly isPasskey: boolean;
}

export interface UserCredentials {
    readonly userEmail: string;
    readonly userCredentials: UserCredential[];
}

export interface UserCredential{
    readonly alias: string;
    readonly credentialsId: string;
}