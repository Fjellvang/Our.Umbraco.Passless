# Our.Umbraco.Passless - Passwordless login for Umbraco

| Package | NuGet |
| ------- | ----- |
| Our.Umbraco.Passless | [![NuGet](https://img.shields.io/nuget/v/Our.Umbraco.Passless)](https://www.nuget.org/packages/Our.Umbraco.Passless) [![NuGet downloads](https://img.shields.io/nuget/dt/Our.Umbraco.Passless.svg)](https://www.nuget.org/packages/Our.Umbraco.Passless) |

Passwordless login for Umbraco using [FIDO2](https://fidoalliance.org/fido2/).
Main implementation based on [Fido2-net-lib](https://github.com/passwordless-lib/fido2-net-lib) a great implementation for any potential FIDO server.

## Getting started

When you've installed and configured the package, log into the backffice, press your user icon in the top right corner and click `Manage Fido Devices` to add new devices.

## Features

- Passwordless login to the umbraco backoffice.
- Register multiple Authenticators to your user
- Platform (Windows hello etc) And Cross Platform (Android/Iphone via passkeys, YubiKey etc) Authenticators supported.

## Planned features

- Completely disable password login
- Forgot password registers new authenticator
- Passwordless login for members.
- Better configuration for consumers
- Umbraco 9 Support. This might take longer as the .net 5 version of fido2.net lib is quite outdated.


### Known issues
- The "Remember last authenticator" checkbox works poorly with passkeys, not sure if it can be helped?
- The CSS styling could need a loving hand

## Install
Use nuget to install Our.Umbraco.Passless
```powershell
Install-Package Our.Umbraco.Passless
```

## Configuration
You need to add these settings to your appsettings.config
``` json
 "Passless": {
   "DenyLocalLogin": true,//Optional, removes password login, defaults to false
   "UseUmbracoDb" : true, //Optional
   "fido2": {
     "serverName": "{your server name}",
     "serverDomain": "{YOUR DOMAIN}",
     "origins": [ "{YOUR ORIGIN}" ],
     "timestampDriftTolerance": {drifttollerance in ms}
   }
 }
```
For example: 
``` json
"Passless": {
   "fido2": {
     "serverName": "Passless",
     "serverDomain": "localhost",
     "origins": [ "https://localhost:44351" ],
     "timestampDriftTolerance": 300000
   }
}
```

### Use Umbraco DB

The `UseUmbracoDB` toggles whether we register our implementation of `IFidoCredentialRepository` and runs the migration adding the credentials table to the current umbraco database.

Set this to false, and register your own implementation if you want to use a different database for the users credentials.

## Frontend

The frontend is built using node 16
Navigate to ``src/Our.Umbraco.Passless/UI`` and run the following commands:
```
npm i
npm run build:dev
npm run dev
```

Now you're ready to work on the frontend.

NOTE: the output is overwritten when building / debugging the website, run above commands **after** starting the build

Use the following command to generate a production-ready build:
```
npm run build
```

Special thanks to:

- [D-Inventor](https://dev.to/d_inventor) for his Angular JS support

