## TODO: Current branch (refactor combinedTables and remove mergeTables)
- [x] Speed up calcs by not merging tables - just keep calculated columns in their own data structure. Pass all of those data structures into React Virtualized to display them but not merge them. That will save ~1second per update
- [x] Replace combinedTable with calculatedColumns
- [x] Consolidate all util functions into a single file
- [x] Remove activeHomer.keyOrder and just pass the table. Search for
    * activeHomer.tableData and tableData
    * activeHomer.keyOrder and keyOrder
- [?] Pass in both and calculatedColumns and activeHomer into summaryStats()
- [x] Color headers in homer, appliance and combined
- [x] Render kw_factor from appliance (and color it) in CombinedTable
- [x] Check that combined table matches deployed production app
- [x] Color Combined Table columns to show calculated columns
- [x] Met and unmet demand didn't change in percent no matter what appliance. It was driven by system type.
    * This is working correctly

## TODO: Until next sprint
- [x] Round kw_factor, round homer values
- [x] Parse all dates to ISO 8606, reformat for display in tables
- [x] Create a better error for when a file isn't found (currently it's found in the csv parsing step and things the rows aren't correct)
- [x] Sentry should only trigger on production
- [x] Make sure all tables update when changing data:
    - [x] Appliance table: change  appliance
    - [x] HOMER table: change HOMER
    - [x] CombinedTable: modelInputs, HOMER file change, Appliance file change
    - [x] Unmet loads update with modelInput, HOMER and Appliance changes
- [x] Add Grid to top of every table, add is loader spinner
- [x] Write 'renders without crashing' tests for all components
- [ ] Rename battery from 'Generic 1 kWh Lead Acid [ASM]' to Battery through the HOMER config file
- [ ] Indicator that we are currently calculating
- [ ] Deploy Sentry to production to check
Exploratory

## Battery charging problem
- [ ] Calculate battery rate of charge based on excess production and based on input power
- [ ] Do tensorflow.js examples:
    * https://github.com/tensorflow/tfjs-examples/tree/master/boston-housing
    * https://github.com/tensorflow/tfjs-examples/tree/master/polynomial-regression-core
    * https://github.com/tensorflow/tfjs-examples/tree/master/polynomial-regression
- [ ] Two approaches:
    1. Do the Boston Housing project type training, where we use the columns that we would have access to in the "additional appliance" scenario to predict the new battery state of charge
    2. Figure out the coefficients of a polynomial cureve that would predict the charge rate


## TODO
- [ ] Unmet load sums by hour, by day. Try 100% stacked.
- [ ] A new bar chart: (histogram by hour)
    - [ ] New appliance load
    - [ ] Excess production
- [ ] Render appliance summary stats
- [ ] Min State of chart is fragile. Find a more robust way of finding the floor
- [ ] Add hour offset input(?)
- [ ] Parse Table dates
    - [ ] Show chart by datetime instead of hour of year (toggle between hour and datetime)
    - [ ] Page through datetime chart by day, week, month
- [ ] Show column stats (max, min, avg, std) for HOMER and combined tables

## TODO: Long term
- [ ] Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines
- [ ] Load other HOMER and appliance files in the background
- [ ] Snake case all header names. I can have a lookup to display them nicely (generic_1_k_wh_lead_acid_asm_energy_content)


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
