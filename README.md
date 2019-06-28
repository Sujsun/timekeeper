# TimeKeeper
Plain javascript plugin to sync client time with server time

### Example:
**Basic usage:**
```javascript
var timekeeper = TimeKeeper({
  ajaxType: 'get',
  ajaxMilliUrl: '/utcMillis',
  responseParser: function (response) {
    return parseInt(response);
  },
});

timekeeper.sync(function () {
 console.log('Correct date:', timekeeper.Date());
});
```
**NOTE:** `responseParser` must return date in milliseconds

**Sync at regular interval:**
```javascript
var timekeeper = TimeKeeper();

timekeeper.on('synced', function () {
 console.log('Synced successfully');
});

timekeeper.startSync(5 * 60 * 1000);  // Will sync regularly at 5 min interval
```

**Or if you already know the current correct time:**
```javascript
var timekeeper = TimeKeeper({ correctTimeInMillis: 1467451864591 });
console.log('Correct time:', timekeeper.Date());

/**
 * Or you can use "setCorrectTimeInMillis" method
 */
var timekeeper = TimeKeeper();
timekeeper.setCorrectTimeInMillis(1467451864591);
console.log('Correct time:', timekeeper.Date());
```

**You can also override native `Date` with correct `Date`:**
```javascript
var timekeeper = TimeKeeper({ overrideDate: true, correctTimeInMillis: 1467451864591 });
console.log('Correct time:', new Date());
```

## Options
- `correctTimeInMillis` - Correct time (server time)
- `ajaxType` - HTTP Method type [`get`/`post`/`put`]
- `ajaxMilliUrl` - URL to hit to fetch time in UTC milliseconds (Default value: "/utcMillis")
- `syncInterval` - Interval at which sycn should happen
- `responseParser` - Parser method for response
- `differenceInMillis` - Incase you know difference of machine time and server time in milliseconds you can pass

### Methods
- `sync` - Fetches server time
- `Date` - Gets Date object with server time (correct time)
- `startSync(<intervalInMilliseonds>)` - Starts to run sync operation at given regualar interval
- `stopSync` - Stops sync operation loop
- `setCorrectTimeInMillis((<timeInMillis>))` - Sets correct time (server time)
- `overrideDate` - Overrides default Date object with server time Date object
- `releaseDate` - Undos `overrideDate` operation
- `setDifferenceInMillis(<timeInMillis>)` - Sets the server and client time difference
- `getDifferenceInMillis` - Gets the server and client time difference
- `on(<eventName>, <eventHandlerMethod>)` - Attaches events
- `off` - Removes events

### Events
- Supported events
 - `sync` - Will be triggered before syncing (prehook for sync)
 - `synced` - Will be triggered when time sync is successful
 - `sync_error` - Will be triggered when time sync fails
 - `first_sync` - Will be triggered before syncing **for the first time**
 - `first_synced` - Will be triggered when time sync **for first time** is successful
 - `first_sync_error` - Will be triggered when time sync **for first time** fails

### Motivation
Have you seen chat application showing _"1 day ago"_ for a message which you received **just now**. <br/>
This is probably because the **client machine time is set wrongly**. <br/>
To avoid this chaos the **client time should be in sync with server time**. <br/>

### To see demo
- Clone the project
```
git clone https://github.com/Sujsun/timekeeper.git
```

- Install npm dependencies
```
npm install 
```

- Run the server
`npm start` or `grunt`

- Visit
`http://localhost:8989` or ` http://127.0.0.1:8989`
