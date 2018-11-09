## TODO

- [ ] Add calcs to match Adam's spreadsheet

  - [x] Make general function that merges 2 tables, making sure both headers are dealt with properly (probably fairly imperative)
  - [x] Need to cache min and max of certain columns to make calcs faster (generic_1_k_wh_lead_acid_asm_energy_content)
  - [x] Create a function that calculates all of columm calcs, then returns an array of columns to add. Each column needs to have a header, unit, and array of values. Do I need to stitch based on hour? Or just check that I have 8760, plus 2 column headers?

- Create grid of inputs

  - Appliance:
    - kW to kW-factor
    - grain to grain-factor
    - seasonal derate
    - CAPEX
    - OPEX

- Color columns based on if they are calculated or if they are for the appliance

- Then have another computed function that takes a loaded appliance and inserts it into the HOMER file. Or do I just update the homerKeyOrder so the \_cellRenderer pulls from the appliance file based on hour index?
- Parse date and reformat
- add kw and grain throughput based on factors
- add hour offset
- add seasonal derating factor

## TODO: Long term

- snake case all header names. I can have a lookup to display them nicely (generic_1_k_wh_lead_acid_asm_energy_content)
- Decide on React.SFC
- Add graphql & apollo dependencies and sample app code (see https://www.robinwieruch.de/react-apollo-link-state-tutorial/)
- Add apollo devtools https://github.com/apollographql/apollo-client-devtools
- Add React Semantic UI
- Lay out basic (probably temporary) navigation
- Update to CRA with Typescript support (copy this repo to a different folder, creat-react-app, bring back over .git and remotes and components): https://github.com/facebook/create-react-app/pull/4837
- Automatic type annotation generation for Typescript: https://blog.apollographql.com/graphql-dx-d35bcf51c943, https://spin.atomicobject.com/2018/03/26/typescript-data-validation/

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

## App Design

- Generally using domain-driven development (DDD)
- Define all fields with JSON schema (type, default value, min, max, prefix, suffix)
- Define a component that incorporates all of these properties. It’s got a default, overridable value and it’s got a slider if a number, with min and max. Pass the component the field from the schema def and the store? Not sure how it would work with apollo link-state and graphql
- Define typescript types based on this JSON schema for all fields: https://spin.atomicobject.com/2018/03/26/typescript-data-validation/
- Generate TS types from graphql queries: https://blog.apollographql.com/graphql-dx-d35bcf51c943
- JSON Schema validator: https://github.com/epoberezkin/ajv
