Before Launch:
- Loading HOMER files:
- [ ] Columns to check for in HOMER import
- [ ] Debug HOMER uploads
- [ ] Save uploaded files to local forage
- [ ] Bootstrap from local forage

- Loading Appliance files:
- [ ] Hook up appliance upload section
- [ ] Require filing out appliance attributes on file upload
- [ ] Save appliance without enabling
- [ ] Document kw_factor

- Unmet Load Problem:
  - [ ] Make sure the prediction function is getting all of the combined load
  - [ ] Figure out what inputs HOMER uses to calculate it
  - [ ] What to keep (unmet load hours?)
  - [ ] Why is newUnmetLoad less than originalUnmetLoad


- Charts:
- [ ] Sum excess load over year
- [ ] Load by hour of day (bar chart weekly chart): http://recharts.org/en-US/examples/BubbleChart
- [ ] New color scheme for all charts
- [ ] Make nicer legend for Loads chart
- [ ] Do custom tooltip for Unmet Loads
- [ ] Make hour and date be on 1 line for custom tooltip


Possible Future Features
- [ ] Create FAQ in app and/or repo
- [ ] TOU
- [ ] Line losses
- [ ] Appliance lifetime
- [ ] User-input seasonality
- [ ] Single and 3-phase
- [ ] Show value to customer vs. their existing kit (electricity versus if a customer is using a diesel generator or engine)

Notes from meeting:
- [ ] Amanda will do basic sanity check calculations
- [ ] Amanda review question marks
- [ ] Amanda: tell what min/max state of charge for each type of battery

Misc:
- [ ] Document how onModelInputChange works. Include initialization step where modelInputValues need to be populated
- [ ] For productionUnitType use semantic UI's "Allow Additions" dropdown
- [ ] On next deploy, delete the NODE_PATH config var: https://dashboard.heroku.com/apps/microgrid-appliance-analysis/settings
- [ ] Keep appliance spinner going until it's actually clickable
- [ ] Add commas to results numbers
- [ ] Find logging library that replaces 'throw'
- [ ] Add Appliance upload section
  - [ ] Input for cost for appliance
  - [ ] Require appliance file to have certain columns
- [ ] Add app icon

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
