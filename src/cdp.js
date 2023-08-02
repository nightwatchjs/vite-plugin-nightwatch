const WebSocket = require('ws');

module.exports = class CDPConnection {
  constructor(url) {
    this.createCDPConnection(url);
  }

  createCDPConnection(url) {
    this._wsConnection = new WebSocket(url);
    this._wsConnection.on('open', () => {
      this.enableRunTime();
    });

    this._wsConnection.on('error', (error) => {
      console.error('CDP Error', error);
    });
  }

  enableRunTime() {
    this._wsConnection.on('message', function(message) {
      const params = JSON.parse(message);

      switch (params.method) {
        case 'Runtime.consoleAPICalled': {
          const {type, timestamp, args, stackTrace, exceptionDetails} = params['params'];
          const eventData = {
            type,
            exceptionDetails,
            timestamp: new Date(timestamp),
            args,
            stackTrace
          };
          // eslint-disable-next-line
          console.log('Console Log:', eventData);
        }
          break;

        case 'Runtime.exceptionThrown': {
          const {timestamp, exceptionDetails} = params['params'];
          const eventData = {
            exceptionDetails,
            timestamp: new Date(timestamp)
          };

          // eslint-disable-next-line
          console.log('Exception Thrown:', eventData);
        }
      }
    });

    this.execute('Runtime.enable', 99, {});
  }

  execute(method, id, params, callback) {
    const message = {
      method,
      id: id
    };

    const mergedMessage = Object.assign({params: params}, message);

    this._wsConnection.send(JSON.stringify(mergedMessage), callback);
  }
};