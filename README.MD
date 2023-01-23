

## Frontend

To build the from end run navigate to ``src/UmbracoFidoLogin/UI`` and run ``npm run build``

While working on the frontend use ``npm run dev``

The current webpack setup is just a dumb Webpack-copy step

##Worklist

Last Worked on:
    - Credentials service, update the stored counter. some SQL maybe ???


TODO:
    1. Consider refactoring fido FE code into modules ? instead of one big.
    2. For registering new credentials, enable option to users can use external auth methods.
    3. Switch to DatetimeOffset in DB storage.
    4. Reauth when registering new fido device.
    5. Does it make sense that every registration with windows hello returns the same ID? Look into it.

Nice to haves:
    1. Strongly typed ids, instead of all these byte[] ?
    
Validate package:
https://marketplace.umbraco.com/validate
