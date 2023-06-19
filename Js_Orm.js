import {Table}  from './Table.js';
import WebSocket from 'ws';

export class Js_Orm {
  constructor(data){
    console.log("Js_Orm constructed with: ")
    // console.log(data.user)
    this.host = data.host,
    this.port = data.port,
    this.username = data.username,
    this.password = data.password,
    this.user = data.user,
    this._user = data.user, 
    this.server_link = "ws://" + data.host+":"+ data.port,
    this.socket = null,
    // table name and table instance pair
    this.table_dict = {} 
  }


  // connection related function
  connect(){
    try{
      this.socket = new WebSocket(this.server_link);
    
      // receive message from sever
      this.socket.onmessage = function (event) {
        const message = event.data;
        console.log('Server:', message);
      };

      // send message to server
      this.socket.onopen = function () {
        console.log('WebSocket connection established.');
      };
      
      console.log(this.user + " build!")
      this.send("#"+this.user)

    } catch(error){
      console.log(error)
    }
  }

  waitForOpenConnection(socket){
    return new Promise((resolve, reject) => {
        const maxNumberOfAttempts = 10
        const intervalTime = 200 //ms

        let currentAttempt = 0
        const interval = setInterval(() => {
            if (currentAttempt > maxNumberOfAttempts - 1) {
                clearInterval(interval)
                reject(new Error('Maximum number of attempts exceeded'))
            } else if (socket.readyState === socket.OPEN) {
                clearInterval(interval)
                resolve()
            }
            currentAttempt++
        }, intervalTime)
    })
  }

  test_connection(){
    console.log(this.socket.readyState === WebSocket.OPEN)
  }

  getWebsocket(){
    console.log(this.socket)
    return this.socket
  }

  close() {
    if (this.socket) {
      console.log('WebSocket connection closed.');
      this.socket.close();
      this.socket = null;
    }
  }
 
  // send different type message
  async send(message) {
    // console.log("send(Js_Orm) called!")
    if (this.socket !== null) {
      if (this.socket.readyState === WebSocket.OPEN) {
        console.log("Send message to server(send): "+message)
        this.socket.send(message);
      } else {
        try {
          await this.waitForOpenConnection(this.socket)
          this.socket.send(message)
      } catch (err) { console.error(err) }
        // console.error('WebSocket connection is not open.');
      }
    }else{
      console.log("socket not defined or null!")
    }
  }

  sendPub(message){
    // console.log("Send message to server(pub): "+message)
    this.send("pub " + message)
  }

  sendSub(name){
    // console.log("Send message to server(sub): "+message)
    this.send("sub " + name)
  }

  sendBroadcast(message){
    // console.log("Send message to server(all): "+message)
    this.send("all " + message)
  }

  sendMysql(message){
    // console.log("Send message to server(mysql): "+message)
    this.send("mysql " + message)
  }

  // create a table instance
  createTable({tableName,data}){
    // reconnect websocket
    this.connect()
    this.tableInstance = new Table()

    this.table_dict[tableName] = this.tableInstance
    // console.log(this.table_dict)

    var sql = this.tableInstance.createTable(data)
    // console.log("createdTable called(Js_Orm): "+sql)

    // return mysql syntax
    this.sendMysql(sql)
  }
  
  dropTable(tableName){
    this.sendMysql(this.table_dict[tableName].dropTable())
  }

  // insert row
  create(data){
    this.sendMysql(this.table_dict[data.tableName].create(data.data))
  }

  queryAll(tableName){
    this.sendMysql(this.table_dict[tableName].queryAll())
  }
}
