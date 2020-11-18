//  todays date and time 
var dateNow = new Date(Date.now()).toISOString().split('T')[0]
var timeNow = new Date(Date.now()).toTimeString().split(' ')[0].substr(0, 5)
var thisYear = new Date(Date.now()).getFullYear()
var thisMonth = new Date(Date.now()).getMonth()
var StartDate = new Date(thisYear, thisMonth, 2).toISOString().split('T')[0]
var EndDate = new Date(thisYear, thisMonth + 1, 2).toISOString().split('T')[0]


// UI object
var ui = {
    debugui: false,  
    debuginfo: true,
    supressUi: false,  
    flow: {
        activateDiv: null,
        activateButton: null,
        timestamp: null
    },
    dates: {
        todayDate: dateNow,
        todayTime: timeNow,
        listStartDate: StartDate,
        listEndDate: EndDate
    },
    data: {
        rekogResultLabel: null,
        rekogResultText: null,
        rekogResultFace: null,
        filename: null
    }
}

module.exports = ui