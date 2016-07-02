# TimeKeeper
Plain javascript plugin to sync client time with server time

###Example:
```javascript
var timekeeper = TimeKeeper({
  ajaxType: 'get',
  ajaxMilliUrl: '/date',
  syncInterval: 3000,
  responseParser: function (response) {
    return JSON.parse(response).date;
  },
});

timekeeper.sync();

timekeeper.on('synced', function () {
 console.log('Correct date:', timekeeper.Date());
});
```


###To see demo
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
