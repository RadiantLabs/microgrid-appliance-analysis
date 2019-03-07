
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
--------------------------------------------------------------------------------

Next steps:
- [ ] Switch HOMER files in file management view
  - Right now <HomerFormFields /> uses stagedGrid. Switch to dynamic grid id. Could be activeGrid, availableGrid or stagedGrid. Either we need to pass in the active grid (will that work with observers) or we need to keep track of activeNavId in the main store
- [x] Make getAncillaryEquipmentStatus more explicit wthout metaprogramming
- [x] Fix required ancillaryEquipment that automatically sets as required
- [ ] User message: This app is in beta. You may have to reupload your HOMER and appliance files when we update the tool in the future
- [ ] Require appliance file to have certain columns
- [ ] Add app icon
- [ ] Add Units to input fields



## Upload HOMER files
- [ ] Make sure I can parse every HOMER file without errors
- [ ] Provide Sample for download
- [x] Move training and trained model into file view
- [x] Show stats, such as battery min/max
- [ ] Add datetime once staged file is accepted
- [ ] Remove effective min state of charge and energy content. The difference is less than 1%

## Convert to Mobx State Tree

- [x] Get loss chart showing training progress
- [x] Fix Re-Train Model button
- [ ] Use afterCreate instead of autorun?
- [ ] Break actions, models and views into discrete units for clarity `someModel.actions(self => {`
- [x] Save excluded table columns to localStorage (or snapshots)
- [x] Make sure homer and appliance file chooser switches files
- [x] Ancillary Equipment View
- [x] Battery Training: Battery Training really goes with the HOMER file upload. So maybe the HOMER file, the trained model, and the HOMER file metadata should be part of different same model. Then use references from the main store? These should be stored separately in localStorage.

  - [ ] Look into model.volatile for storing training logs
  - [ ] Look into onPatch for when a new battery model is created (even if volatile?). Then that could be saved to local storage? https://mobx-state-tree.gitbook.io/docs/concepts/listening-to-observables-snapshots-patches-or-actions

## Save/Revert to Snapshots

- [ ] Test rehydration of battery model from localforage
- [ ] Test storage limits for
  - [ ] indexdb
  - [ ] localstorage
  - [ ] websql
- [ ] Force indexdb for localforage(?)
- [ ] Detect if we have indexdb and alert if not. Disable snapshots?

## Active/available store overhaul
- [x] Fix ancillary equipment selected list
- [x] remove label and description from gridFileInfo and applianceFileInfo during instantiation
- [x] fix data table loading for appliance kw_factor
- [x] Load activeGrid and make sure all views and computed functions pull from
activeGrid, not from homerFileInfo or activeGridInfo
- [x] gridName -> gridStoreName
- [x] Hook up FileChooser again with HOMER files
- [x] remove activeGrid from availableGrids array
- [x] Fill out Grid FileChooser with activeGrid
- [x] Reconsider whether I even need activeGridInfo and activeApplianceInfo
  - I could set activeGrid on availableGrids and remove the new activeGrid from avaialbleGrids
- [x] Make activeAppliance follow a similar approach as activeGrid
  - [x] fetchAppliance -> fetchActiveAppliance
  - [x] activeApplianceStore.fileData
  - [x] processApplianceFile -> analyzeApplianceFile for sample files
  - [x] availableAppliances
  - [x] FileChooser should pull from availableAppliances in store
  - [x] remove activeAppliance from availableAppliances


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
- [x] Fix problems with predictions: test different models:
- [ ] Fix productionLoadDiff: It should be Total Renewable Power Output - Total Electrical Load Served (won't affect calculations yet)
- [x] Split battery model into it's own store (?)
- [ ] Save trained model to localstorage: https://js.tensorflow.org/api/0.14.1/#tf.Model.save
- [ ] Detect if HOMER file needs to be remodeled. A couple approaches:

  - convert SoC into a long, concatenated string and compare
  - sum SoC and hash it, along with other columns used for modeling. Compare speed of approaches

- [x] Output training time in UI
- [x] Check that I have the correct shape. When using this function in the example repo: `[1, _.size(featureDescriptions)]`
  - > Error: Error when checking : expected dense_Dense1_input to have shape [null,12] but got array with shape [12,1].
- [x] Make sure training and test data is lined up correctly (features line up with targets)
- [x] Try LOTS of epochs (50)
- [x] Plot Predicted vs. Actual in Tensorflow examples to compare with this one
- [x] multiLayerPerceptronRegressionModel1Hidden and multiLayerPerceptronRegressionModel2Hidden
- [x] Use and optimize linearRegressionModel layers using DSS
- [x] Understand data normalization better and make sure I'm doing it correctly. XGBoost worked well, but also works well with unnormalized data, which means I may not be normalizing it correctly (gracefully handles un-normalized or missing data, while being accurate and fast to train)
- [x] Use different splits of the data
- [x] Check how validation is done in the current script
- [x] Add button that retrains model

## Table fixes

- [ ] Show within table that file is loading
- [ ] Color code dropdown column selector menu (and decrease line height)
- [ ] Add Hover on table
- [ ] Delete column by clicking on X in column header
- [x] Only add column headers and units when rendering table (don't store those with the data)
- [x] Calculate new combinedColumnHeaderOrder as a computed function in store based on excluded columns
- [x] Add Column Selector to combined table
- [x] Filter columns in combined table
- [x] Store column filters in localstorage
- [x] **_Make sure table updates on homer or appliance change_**
- [x] Consolidate tables
- [ ] Put battery stats in Battery Energy Content tab
- [x] Have hover tooltip in column indicator. Click turns it on or off
- [x] Clean up styling in column selector indicator

## TODO:

- [x] Allow loading homer and appliance file from any route (currently only works on home)
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

# Done

- [x] Speed up calcs by not merging tables - just keep calculated columns in their own data structure. Pass all of those data structures into React Virtualized to display them but not merge them. That will save ~1second per update
- [x] Replace combinedTable with calculatedColumns
- [x] Consolidate all util functions into a single file
- [x] Remove activeHomer.keyOrder and just pass the table. Search for
  - activeHomer.tableData and tableData
  - activeHomer.keyOrder and keyOrder
- [?] Pass in both and calculatedColumns and activeHomer into summaryStats()
- [x] Color headers in homer, appliance and combined
- [x] Render kw_factor from appliance (and color it) in CombinedTable
- [x] Check that combined table matches deployed production app
- [x] Color Combined Table columns to show calculated columns
- [x] Met and unmet demand didn't change in percent no matter what appliance. It was driven by system type.

  - This is working correctly

- [x] Round kw_factor, round homer values
- [x] Parse all dates to ISO 8606, reformat for display in tables
- [x] Create a better error for when a file isn't found (currently it's found in the csv parsing step and things the rows aren't correct)
- [x] Sentry should only trigger on production
- [x] Make sure all tables update when changing data:
  - [x] Appliance table: change appliance
  - [x] HOMER table: change HOMER
  - [x] CombinedTable: modelInputs, HOMER file change, Appliance file change
  - [x] Unmet loads update with modelInput, HOMER and Appliance changes
- [x] Add Grid to top of every table, add is loader spinner
- [x] Write 'renders without crashing' tests for all components
- [x] Rename battery from 'Generic 1 kWh Lead Acid [ASM]' to Battery through

## Battery Charging Characterization

- [x] Pass in battery data and break into training and test data. Refer to https://towardsdatascience.com/train-test-split-and-cross-validation-in-python-80b61beca4b6
  - trainFeaturesArray,
  - trainTargetArray,
  - testFeaturesArray,
  - testTargetArray
- [x] Convert to normalized tensors
- [x] Create model of battery State of Charge based on electricalProductionLoadDiff and prevBatterySOC (tensorflow)
- [x] Lay out battery page with
  - training progress
  - predicted vs actual values
  - Sorted Weights
  - Score
- [x] Create derived column productionLoadDiff = PV Power Output - Total Electrical Load Served. Instead of pulling from only PV Power Output, it needs to also take into account diesel or other generation. I should probably create an additional variable. So create 2:
- [x] Create new page for battery characterization
- [x] Save trained model to store
- [x] Generate predicted vs actual values
  - https://stackoverflow.com/questions/50123067/tensorflow-js-model-predict-prints-tensor-nan
- [x] Chart predicted vs actual

---

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
