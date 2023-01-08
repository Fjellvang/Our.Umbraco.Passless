
Copy App_plugins:

```
  <Target Name="PostBuild" AfterTargets="PostBuildEvent">
    <!-- Copy the App_Plugins from the Fido source -->
    <Message Text="XCopying app plugins" Importance="high" />
    <Exec Command="xcopy &quot;$(ProjectDir)..\UmbracoFidoLoginCore\App_Plugins&quot; &quot;$(ProjectDir)..\UmbracoProject\App_Plugins\&quot; /i /s /e /y" />
  </Target>
```


TODO:
    1. Consider refactoring fido FE code into modules ? instead of one big.
    2. For registering new credentials, enable option to users can use external auth methods.
