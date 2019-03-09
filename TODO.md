For the battery training mmodel, there are 2 inputs:
  * newElectricalProductionLoadDiff
  * prevBatteryEnergyContent

Don't overcomplicate this:
1. First train the mmodel on the data I have
2. give it two inputs in order to calculate new energy content:
  * newElectricalProductionLoadDiff
  * prevBatteryEnergyContent: The prediction from the previous row. If it's the first row, use original Battery Energy Content

The trick is doing the *inference sequentially*, so I have a previous row to work from

--------------------------------------------------------------------------------
Next steps:
- [ ] Add Units to input fields
- [ ] Require appliance file to have certain columns
- [ ] Add app icon
- [ ] Remove unnecessary tensorflow functions

## Upload HOMER files
- [ ] Make sure I can parse every HOMER file without errors
- [ ] Provide Sample for download
- [ ] Add datetime once staged file is accepted
- [ ] Remove effective min state of charge and energy content. The difference is less than 1%

## Convert to Mobx State Tree

- [ ] Fix Re-Train Model button
- [ ] Use afterCreate instead of autorun?
- [ ] Break actions, models and views into discrete units for clarity `someModel.actions(self => {`
- [ ] Look into onPatch for when a new battery model is created (even if volatile?). Then that could be saved to local storage? https://mobx-state-tree.gitbook.io/docs/concepts/listening-to-observables-snapshots-patches-or-actions

## Save/Revert to Snapshots

- [ ] Test rehydration of battery model from localforage
- [ ] Test storage limits for
  - [ ] indexdb
  - [ ] localstorage
  - [ ] websql
- [ ] Force indexdb for localforage(?)
- [ ] Detect if we have indexdb and alert if not. Disable snapshots?

## Battery charging problem

- [ ] PR on tensorflowjs documentation on tf.io.withSaveHandler

  - https://github.com/tensorflow/tfjs-core/blob/master/src/io/passthrough.ts#L86
  - https://js.tensorflow.org/api/0.14.2/#io.browserDownloads
  - https://github.com/tensorflow/tfjs/issues/503
  - https://github.com/tensorflow/tfjs/issues/495
  - https://js.tensorflow.org/api/0.14.2/#io.browserDownloads
  - https://js.tensorflow.org/api/0.14.2/#loadModel

- [ ] Training Progress (loss) scale is all weird
- [ ] rename batteryEpochCount to batteryMaxEpochCount
- [ ] Add batteryBaselineLoss to table
- [ ] Fix productionLoadDiff: It should be Total Renewable Power Output - Total Electrical Load Served (won't affect calculations yet)
- [ ] Save trained model to localstorage: https://js.tensorflow.org/api/0.14.1/#tf.Model.save
- [ ] Detect if HOMER file needs to be remodeled. A couple approaches:

  - convert SoC into a long, concatenated string and compare
  - sum SoC and hash it, along with other columns used for modeling. Compare speed of approaches

## Table fixes

- [ ] Show within table that file is loading
- [ ] Color code dropdown column selector menu (and decrease line height)
- [ ] Add Hover on table
- [ ] Delete column by clicking on X in column header
- [ ] Put battery stats in Battery Energy Content tab

## TODO:

- [ ] Create universally accessible small grey header. See unmet loads and battery model screens
- [ ] Check that HOMER and Appliance file has required fields (including battery and pvSystem)
- [ ] Indicator that we are currently calculating
- [ ] Deploy Sentry to production
- [ ] Unmet load sums by hour, by day. Try 100% stacked.
- [ ] A new bar chart: (histogram by hour)
  - [ ] New appliance load
  - [ ] Excess production
- [ ] Render appliance summary stats
- [ ] Min State of chart is fragile. Find a more robust way of finding the floor
- [ ] Add hour offset input(?)
- [ ] Show Load and Unmet Load chart by datetime instead of hour of year (toggle between hour and datetime)
- [ ] Page through datetime chart by day, week, month
- [ ] Show column stats (max, min, avg, std) for HOMER and combined tables

## TODO: Long term

- [ ] Reference Lines: http://recharts.org/en-US/examples/LineChartWithReferenceLines
- [ ] Load other HOMER and appliance files in the background
- [ ] Fonts are loading slowly. How to cache them?

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
- mg.availableGridNames  // I don't think I need this as a model, I just need to save it
  - {fileName: 'xyz', fileDescription: 'abc', isSample: false, defaultOnLoad: true}

How does mg.availableGrids in localforage compare with availableGrids in memory?
  - does one have artifacts and the other rehydrated models?
  - are we storing all availableGrids in memory?

How to bootstrap stored vs. sample files?
  - sample files load from data folder vs localforage for user files
  - load defaultOnLoad first and rehydrate
  - do I even keep sampels in availableGridNames? If I don't, how would I know what's defaultOnLoad?