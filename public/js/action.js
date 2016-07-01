var elem = {};

elem.machineTimeSpan = document.getElementById('machine-time');
elem.correctTimeSpan = document.getElementById('correct-time');
elem.timeDifferenceSpan = document.getElementById('time-difference');
elem.syncingStatus = document.getElementById('syncing-status');

var timekeeper = TimeKeeper({
  ajaxType: 'get',
  ajaxMilliUrl: '/date',
  responseParser: function (response) {
    return JSON.parse(response).date;
  },
});

function updateTimeInView () {
  elem.machineTimeSpan.innerHTML = new Date();
  elem.correctTimeSpan.innerHTML = timekeeper.Date();
}

function afterSyncing () {
  elem.timeDifferenceSpan.innerHTML = Math.round(timekeeper.getDifferenceInMillis() / (60 * 1000)) + ' minutes';
  updateTimeInView();
}

elem.syncingStatus.style.display = 'block';
timekeeper.sync(function () {
  elem.syncingStatus.style.display = 'none';
  afterSyncing();
});

updateTimeInView()
setInterval(function () {
  updateTimeInView();
}, 1 * 1000);