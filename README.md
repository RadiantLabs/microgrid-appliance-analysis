
## Available Scripts
In the project directory, you can run:
```
yarn dev    // Runs the app in the development mode at http://localhost:3000

yarn test     // Launches the test runner in the interactive watch mode.

yarn build    // Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

yarn eject    // Unpack create-react-app presets. Once you `eject`, you can’t go back!

```

## Deploy

```
nvm use 10
yarn build
git push heroku master  // Deploy master branch to production heroku instance (need to be logged in and have authorization)
```

If you get errors when deploying, make sure you are logged into the radiantlabs probject in Heroku `heroku login`.

For the project to build, **these files must exist with exact filenames**:

- `public/index.html` is the page template;
- `src/index.js` is the JavaScript entry point.

We can't use a static server, since we have client-side routing. Using a simple express server set up like this: https://medium.com/jeremy-gottfrieds-tech-blog/tutorial-how-to-deploy-a-production-react-app-to-heroku-c4831dfcfa08


## Absolute Module Imports
In order to get absolute imports (`components/FileChooser` instead of `../../../components/FileChooser`), Create React App doesn't yet support them. Here is a workaround using typescript compilation:
https://github.com/facebook/create-react-app/issues/5118#issuecomment-439865778

Note: This requires setting NODE_PATH=./ in the Heroku environment variables (Config Vars)


## App Design

- Generally using domain-driven development (DDD)
- Define all fields with JSON schema (type, default value, min, max, prefix, suffix)
- Define a component that incorporates all of these properties. It’s got a default, overridable value and it’s got a slider if a number, with min and max. Pass the component the field from the schema def and the store? Not sure how it would work with apollo link-state and graphql
- Define typescript types based on this JSON schema for all fields: https://spin.atomicobject.com/2018/03/26/typescript-data-validation/
- Generate TS types from graphql queries: https://blog.apollographql.com/graphql-dx-d35bcf51c943
- JSON Schema validator: https://github.com/epoberezkin/ajv

## Notes

Welder and Water pump throughput:

> I think what we need to do is let the tool apply some value to a unit of welding (maybe hours), and a value to a unit of water (liters) , but then it’ll be up to the user to decide what to put in there for water pumping in particular, one kind of pump (submersible) could be used to pump drinking water to be sold, which is a very standard economic model, but another kind of pump (surface) could be used to water small horticultural crops for which a person wouldn’t realize the economic value for several months until the harvest happens.
