queue()
    .defer(d3.json, "/unitedstatesDonations/usdonations")
    .await(makeGraphs);


function makeGraphs(error, projectsJson) {

    // Clean up the Json data
    var usDonations = projectsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
    usDonations.forEach(function (d) {
        d["date_posted"] = dateFormat.parse(d["date_posted"]);
        d["date_posted"].setDate(1);
        d["total_donations"] = +d["total_donations"];
    });


    //Create a Crossfilter instance
    var ndx = crossfilter(usDonations);


     //Define Dimensions
     var schoolstateDim = ndx.dimension(function (d) {
         return d["school_state"];
     });
     var dateDim = ndx.dimension(function (d) {
         return d["date_posted"];
     });
     var resourceTypeDim = ndx.dimension(function (d) {
         return d["resource_type"];
     });
     var povertyLevelDim = ndx.dimension(function (d) {
         return d["poverty_level"];
     });
     var totalDonationsDim = ndx.dimension(function (d) {
         return d["total_donations"];
     });
     var fundingStatus = ndx.dimension(function (d) {
         return d["funding_status"];
     });
     var schoolAreaDim = ndx.dimension(function (d) {
         return d["school_metro"];
     });
     var primaryFocusDim = ndx.dimension(function (d) {
         return d["primary_focus_area"];
     });

     //Calculate metrics
     var numProjectsByDate = dateDim.group();
     var numProjectsByResourceType = resourceTypeDim.group();
     var numProjectsByPovertyLevel = povertyLevelDim.group();
     var numProjectsByFundingStatus = fundingStatus.group();
     var numProjectsBySchoolArea = schoolAreaDim.group();
     var primaryFocusArea = primaryFocusDim.group();
     var totalDonationsByState = schoolstateDim.group().reduceSum(function (d) {
         return d["total_donations"];
     });
     var stateGroup = schoolstateDim.group();


     var all = ndx.groupAll();
     var totalDonations = ndx.groupAll().reduceSum(function (d) {
         return d["total_donations"];
     });

     var max_state = totalDonationsByState.top(1)[0].value;


     //Define values (to be used in charts)
     var minDate = dateDim.bottom(1)[0]["date_posted"];
     var maxDate = dateDim.top(1)[0]["date_posted"];

     // All Charts
     var timeChart = dc.lineChart("#time-chart");
     var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
     var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
     var stateDonationsChart = dc.barChart("#state-donations-graph");
     var numberProjectsND = dc.numberDisplay("#number-projects-nd");
     var totalDonationsND = dc.numberDisplay("#total-donations-nd");
     var fundingStatusChart = dc.pieChart("#funding-chart");
     var schoolAreaChart = dc.pieChart("#school-area-chart");
     var primaryFocusChart = dc.rowChart("#primary-focus-area");


     selectField = dc.selectMenu('#state-donation-select')
         .dimension(schoolstateDim)
         .group(stateGroup);


     numberProjectsND
         .formatNumber(d3.format("d"))
         .valueAccessor(function (d) {
             return d;
         })
         .group(all);

     totalDonationsND
         .formatNumber(d3.format("d"))
         .valueAccessor(function (d) {
             return d;
         })
         .group(totalDonations)
         .formatNumber(d3.format(".3s"));

     timeChart
         .width(800)
         .height(250)
         .ordinalColors(['#0052a5'])
         .margins({top: 10, right: 50, bottom: 30, left: 50})
         .dimension(dateDim)
         .group(numProjectsByDate)
         .transitionDuration(500)
         .x(d3.time.scale().domain([minDate, maxDate]))
         .elasticY(true)
         .xAxisLabel("YEAR")
         .yAxis().ticks(5);

     stateDonationsChart
        .width(800)
        .height(200)
         .ordinalColors(['#0052a5'])
        .transitionDuration(500)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(schoolstateDim)
        .group(stateGroup)
        .centerBar(false)
        .gap(1)
        .elasticY(true)
        .xUnits(dc.units.ordinal)
        .xAxisLabel("STATES")
        .x(d3.scale.ordinal().domain(stateGroup))
        .y(d3.scale.linear().domain([0, max_state]))
        .yAxis().tickFormat(d3.format("s")).ticks(6);

     resourceTypeChart
         .width(300)
         .height(200)
         .ordinalColors(['#f32', '#E0162B', '#0052a5', '#4c4cff', '#747474', '#3d3b44'])
         .dimension(resourceTypeDim)
         .group(numProjectsByResourceType)
         .xAxis().ticks(6);

     povertyLevelChart
         .width(300)
         .height(250)
         .ordinalColors(['#f32', '#E0162B', '#0052a5', '#4c4cff'])
         .dimension(povertyLevelDim)
         .group(numProjectsByPovertyLevel)
         .xAxis().ticks(5);

     fundingStatusChart
         .height(200)
         .radius(100)
         .ordinalColors(['#0052a5', '#E0162B', '#fff'])
         .innerRadius(30)
         .transitionDuration(1500)
         .dimension(fundingStatus)
         .group(numProjectsByFundingStatus);

     schoolAreaChart
         .height(200)
         .radius(90)
         .ordinalColors(['#0052a5', '#006', '#7f7fff'])
         .transitionDuration(1500)
         .dimension(schoolAreaDim)
         .group(numProjectsBySchoolArea);

     primaryFocusChart
         .width(300)
         .height(200)
         .ordinalColors(['#f32', '#E0162B', '#0052a5', '#4c4cff', '#747474', '#3d3b44', '#d50500'])
         .dimension(primaryFocusDim)
         .group(primaryFocusArea)
         .xAxis().ticks(4);

     dc.renderAll();
}