- Overhaul calculations
  - [x] Make sure calculations are in the right place: if they can be done on HOMER import, make sure they are in calculateNewHomerColumns. If they require new appliance loads, then put them in calcHybridColumns
  - [x] Switch column header file to use arrays of tuples so we only need 1 array to specify it
  - [x] Calculate min battery energy content based on when HOMER determines an unmet load, or if nothing is found, then use global number or min found
  - [x] When no appliances are chosen, newApplianceLoad should equal zero and the CSV should roughly match the original HOMER file
  - [x] Allow downloading data table so it can be manipulated and checked in Excel
  - [x] Figure out why the first row of the predicted battery energy content is so different from the actual value
  - [x] Fix battery prediction chart
  - [ ] Missing kw_factor, even for 1 appliance
  - [ ] Make sure activeGrid updates InputField's
    - It may have something to do with snapshotting the model when switching activeGrid.
    - can I do a forceUpdate?
    - computed values are disposed when not observed. You can keep them alive with autorun. Maybe I should just set the activeGridId. Then an autorun sets the activeGrid. Is that a copy or a reference?

- [ ] Fix Unmet load chart to exclude the additional piece
- [ ] Fix battery charge charts

- [ ] Change loads chart to show only original loads, new appliances loads and total loads
- [ ] Columns to check for in HOMER import
  - Original Unmet Load (renamed)
- [ ] Decide if I need to calculate
  - [ ] availableCapacity
  - [ ] availableCapacityAfterNewLoads (can I do a 100% chart?)
- [ ] Remove Tensorflow views

Next steps:

1. Pricing for ancillary equipment
  - Give guidelines and let user put the cost in
  - Calculate efficiency losses on the appliance load

- Come up with estimate where clamping batter energy content is not a valid assumption
  - let the user override min and max state of charge
- Hook up appliance upload section
- Save files and bootstrap from local storage

- TOU
- line losses
- appliance lifetime
- user-input seasonality
- single and 3-phase
- show value to customer vs. their existing kit (electricity versus if a customer is using a diesel generator or engine)

What values depend on the battery energy content:

- unmet load
- unmet load hours
- unmet load costs: OPEX, ROI, Payback, Net revenue

Next steps for Appliances:
- Finish overhaul of internal calculations with battery predictions.
- Any original values should be calculated in the importFileHelpers file, hybrid calculations only depend on both appliances, ancillary equipment and homer

  - [ ] originalAvailableCapacity
  - [ ] availableCapacity
  - [x] originalUnmetLoad
  - [ ] unmetLoad
  - [ ]


- Meeting tomorrow (Tuesday) at 7:30am Mountain/8:30pm Thailand (send out same meeting link)
- [ ] Fix changing grid file
- [ ] Require filing out appliance attributes on file upload
- [ ] Save appliance without enabling
- [ ] Amanda will do basic sanity check calculations
- [ ] Amanda review question marks
- [ ] Amanda: tell what min/max state of charge for each type of battery
- [ ] Document kw_factor
- [ ] Research if battery min/max should be editable

* cache as many calculations as possible so we don't have to run prediction models again

  - electricalProductionLoadDiff
    - [x] mainStore: Calculate summary values for newApplianceLoad (called summedApplianceColumns)
    - [x] mainStore: Calculate totalElectricalLoadServed
    - [x] mainStore: Calculate separately `totalElectricalProduction`
    - [x] mainStore: Calculate electricalProductionLoadDiff
    - [x] mainStore: battery starting energy content
    - [x] mainStore: predictedBatteryEnergyContent (takes electricalProductionLoadDiff and starting battery content)
    - [x] Comments on each of these calculate steps

* [ ] **_ Calculate everything on an hourly basis for Appliances _**
  - [x] Electricity Sales (from new appliances)
  - [x] production units
  - [ ] New appliance unmet load cost
  - [x] New appliance net revenue
  - [x] Appliance Electricity Cost
  - [x] Appliance-Related Revenue
  - [x] Net Revenue
  - [x] Appliance Electricity Consumption
  - [x] Units of Productivity (include unit label (kg, hr))
* [ ] Confirm summary calculations using a spreadsheet
* [x] Fix scale on predicted vs. actual chart

- [ ] Fix case of zero appliances. It should revert to the original HOMER file values (set appliance loads to zero)

- [ ] TODO: Document how onModelInputChange works. Include initialization step where modelInputValues need to be populated
- [ ] for productionUnitType use semantic UI's "Allow Additions" dropdown
- [ ] On next deploy, delete the NODE_PATH config var: https://dashboard.heroku.com/apps/microgrid-appliance-analysis/settings
- [x] Fix broken ancillary equipment list
- [ ] Keep appliance spinner going until it's actually clickable
- [x] Calculate grid and appliance ROI
- [x] Calculate grid and appliance Payback
- [x] Assign appliance cost to either grid owner or grid operator
- [ ] Add commas to results numbers
- [ ] Find logging library that replaces 'throw'
- [x] Use `label` and `description` all over the app. Then I can just use a spread operator
- [ ] Add Appliance upload section
  - [ ] Input for cost for appliance
  - [ ] Require appliance file to have certain columns
- [ ] Add app icon
- [ ] Fix Re-Train Model button

## Upload HOMER files

- [ ] Clean up HOMER file upload sections by taking out passed props (such as viewedGrid) and injecting it from the store
- [ ] Make sure I can parse every HOMER file without errors
- [ ] Provide Sample for download

## Ancillary Appliances

- [ ] Allow assigning ancillary equipment to grid or appliance operator

## Battery charging model

- [ ] Calculate battery energy content based on predicted values
- [ ] Training Progress (loss) scale is all weird
- [ ] Add batteryBaselineLoss to table
- [ ] Save trained model to localstorage: https://js.tensorflow.org/api/0.14.1/#tf.Model.save
- [ ] PR on tensorflowjs documentation on tf.io.withSaveHandler
  - https://github.com/tensorflow/tfjs-core/blob/master/src/io/passthrough.ts#L86
  - https://js.tensorflow.org/api/0.14.2/#io.browserDownloads
  - https://github.com/tensorflow/tfjs/issues/503
  - https://github.com/tensorflow/tfjs/issues/495
  - https://js.tensorflow.org/api/0.14.2/#io.browserDownloads
  - https://js.tensorflow.org/api/0.14.2/#loadModel
- [ ] Fix productionLoadDiff: It should be Total Renewable Power Output - Total Electrical Load Served (won't affect calculations yet)
- [ ] Detect if HOMER file needs to be remodeled. A couple approaches:
  - convert SoC into a long, concatenated string and compare
  - sum SoC and hash it, along with other columns used for modeling. Compare speed of approaches
- [x] rename batteryEpochCount to batteryMaxEpochCount

## Table fixes

- [ ] Show within table that file is loading
- [ ] Color code dropdown column selector menu (and decrease line height)
- [ ] Add Hover on table
- [ ] Delete column by clicking on X in column header
- [ ] Put battery stats in Battery Energy Content tab

## MISC TODO:

- [ ] Create universally accessible small grey header. See unmet loads and battery model screens
- [ ] Check that HOMER and Appliance file has required fields (including battery and pvSystem)
- [ ] Indicator that we are currently calculating
- [ ] Deploy Sentry to production
- [ ] Unmet load sums by hour, by day. Try 100% stacked.
- [ ] A new bar chart: (histogram by hour)
  - [ ] New appliance load
  - [ ] Excess production
- [ ] Render appliance summary stats
- [ ] Add hour offset input(?)
- [ ] Show Load and Unmet Load chart by datetime instead of hour of year (toggle between hour and datetime)
- [ ] Page through datetime chart by day, week, month
- [ ] Show column stats (max, min, avg, std) for HOMER and combined tables
- [ ] Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines
- [ ] Fonts are loading slowly. How to cache them?

## Save/Revert to Snapshots

- [ ] Test rehydration of battery model from localforage
- [ ] Test storage limits for
  - [ ] indexdb
  - [ ] localstorage
  - [ ] websql
- [ ] Force indexdb for localforage(?)
- [ ] Detect if we have indexdb and alert if not. Disable snapshots?
- [ ] Look into onPatch for when a new battery model is created (even if volatile?). Then that could be saved to local storage? https://mobx-state-tree.gitbook.io/docs/concepts/listening-to-observables-snapshots-patches-or-actions

## Battery charge calculation notes

Goal: Calculate Battery SOC for every hour. Use the spreadsheet values without new loads applied to generate the SoC based on loads we know.

The SOC depends on:

- Charge/Discharge rate. These depend on
  - Excess
  - Demand
- Previous hour's SOC

The predictive model may just want to calculate Charge Rate and Discharge Rate (or Max Charge Rate and Max Discharge Rate)

- Removing
  - Available Capacity: Because it depends on Excess Electrical, SoC and Energy Content for the given row.

---

Map out the paths of file upload or restore

1. Load sample file: Uses fileInfo to retrieve, analyze and rehydrate the store
2. Restore from snapshot: No need to analyze file - all state is in snapshot. These can come from either localforage or firebase.
3. Uploaded file: Need to analyze file. This will eventually be saved as a snapshot

Bootstrapping problem I have to solve for when a user first fires up the app:

- [x] Switch from `processHomerFile` run through `analyzeHomerFile`
- [x] Put all sample files as CSVs in data and import and parse them sequentially

In localforage:

- mg.activeGrid
- mg.stagedGrid
- mg.availableGrids (saved with battery model artifacts)
- mg.availableGridNames // I don't think I need this as a model, I just need to save it
  - {fileName: 'xyz', description: 'abc', isSample: false, defaultOnLoad: true}

How does mg.availableGrids in localforage compare with availableGrids in memory?

- does one have artifacts and the other rehydrated models?
- are we storing all availableGrids in memory?

How to bootstrap stored vs. sample files?

- sample files load from data folder vs localforage for user files
- load defaultOnLoad first and rehydrate
- do I even keep sampels in availableGridNames? If I don't, how would I know what's defaultOnLoad?
