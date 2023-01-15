
Copy App_plugins:

```
  <Target Name="PostBuild" AfterTargets="PostBuildEvent">
    <!-- Copy the App_Plugins from the Fido source -->
    <Message Text="XCopying app plugins" Importance="high" />
    <Exec Command="xcopy &quot;$(ProjectDir)..\UmbracoFidoLoginCore\App_Plugins&quot; &quot;$(ProjectDir)..\UmbracoProject\App_Plugins\&quot; /i /s /e /y" />
  </Target>
```

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
