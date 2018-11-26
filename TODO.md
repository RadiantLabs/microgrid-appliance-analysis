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
- [x] Rename battery from 'Generic 1 kWh Lead Acid [ASM]' to Battery through the HOMER config file
- [ ] Check that HOMER and Appliance file has required fields (including battery and pvSystem)
- [ ] Indicator that we are currently calculating
- [ ] Deploy Sentry to production

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
