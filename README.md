# Introduction
This is 111-2 DBMS final project.
We are 7-th group.
Members: 伏宇寬, 蕭如秀, 周宥辰
We have intergrated our pub/sub module into mysql server and develop an ORM library developed on nodejs environment. By using pub/sub module and ORM library, user can enjoy pub/sub functionality in frontend application instead of backend application.
The following chapters would cover how to install our pub/sub module and the quick start for ORM library.
# pub/sub module

In this chapter, we you cover how to compile our pub/sub module and integrate it in mysql server.
Our system environment is listed below:
1. OS: mac osX 12.4
2. hardware: macbook pro 13-inch model A1706
3. g++ version: Apple clang version 14.0.0
4. CMake version: cmake version 3.26.4
5. Homebrew version: Homebrew 4.0.22
6. nodejs version: v18.14.2

## Installation
1. prepare our module under the directory `FINAL_code`
1. 1. run ./pub_sub_server/py2str.py to generate server.txt
1. 2. copy all the content in server.txt and pass it into function PyRun_SimpleString as parameter in ./pub_sub_server/server.cpp
1. 3. coompile ./pub_sub_server/server.cpp
This step would be little complicated. You can checkout [Embedding Python in Another Application](https://docs.python.org/3/extending/embedding.html)
In our machine, we use `g++ server.cpp -L/Library/Frameworks/Python.framework/Versions/3.9/lib/python3.9/config-3.9-darwin -lpython3.9 -ldl -framework CoreFoundation -I/Library/Frameworks/Python.framework/Versions/3.9/include/python3.9`
1. 4. change a.out generated on 1. 3. step
2. compile mysql from source code
2. 1. find out mysql source corresponding your machin at [HERE] (https://dev.mysql.com/downloads/mysql/)
2. 2. unzip the donwloaded directory as `mysql-8.0.33`. Let's say it's under the directory `/Users/kobe/Downloads`
2. 3. create a directory named `mysql_build` under the directory `/Users/kobe/Downloads`.
2. 4. install cmake by entering the command `brew install cmake` on terminal. check out [reference](https://formulae.brew.sh/formula/cmake)
2. 5. replace the `mysqld_safe.sh` under the `/Users/kobe/Downloads/mysql-8.0.33/scripts` by our script `/Final_code/pub_sub_server/mysqld_safe.sh`
2. 6. open a teminal and change to the directory to `mysql_build` we just created and enter the command `cmake /Users/kobe/Downloads/mysql-8.0.33 -DCMAKE_INSTALL_PREFIX=/usr/local/mysql -DMYSQL_DATADIR=/usr/local/mysql/data -DWITH_BOOST=/usr/local/Cellar/boost/1.81.0_1` to prepare make file for msyql compilation. This parameter would be machine-dpendent. Take it carefully.
2. 7. use the 2. 6. terminal and `make -j4` to build mysql project
2. 8. `sudo make install` to install mysql server
After 2. 8 step, the mysql server is already installed on the machine. However, the post-installation step need to be taken by [official document](https://dev.mysql.com/doc/refman/5.7/en/postinstallation.html)
2. 9. initialize mysql server by the following commands `cd /usr/local/mysql`, `mkdir mysql-files`, `chown mysql:mysql mysql-files`, `chmod 750 mysql-files`, and `bin/mysqld --initialize --user=mysql`. 
2. 10. first time launch mysql server `sudo bin/mysqld_safe --user=mysql`
2. 11. first login mysql server and set up user and password by command `mysql -u root -p` and `ALTER USER 'root'@'localhost' IDENTIFIED BY '1234';`
Here, we use change the password of root to 1234. You can create any password you like.
2. 12. kill mysql process by any method you like.
3. integrate pub/sub module into mysql server
From the above steps, we have already build our pub/sub module into binary code and install conventional mysql server. In this step, the inegration of our module and mysql server would be performed.
3. 1. 





Class Js_Orm with the following function:
connect(): create connection to mysql server
test_connection(): test whether client is linked to server
close(): close the connection to server
sendSub(): subscribe to other client
sendPub(): publish message to subscriber
sendBroadcast(): broadcast message to all the clients
sendMysql(): directly use mysql syntax
createTable(): create a mysql database table
dropTable(): drop a mysql database table
queryAll(): return all the table values

Here is an example:
// build up instance
let inline_test = new Js_Orm({
  host:     host,
  port:     port,
  username: username, 
  password: password,
  user:     user,
})

inline_test.connect()

inline_test.createTable({
  tableName:"Score", 
  data:{tableName: "Score",
        attribute:["ID", "Name", "score"], 
        attributeType:["varchar", "varchar", "int"], 
        attributeLength:[20,20, 20]}
})

inline_test.create({tableName:"Score", data: ['r11000001', 'Iven', 100]})
inline_test.create({tableName:"Score", data: ['r11000002', 'David', 100]})
inline_test.queryAll("Score")
inline_test.dropTable("Score")