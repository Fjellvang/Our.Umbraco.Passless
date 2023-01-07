
Copy App_plugins:

```
  <Target Name="PostBuild" AfterTargets="PostBuildEvent">
    <!-- Copy the App_Plugins from the Fido source -->
    <Message Text="XCopying app plugins" Importance="high" />
    <Exec Command="xcopy &quot;$(ProjectDir)..\UmbracoFidoLoginCore\App_Plugins&quot; &quot;$(ProjectDir)..\UmbracoProject\App_Plugins\&quot; /i /s /e /y" />
  </Target>
```
