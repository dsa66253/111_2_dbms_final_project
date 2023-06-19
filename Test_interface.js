import {Js_Orm}  from './Js_Orm.js';

// for readline interface
import readline from 'readline';

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
const password = (passwordValue || '1234');
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

// Set up readline for user input to test the module
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',
});

let inline_test = new Js_Orm({
  host:     host,
  port:     port,
  username: username, 
  password: password,
  user:     user,
})
inline_test.connect()


rl.on('line', function (line) {
    // console.log("Terminal: "+line)
    var message = line.trim();

    // Send the message to the server
    console.log('Received message from terminal:', message);

    // let readline_test = new Js_Orm({
    //   host:     host,
    //   port:     port,
    //   username: username, 
    //   password: password,
    //   user:     user,
    // })

    let readline_test = inline_test

    if (message.startsWith("connect")){
      readline_test.connect();
    }
    else if(message.startsWith("test_connection")){
      readline_test.test_connection();
    }
    else if(message.startsWith("getWebsocket")){
      readline_test.getWebsocket();
    }
    else if(message.startsWith("close")){
      readline_test.close();
    }
    else if(message.startsWith("send")){
      readline_test.send(message.substr(5));
    }
    else if(message.startsWith("pub")){
      readline_test.sendPub(message.substr(4))
    }
    else if(message.startsWith("sub")){ 
      readline_test.sendSub(message.substr(4))
    }
    else if(message.startsWith("mysql")){ 
      readline_test.sendMysql(message.substr(6))
    }
    else if(message.startsWith("all")){
      readline_test.sendBroadcast(message.substr(4))
    }
    else if(message.startsWith("createTable")){ 
      readline_test.createTable(message.substr(12))
    }
    else{
      readline_test.send(message);
      console.log("no function called")
    }
  
    rl.prompt();  
  });

// rl.close()

// To test the module directly with code below
// 
// build up instance
// let inline_test = new Js_Orm({
//   host:     host,
//   port:     port,
//   username: username, 
//   password: password,
//   user:     user,
// })

// test connection
// inline_test.connect()

// test table 1
// inline_test.createTable({
//   tableName:"Score", 
//   data:{tableName: "Score",
//         attribute:["ID", "Name", "score"], 
//         attributeType:["varchar", "varchar", "int"], 
//         attributeLength:[20,20, 20]}
// })

// inline_test.create({tableName:"Score", data: ['r11000001', 'Iven', 100]})
// inline_test.create({tableName:"Score", data: ['r11000002', 'David', 100]})
// inline_test.queryAll("Score")
// inline_test.dropTable("Score")

// test table 2
// inline_test.createTable({
//   tableName:"Bill", 
//   data:{tableName: "Bill",
//         attribute:["Name", "Price"], 
//         attributeType:["varchar", "int"], 
//         attributeLength:[20, 20]}
// })

// inline_test.create({tableName:"Bill", data: ["Milk", 4]})
// inline_test.queryAll("Bill")
// inline_test.dropTable("Bill")

// close the connection
// inline_test.close()
