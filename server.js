const net = require('net');
const fs = require('fs');
require('dotenv').config();
const port = 8124;
//let seed = 0;
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS);
let connections = 0;

const server = net.createServer((client) => {
    connections++;
    console.log('Client connected');
    client.setEncoding('utf8');

    client.id = Date.now();
    client.log = fs.createWriteStream('client'+client.id+'.txt');
    client.ACK = false;
    client.FILES = false;
    client.dir = process.env.DEFAULT_DIR + client.id+"\\";

    client.on('data', (data) => {
        if (data === 'FILES')
        {
            check_connection(client);
            fs.mkdir(client.dir, ()=>{});
            print(client, data+'\n');
            client.FILES= true;
            client.write('ACK');
        }
        else if (data === 'QA') {
            print(client, data + '\n');
            client.ACK = true;
            client.write('ACK');
        }
        else if(client.FILES){
            print(client,'Client: '+ data+'\n');
            let parts = data.split('|CONTENT_FILE|');
            let file = fs.createWriteStream(client.dir+parts[0]);
            file.write(parts[1]);
            file.close();
            client.write('NEXT');
            print(client, 'Server: NEXT \n');
        }
        else if(client.ACK){
            print(client,'Client: '+ data+'\n');
            let rand = Math.random()*4;
            rand = Math.ceil(rand);
            client.write(rand.toString());
            print(client, 'Server: '+rand+'\n');
        }
        else
        {
            client.write('DEC');
            client.destroy();
        }
    });

    client.on('end', () => {
        console.log('Client ' + client.id + ' disconnected');
        connections--;
    });
});

server.listen(port, () => {
    console.log('Server listening on localhost:'+port);
});

function print(client,data) {
    client.log.write(data);
    console.log(data);
}

function check_connection(client) {
    if(connections+1>MAX_CONNECTIONS){
        print(client, 'connection limit exceeded');
        client.destroy();
    }
}