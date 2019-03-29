
## Available Scripts
In the project directory, you can run:
```
yarn dev      // Runs the app in the development mode at http://localhost:3000
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


### Unmet Load
Unmet load counts are very sensitive to how many decimals you round to
Rounding to 3 decimals filters out loads less than 1 watthour
Rounding to 1 decimal filters out loads less than 100 watthours
Rounding to 0 decimals filters out loads less than 1 kWh

Amanda decided to filter out anything less than 100 watthours (1 decimal)
This is set in constants as `unmetLoadRoundingDecimals`

### Definitions:
##### kw_factor
is the number of minutes an appliance was fully utilized, summed over an hour. If it was running at 50% RPM, the factor for 1 minute is less than if it was at 100% RPM.
Link to other repo.

Explain why we don't display kw_factor for multiple appliances

### Battery Model Prediction
How does this simple equation predict the kinetic batttery model so well?
In my tests, I see:
+/-2% average error
14% max error
This is compared with a tensorflow model that had a 0.1 stop loss with 40 max epoch
(usually one when to 27 epochs for a total training time of 70 seconds). I was getting
+/- 4% average error. So why does this work?
The most important factors in battery energy content are:
1. The previous hour's energy content
2. How much energy (kW over 1 hour) was added or removed from the battery
There are dependencies on:
   * Battery Degradation: I was seeing from HOMER a modeled drop of only 1 kWh
     drop in min energy content over 1 year. Negligible, but I still split the
     difference when calculating by averaging the mins energy content over a year
   * Temperature: We don't have data on this yet. But it should be modelable
   * Charge/discharge rate (Peukart effect): Hopefully all of these batteries
     good charge controllers to ensure consistent, optimal charging.

So to calculate energy content, take last hour's energy content and add the
extra capacity of the system or subtract the load above what generation provides.
`electricalProductionLoadDiff` the difference between production and battery load
for every hour. It's positive if there is extra capacity (charging) or negative
if the load is greater than generation (discharging batttery).
There are losses between charging and discharging the battery. This will likely
be nonlinear near the boundaries (battery min/max).

Plotting the predicted values against the actual HOMER values (ignoring additional
loads from appliances) let's us see how the prediction model does (as well as
calculating average and max error). Trial and error, to give me the minimum
average error with no bias, sets the roundTripLosses to be 0.01.

Why is clamping the prediction values important?
Since an important input to our prediction is our last prediction, the errors
can compound. Imagine the potential error for 8760 predictions, each one depending
on the previous one.
However, batteries have a nice property (for prediction) where the charge/discharge
is cyclical and has a min/max. So once the batttery is charged, it can't go above
the max. If half a charge cycle is 12 hours in a day, then we only have 12
prediction errors to compound.
If a system never fully charged or discharged it's battteries, or when hundreds of cycles without hitting max or min, then this prediction model may be inaccurate.
