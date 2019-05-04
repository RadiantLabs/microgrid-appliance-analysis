
## Available Scripts
In the project directory, you can run:
```
yarn dev      // Runs the app in the development mode at http://localhost:3000
yarn test     // Launches the test runner in the interactive watch mode.
yarn build    // Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.
yarn eject    // Unpack create-react-app presets. Once you `eject`, you can’t go back!

```

## Deploy
This is setup as a static site with no server yet. Deployment is to Heroku using the [create-react-app-buildpack](https://github.com/mars/create-react-app-buildpack#user-content-requires).

Setup:
```
heroku login   // login to to Heroku CLI to access Radiant Labs apps on Heroku (must be invited to the app)
```

```
nvm use 11
// yarn build           // I don't think I need this now that we are doing static deploys through the buildpack
git push heroku master  // Deploy master branch to production Heroku instance (need to be logged in and have authorization)
```

If you get errors when deploying, make sure you are logged into Heroku and invited to the radiantlabs project using  `heroku login`.

For the project to build, **these files must exist with exact filenames**:

- `public/index.html` is the page template;
- `src/index.js` is the JavaScript entry point.

##### Old deploy instructions
Older versions of deploy that I switched from (ignore unless I need to recreate it):
> We can't use a static server, since we have client-side routing. Using a simple express server set up like this: https://medium.com/jeremy-gottfrieds-tech-blog/tutorial-how-to-deploy-a-production-react-app-to-heroku-c4831dfcfa08
If I need to revert back to that node.js type deploy, do these 2 steps:
1. Rename server_unused.js to server.js
2. Remove mars create react app from Heroku (can be done in Heroku UI)
3. Add Heroku's node.js buildpack
4. `yarn build` and `git push heroku master`



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
Rounding to 2 decimal filters out loads less than 10 watthours
Rounding to 1 decimal filters out loads less than 100 watthours
Rounding to 0 decimals filters out loads less than 1 kWh

Amanda decided to filter out anything less than 100 watthours (1 decimal)
This is set in constants as `unmetLoadRoundingDecimals`

Values that depend on the battery energy content:
- excess capacity
- unmet load
    - OPEX, ROI, Payback, Net revenue

### Load Served vs. Load
Once we add hypothetical appliances, we assume the load is always served using a backup generator or something. So there is no distinction between load and load served. We still know what the unmet load is and calculate it's cost, but we assume something is meeeting that load as well. For example, if there is no backup generator, unmet load count is the number of hours the grid is down.


## Definitions

**kw_factor** is the number of minutes an appliance was fully utilized, summed over an hour. If it was running at 50% RPM, the factor for 1 minute is less than if it was at 100% RPM. Here is the code that is used to produce the sample appliance files that includes the kw_factor: [microgrid-appliance-usage-profile-generators](https://github.com/RadiantLabs/microgrid-appliance-usage-profile-generators)

We don't display kw_factor for multiple appliances in the app because each kw_factor is unique for each appliance, so adding them or other math operation doesn't make sense. When appliance load or revenue is calculated from kw_factor, then we can
sum them or use those in calculations. kw_factor for a single appliance is displayed when looking in the table for the individual appliance file.


### Chain of derived values

#### Hourly Calculations:
`calcApplianceColumns.js`:

** For Review**: Important calculations that many other calculations are built on (Each calculation is done on an hour-by-hour basis):
```
newApplianceLoad = kw_factor * nominalPower * dutyCycleDerateFactor

newApplianceAncillaryLoad =
  newApplianceLoad / ancillaryEquipmentEfficiency - newApplianceLoad

productionUnits = newApplianceLoad * productionUnitsPerKwh

productionUnitsRevenue = revenuePerProductionUnits * productionUnits
```




### Battery Model Prediction
How does this simple equation predict the kinetic battery model so well?
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
if the load is greater than generation (discharging battery).
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


## Absolute Module Imports
In order to get absolute imports (`components/FileChooser` instead of `../../../components/FileChooser`), Create React App doesn't yet support them. Here is a workaround using typescript compilation:
https://github.com/facebook/create-react-app/issues/5118#issuecomment-439865778

This requires setting NODE_PATH=./ in the Heroku environment variables (Config Vars)

*Note*: I had to revert back to using relative imports because it was too buggy.
