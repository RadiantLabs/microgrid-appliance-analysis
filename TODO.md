Old Notes from meeting:
- Amanda will do basic sanity check calculations
- Amanda review question marks
- Amanda: tell what min/max state of charge for each type of battery


--------------------------------------------------------------------------------
Before Launch:
--------------------------------------------------------------------------------
Charts:
- Do I need to calculate both load and load served? What variable am I using now
to calculate load?
- The underlying assumption is that we have a generator backup, so it will always be served


- [ ] For excess production chart, should that include original excess + additional?
  - [ ] Switch histograms to using originalModeledExcessProduction
  - [ ] Fix tests
- [ ] Figure out what 'load' 'count' even means
- [ ] Have explanation of what aggregations mean
- [ ] Document assumption that total load (original + appliance) is total load served,
      not just total hypothetical load, because we are assuming a backup generator
- [ ] Double-check all calculations (dayHour isn't being calculated correctly)
  - [ ] cross-checks: sum each time segment and compare with totals in summary page
  - [ ] sum a couple individual slices, such as hour 16. Do a manual filter and sumBy
        on the combinedTable to double check
  - [ ] compare first week hourly
  - [ ] unmet load sum & count should increase with totals (average should not)
  - [ ] Should average and sum have the same shape? What am I averaging over?
        What should I average over?
  - [ ] excessProduction sum should drop with the totals
  - [ ] totalUnmetLoad should be greater with the totals
- [ ] Create weekly bar chart for dayHour: http://recharts.org/en-US/examples/BubbleChart
- [ ] Monitor group recalculation and use keepAlive if needed

Misc:

- [ ] Sum excess load over year in summaryStats
- [ ] When no appliances are enabled, still show HOMER data in the summary view
- [ ] Rename hour to hourOfYear?
- [ ] Change Filechooser to use square checkboxes
- [ ] Move predictOriginalBatteryEnergyContent into analyzeHomerFile

Battery Model:
- [ ] Test with all HOMER files

Battery Notes:
- Don't depend on the originalModeledBatteryEnergyContent for naiveClampled:
  - Recompute inside calcBatteryDebugData
  - Then models update always, not just when they were imported
- Move batteryDebugData to grid view as a computed value.
  - It will recalculate when the viewed grid changes
- Reference line can be calculated inside the chart view, passing the right x and y accessors
- [ ] debugBatteryPrediction() takes gridData & generates plottable data for:
  - naive
  - naiveClamped (current way it's calculated, so pull it from fileData)
  - originalHomer (pull from fileData)
  - mlr

- [ ] naiveClamped should not have a loss applied during clamping

- [ ] The whole reason for getting an accurate battery model is estimating unmet load
  and excess production (right? Are there other reasons?). If so, then metrics
  I should use to test the battery model should focus on those. Put those metrics
  next to the naive, naiveClamped, mlr, ...
- [ ] Make sure I only train MLR once in the production app.

TODO:
- I want to make the predicted vs actual charts the same for naiveClamped
  - First one uses originalBatteryEnergyContent, originalModeledBatteryEnergyContent
  - What does the second one use?
  - Make sure all of these battery models don't include new appliances

--------------------------------------------------------------------------------
Post launch
--------------------------------------------------------------------------------
- [ ] Remove mimeType from analyzeHomerFile(parsedFile, fileInfo, mimeType)
- [ ] Switch from Luxon to Moment (search for getIsoTimestamp). This may allow more detailed tests
- [ ] Get rid of `processApplianceFile` (route it through analyzeApplianceFile)
- [ ] Add commas to number outputs in summary view (or localized versions?)
- [ ] Create function that returns units attached to value from fieldDefinitions
- [ ] Figure out why fetchSnapshotGridFile and fetchSnapshotApplianceFile is being called but not used
--------------------------------------------------------------------------------
Future Features
--------------------------------------------------------------------------------
- [ ] Household current limit ...
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
