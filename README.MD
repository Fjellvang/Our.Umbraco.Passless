
# Configuration
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

## Worklist

Last Worked on:
    - Credentials service, update the stored counter. some SQL maybe ???


TODO:

1. Reauth when registering new fido device.

    
Validate package:
https://marketplace.umbraco.com/validate
