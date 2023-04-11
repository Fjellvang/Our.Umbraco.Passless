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

// Used to access stuff from servervariables parsing ie through: Umbraco.Sys.ServerVariables.DwarfAi.urls.openAiEndpoint;
export interface UmbracoConfig {
    // This class can be extended with other variables we need access to. For now this is enough
    Sys: UmbracoSystemConfig;
}

interface UmbracoSystemConfig {
    ServerVariables: UmbracoServerVariables;
}

interface UmbracoServerVariables {
    umbracoSettings: UmbracoSettings;
}

interface UmbracoSettings {
    canSendRequiredEmail: boolean;
    umbracoPath: string;
}