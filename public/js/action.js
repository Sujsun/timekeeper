var elem = {};

elem.machineTimeSpan = document.getElementById('machine-time');
elem.correctTimeSpan = document.getElementById('correct-time');
elem.timeDifferenceSpan = document.getElementById('time-difference');
elem.syncingStatus = document.getElementById('syncing-status');
elem.syncButton = document.getElementById('sync-button');

var timekeeper = TimeKeeper({
  ajaxType: 'get',
  ajaxMilliUrl: '/date',
  syncInterval: 3000,
  responseParser: function (response) {
    return JSON.parse(response).date;
  },
});

timekeeper.on('sync', function () {
  elem.syncingStatus.style.display = 'block';
});

timekeeper.on('first_synced', function () {
  updateSyncInView();
});

timekeeper.on('first_sync_error', function () {
  updateSyncInView('fail');
});

timekeeper.on('synced', function () {
  updateSyncInView();
});

timekeeper.on('sync_error', function () {
  updateSyncInView('fail');
});

function updateTimeInView () {
  elem.machineTimeSpan.innerHTML = new Date();
  elem.correctTimeSpan.innerHTML = timekeeper.Date();
}

function updateSyncInView (err) {
  if (err) {
    elem.syncingStatus.innerHTML = 'Failed to sync!';
    return;
  }
  elem.syncingStatus.style.display = 'none';
  elem.timeDifferenceSpan.innerHTML = Math.round(timekeeper.getDifferenceInMillis() / (60 * 1000)) + ' minutes';
  updateTimeInView();
}

function onSyncClick (event) {
  timekeeper.sync();
}

function attachViewEvents () {
  elem.syncButton.addEventListener('click', onSyncClick);
}

timekeeper.startSync(10 * 1000);
updateTimeInView();
attachViewEvents();

setInterval(function () {
  updateTimeInView();
}, 1 * 1000);