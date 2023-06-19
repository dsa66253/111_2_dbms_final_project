import asyncio
import sys
import websockets

# from merge
import mysql.connector
import argparse

import warnings
warnings.filterwarnings("ignore")

connected_clients = set()

connected_clients_id_name = {}
connected_clients_name_id = {}

class ps_server():
    def __init__(self, user, password, ip, port):
        self.user = user
        self.password = password
        self.ip = ip
        self.port = port
        self.mysql_init()
        self.websocket_init()
        self.cursor
    
        # Mapping between socket and user name
        self.client2name = {}
        self.name2client = {}

        # new-definded
        # self.connected_clients = set()
        # self.connected_clients_id_name = {}

    def websocket_init(self):
        start_server = websockets.serve(self.websocket_handler, self.ip, self.port) ##
        print(self.connection)
        self.loop = asyncio.get_event_loop()
        self.loop.run_until_complete(start_server)
        print(f'Listening for connections on {self.ip}:{self.port}...')
        self.loop.run_forever()

    def mysql_init(self):
        try:
            self.connection = mysql.connector.connect(
                host='localhost',
                user=self.user,
                password=self.password
            )
        except:
            print('database connection error')

        self.cursor = self.connection.cursor()
        self.cursor.execute('DROP DATABASE IF EXISTS pub_sub')
        self.cursor.execute('CREATE DATABASE pub_sub')
        self.cursor.execute('USE pub_sub')
        self.cursor.execute('CREATE TABLE pub_infor (pub VARCHAR(20), sub VARCHAR(20))')
        self.cursor.execute('CREATE TABLE message (pub VARCHAR(20), msg VARCHAR(200))')
        self.connection.commit()

    def pub(self, notified_socket, message):
        # Get user by notified socket, so we will know who sent the message
        user = connected_clients_id_name[notified_socket]

        print(f'Publish message from {user}: {message}')
        self.cursor.execute('INSERT INTO message VALUES(%s, %s)'.encode("utf-8"), (user.encode("utf-8"), message.encode("utf-8")))
        self.connection.commit()

        query = 'SELECT sub FROM pub_infor WHERE pub = %s'.encode("utf-8")
        self.cursor.execute(query, (user.encode("utf-8"),))

        results = self.cursor.fetchall()
        # print(results)
        
        # Iterate over connected clients and broadcast message
        to_inform = []
        for (client,) in results:
            to_inform.append(connected_clients_name_id[client])
        return to_inform
    
    def sub(self, notified_socket, name):
        if name == '':
            raise ValueError

        user = connected_clients_id_name[notified_socket]
        print(f'{user} subscribes {name}')

        self.cursor.execute('INSERT INTO pub_infor VALUES (%s, %s)'.encode("utf-8"), (name.encode("utf-8"), user.encode("utf-8")))
        self.connection.commit()
    
    async def get_client_id(self, ws):
        for client, client_id in connected_clients.items():
            if client == ws:
                return client_id
            
    async def websocket_handler(self, websocket, path):
        # Add the new client to the connected clients set
        connected_clients.add(websocket)

        # once connect return the id of the client
        client_id = self.get_client_id(websocket)
        print(f"{client_id} connect!")
        message = f"My client id: {client_id}"
        await websocket.send(message)
        
        # receive message
        try:
            while True:
                message = await websocket.recv()
                print("Unprocessed: "+message)

                # dealt new client
                if message.startswith("#"):
                    message = message.replace("#", "")
                    print(f"Username: {message}")

                    #  save user name and id pair
                    connected_clients_id_name[websocket] = message
                    connected_clients_name_id[message] = websocket
                else:
                    # find user name
                    client_name = connected_clients_id_name[websocket]

                    # print the received message in server terminal
                    print(f"Received message from {client_name}: {message}")

                    # Send the message to all connected clients
                    check = f"Message from {client_name}: {message}"

                    # dealt with PUB & SUB
                    if message[:3] in ["SUB", "sub"]:
                        print("call sub")
                        try:
                            self.sub(websocket, message[4:])
                        except ValueError:
                            err = 'ERROR: usage: SUB <name>'
                            await asyncio.wait(websocket.send(err))

                    elif message[:3] in ["PUB", "pub"]:
                        print("call pub")
                        to_inform = self.pub(websocket, message[4:])
                        await asyncio.wait([client.send(connected_clients_id_name[websocket] +" send: "+ message[4:]) for client in to_inform])

                    elif message[:5] in ["MySQL","mysql"]:
                        print("call mysql")
                        print(message[6:])
                        # await asyncio.wait(websocket.send(message[6:]))
                        try:
                            # self.cursor.execute('USE pub_sub')
                            self.cursor.execute(message[6:])
                            
                            # query
                            try:
                                results = self.cursor.fetchall()
                                print(results)
                                for r in results:
                                    print(r)
                                    await asyncio.wait([websocket.send(str(r))])
                            except:
                                pass

                            # insert
                            try:
                                self.connection.commit()
                            except:
                                pass

                        except Exception as e:
                            print(e)
                            err = "ERROR: wrong SQL syntax"
                            await asyncio.wait(websocket.send(err))

                    elif message[:3] in ["All", "all"]:
                        client_name = connected_clients_id_name[websocket]
                        print(f"{client_name}Send message to all client")

                        await asyncio.wait([client.send(client_name+ " says: "+message[4:]) for client in connected_clients])
                    else:
                        # print(message)
                        print("Message pass!")
                        
        finally:
            # Remove the client from the connected clients set when the connection is closed
            connected_clients.remove(websocket)

if __name__ == '__main__':
    # print("File called!")
    parser = argparse.ArgumentParser()
    parser.add_argument("--user", type=str, default="root", required=False, help="User to login MySQL")
    parser.add_argument("--password", type=str, default="1234", required=False, help="Password to login MySQL")
    parser.add_argument("--ip", type=str, default="127.0.0.1", required=False, help="IP address for this server")
    parser.add_argument("--port", type=int, default=1235, required=False, help="Port to connect")
    args = parser.parse_args()    
    # print("Argparse end!")

    server = ps_server(args.user, args.password, args.ip, args.port)
