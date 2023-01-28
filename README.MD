# Our.Umbraco.Passless - Passwordless login for Umbraco

Passwordless login for Umbraco using [FIDO2](https://fidoalliance.org/fido2/).
Main implementation based on [Fido2-net-lib](https://github.com/passwordless-lib/fido2-net-lib) a great implementation for any potential FIDO server.

## Features

- Passwordless login to the umbraco backoffice.
- Register multiple Authenticators to your user
- Platform (Windows hello etc) And Cross Platform (Android/Iphone via passkeys, YubiKey etc) Authenticators supported.

## Planned features

- Completely disable password login
- Forgot password registers new authenticator
- Passwordless login for members.
- Better configuration for consumers


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

## Frontend

While working on the frontend navigate to ``src/UmbracoFidoLogin/UI`` and run ``npm run dev``
The current webpack setup is just a dumb Webpack-copy step

