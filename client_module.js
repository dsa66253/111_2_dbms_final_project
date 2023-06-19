const readline = require('readline');
const WebSocket = require('ws');

// set up cli argument
// Checks for --host and if it has a value
const hostIndex = process.argv.indexOf('--host');
let hostValue;
if (hostIndex > -1) {
  // Retrieve the value after --custom
  hostValue = process.argv[hostIndex + 1];
}
const host = (hostValue || '127.0.0.1');
console.log("Your host: "+host)

// Checks for --port and if it has a value
const portIndex = process.argv.indexOf('--port');
let portValue;
if (portIndex > -1) {
  // Retrieve the value after --custom
  portValue = process.argv[portIndex + 1];
}
const port = (portValue || '1235');
console.log("Your port: "+port)

// Checks for --username and if it has a value
const usernameIndex = process.argv.indexOf('--username');
let usernameValue;
if (usernameIndex > -1) {
  // Retrieve the value after --custom
  usernameValue = process.argv[usernameIndex + 1];
}
const username = (usernameValue || 'root');
console.log("Your username(mysql): "+username)

// Checks for --password and if it has a value
const passwordIndex = process.argv.indexOf('--password');
let passwordValue;
if (passwordIndex > -1) {
  // Retrieve the value after --custom
  passwordValue = process.argv[passwordIndex + 1];
}
const password = (passwordValue || 'password');
console.log("Your password(mysql): "+password)

// Checks for --user and if it has a value
const userIndex = process.argv.indexOf('--user');
let userValue;
if (userIndex > -1) {
  // Retrieve the value after --custom
  userValue = process.argv[userIndex + 1];
}
const user = (userValue || 'User');
console.log("Your username(pubsub): "+user)

// Set up readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',
});

// module (js_orm)
// websocket connection
// mysql connection
class Js_Orm {
  constructor(data){
    this.host = data.host,
    this.port = data.port,
    this.username = data.username,
    this.password = data.password,
    this.user = data.user,
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
        // this.socket.send("#"+user)
        this.send("#"+user)
      };
    } catch(error){
      console.log(error)
    }
  }

  // from web source
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

  // async test_connection(){
  //   console.log(this.socket.readyState === WebSocket.OPEN)
  //   if (socket.readyState !== socket.OPEN) {
  //     try {
  //       await waitForOpenConnection(socket)
  //       console.log(this.socket.readyState === WebSocket.OPEN)
  //     } catch (err) { console.error(err) }
  //   } else {
  //     console.log(this.socket.readyState === WebSocket.OPEN)
  //   }
  // }

  // test_connection(){
  //   let timeoutID = setInterval(()=>{
  //     console.log("trying connecting")
  //     if (this.socket.readyState === WebSocket.OPEN){
  //       console.log("connection established")
  //       clearInterval(timeoutID)
  //     }else{
  //       console.log("connection not ready")
  //     }
  //   }, 1000)
  //   // console.log(this.socket.readyState === WebSocket.OPEN)
  // }

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
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log("Send message to server(send): "+message)
      this.socket.send(message);
    } else {
      try {
        await this.waitForOpenConnection(this.socket)
        this.socket.send(message)
    } catch (err) { console.error(err) }
      console.error('WebSocket connection is not open.');
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

// module (table)
// create table 
// CRUD
// create(insert) row
// read(query) table
// update table
// delete table
class Table{
  constructor(data){
    this.tableName, // = data.tableName,
    this.attribute, // = data.attribute,
    this.attributeType, // = data.attributeType,
    this.attributeLength, // = data.attributeLength,
    this.insertValue = null,
    this.queryValue = null,
    this.updateValue = null
    this.data //= data.data

    // for (let key in data) {
    //   if (data.hasOwnProperty(key)) {
    //     this.instance[key] = data[key];
    //   }
    // }
    // getAllProperties(){
    //   return Object.keys(this);
    // }
  }

  // create table
  createTable(data){
    // const keys = Object.keys(jsonData);
    // { tableName: "Worker", attribute:[ID, Name], attributeType:[varchar, varchar], attributeLength:[20,20]; };
    // console.log("Create table with data(Table): "+data)

    this.tableName = data.tableName
    this.attribute = data.attribute
    this.attributeType = data.attributeType
    this.areEqualLength = data.attributeLength
    
    var sql = "CREATE TABLE IF NOT EXISTS " + data.tableName + "("
    
    // check whether equal length
    // console.log(Object.keys(data))
    const areEqualLength = data.attribute.length === data.attributeType.length && data.attributeType.length === data.attributeLength.length;
    // console.log(areEqualLength)
    if (areEqualLength){
      for (let i=0; i < data.attribute.length; i++){
        if (i !== data.attribute.length-1){
          sql = sql + data.attribute[i] + " " + data.attributeType[i] + "(" + data.attributeLength[i] + "),"
        }else{
          sql = sql + data.attribute[i] + " " + data.attributeType[i] + "(" + data.attributeLength[i] + ")"
        }
      }
    }
    
    sql = sql + ");"

    console.log("createdTable(Table): "+sql);
    // return sql syntax to  create table
    return sql
  }

  // drop table
  dropTable(){
    var sql = "DROP TABLE "+ this.tableName
    // console.log("dropTable(Table): " + sql)
    return sql
  }

  // insert row
  create(data){
    // console.log(this.attribute)

    var sql = "INSERT INTO "+ this.tableName + " ("
    // attribute name
    for (let i=0; i < this.attribute.length; i++){
      if (i !== this.attribute.length-1){
        sql = sql + String(this.attribute[i]) + ","
      }else{
        sql = sql +  String(this.attribute[i]) + ")"
      }
    }
    sql = sql + " VALUES ("
    // input value
    for (let i=0; i < data.length; i++){
      if (i !== data.length-1){
        sql = sql + "\"" + data[i] + "\"" +  ","
      }else{
        sql = sql + "\"" + data[i] + "\"" +  ");"
      }
    }
    console.log("createRow(Table): "+sql)
    return sql
  }
  
  // query tabel
  queryAll(){
    var sql = "SELECT * FROM "+ this.tableName
    console.log("queryTable(Table): " + sql)
    return sql
  }

  // update
  // delete
}

// console.log('Type a message and press Enter to send it to the server:');
rl.on('line', function (line) {
  message = line.trim();
  // Send the message to the server
  console.log('Received message from terminal:', message);

  if (message.startsWith("connect")){
    test.connect();
  }
  else if(message.startsWith("test_connection")){
    test.test_connection();
  }
  else if(message.startsWith("getWebsocket")){
    test.getWebsocket();
  }
  else if(message.startsWith("close")){
    test.close();
  }
  else if(message.startsWith("send")){
    test.send(message.substr(5));
  }
  else if(message.startsWith("pub")){
    test.sendPub(message.substr(4))
  }
  else if(message.startsWith("sub")){ 
    test.sendSub(message.substr(4))
  }
  else if(message.startsWith("mysql")){ 
    test.sendMysql(message.substr(6))
  }
  else if(message.startsWith("all")){
    test.sendBroadcast(message.substr(4))
  }
  else if(message.startsWith("createTable")){ 
    test.createTable(message.substr(12))
  }
  else{
    test.send(message);
    console.log("no function called")
  }

  //message.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  // use table module

  rl.prompt();  
});

// rl.close()

// const test2 = async ()=>{
//   let test = new Js_Orm({
//     host:     host,
//     port:     port,
//     username: username, 
//     password: password,
//     user:     user,
//   })
//   await test.connect()
//   await setTimeout(() => {
//     console.log('After delay');
//   }, 1000)
//   await test.test_connection()
// }
// test2()

// Test module
// build up instance
let test = new Js_Orm({
  host:     host,
  port:     port,
  username: username, 
  password: password,
  user:     user,
})

// test connection
test.connect()

// test.test_connection()

// test table 1
mysql_test = test.createTable({tableName:"Worker", data:
  {tableName: "Worker", attribute:["ID", "Name"], attributeType:["varchar", "varchar"], attributeLength:[20,20]}}
)
// console.log("Test in terminal: "+
//   mysql_test
// )

test.create({tableName:"Worker", data: ['00001', '000']})
test.queryAll("Worker")

// test table 2
// mysql_test = test.createTable({tableName:"Worker2", data:
//   {tableName: "Worker2", attribute:["ID", "Name"], attributeType:["varchar", "varchar"], attributeLength:[20,20]}}
// )
// console.log("Test in terminal: "+
//   mysql_test
// )

// test.create({tableName:"Worker2", data: ['00001', '000']})
// test.queryAll("Worker")

// test.dropTable("Worker")
// test.close()
