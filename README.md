## Available Scripts

In the project directory, you can run:

```
yarn start    // Runs the app in the development mode at http://localhost:3000

yarn test     // Launches the test runner in the interactive watch mode.

yarn build    // Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

yarn eject    // Unpack create-react-app presets. Once you `eject`, you can’t go back!
```

For the project to build, **these files must exist with exact filenames**:

- `public/index.html` is the page template;
- `src/index.js` is the JavaScript entry point.

You can delete or rename the other files.

You may create subdirectories inside `src`. For faster rebuilds, only files inside `src` are processed by Webpack.<br>
You need to **put any JS and CSS files inside `src`**, otherwise Webpack won’t see them.

Only files inside `public` can be used from `public/index.html`.<br>
Read instructions below for using assets from JavaScript and HTML.

You can, however, create more top-level directories.<br>
They will not be included in the production build so you can use them for things like documentation.

## TODO

- React Router
  - Find args for React router and make an interface for it
- Decide on React.SFC
- Add graphql & apollo dependencies and sample app code
- Add apollo devtools https://github.com/apollographql/apollo-client-devtools
- Add React Semantic UI
- Lay out basic (probably temporary) navigation
