### Idea
 - Use `vscode-nls` and `vscode-nls-dev` to handle the translation in Theia.
 - If you want to understand how VS Code handles translations, check out their example [here](https://github.com/microsoft/vscode-extension-samples/tree/main/i18n-sample). See the constraints on where to put the translation files.
 - Theia has to support translations in two ways: for the extensions: (`@theia/core`, `@theia/editor`, etc) and for 3rd party extensions.
 - Instead of introducing `vscode-nls` as an extension and using that, I think we should rely on the `nls` module for `monaco`. Otherwise, even if Theia fully supports translations, UI elements provided by the monaco editor is not hooked into the application. (You will see English context menu items in the editor, although Theia is configured to run with German locale.)
 - We cannot use Theia services and DI for the translation. Why? Commands are static constants, we cannot use DI for constants.
 - We have to load `monaco` into the `window` object before any Theia extensions start/load. For that, I introduced a new concept: `frontendPreloads`. Preloads do not participate in the DI, but happens before extension load phase. At preload time, we have the chance to load `monaco` into the `window` object, get the `vs/nls` module, and use it's `nls` function to rebind the default `nls` function in Theia.
 - For the core Theia extensions, we have to run `vscode-nls-dev` after the compiling from TS to JS to adjust all generated JS file to pick up the translation files. All examples use gulpfile. We could use that, or someone can check how it works and make a pure JS script.
 - For the 3rd party extensions, we have to generate a gulpfile that extension developers can modify, and we have to generate a webpack config that can pick up the translations files.
 
