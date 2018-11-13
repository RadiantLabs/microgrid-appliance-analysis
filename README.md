## Questions for Amanda:
- Usage Factor to kW:
    - Should this be a function or a single number?
    - Should it be different for different appliances (presumably yes)


## TODO
- Combined table does not update when switching appliance
- Use forceUpdateGrids() for HOMER table
- Create a better error for when a file isn't found (currently it's found in the csv parsing step and things the rows aren't correct)
- Calculate appliance loads based on usage factors
    - Implement Amandas usage-to-kW algorithm, but make the factor adjustable

- Chart Updates:
    - Unmet Loads: Stacked bar chart of original unmet load and new unmet load. Play around with 100% stacked
    - Unmet load 3 column table
        - Base, new appliance, total for both count and sum
        - Keep wording consistent: Additional Unmet Load Sum (fuel costs when I run that generator)
    - A new bar chart: (histogram by hour)
        - New appliance load
        - Excess production
    - Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines
- Render appliance summary stats

- Calculate battery rate of charge based on excess production and based on input power

- Min State of chart is fragile. Find a more robust way of finding the floor
- Color Combined Table columns to show calculated columns
- Create grid of inputs
  - Appliance:
    - kW to kW-factor
    - grain to grain-factor
    - seasonal derate
    - CAPEX
    - OPEX
    - add hour offset
- Parse Table dates
    - Show chart by datetime instead of hour of year (toggle between hour and datetime)
    - Page through datetime chart by day, week, month
- Show column stats (max, min, avg, std) for HOMER and combined tables
- Add error logging and analytics

## TODO: Long term
- Load other HOMER and appliance files in the background
- snake case all header names. I can have a lookup to display them nicely (generic_1_k_wh_lead_acid_asm_energy_content)
- Decide on React.SFC
- Add graphql & apollo dependencies and sample app code (see https://www.robinwieruch.de/react-apollo-link-state-tutorial/)
- Add apollo devtools https://github.com/apollographql/apollo-client-devtools
- Add React Semantic UI
- Lay out basic (probably temporary) navigation
- Update to CRA with Typescript support (copy this repo to a different folder, creat-react-app, bring back over .git and remotes and components): https://github.com/facebook/create-react-app/pull/4837
- Automatic type annotation generation for Typescript: https://blog.apollographql.com/graphql-dx-d35bcf51c943, https://spin.atomicobject.com/2018/03/26/typescript-data-validation/
- Add analytics

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

## Notes

Welder and Water pump throughput:

> I think what we need to do is let the tool apply some value to a unit of welding (maybe hours), and a value to a unit of water (liters) , but then it’ll be up to the user to decide what to put in there for water pumping in particular, one kind of pump (submersible) could be used to pump drinking water to be sold, which is a very standard economic model, but another kind of pump (surface) could be used to water small horticultural crops for which a person wouldn’t realize the economic value for several months until the harvest happens.
