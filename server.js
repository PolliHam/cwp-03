const net = require('net');
const fs = require('fs');
const port = 8124;
let seed = 0;
const server = net.createServer((client) => {
    console.log('Client connected');
    client.setEncoding('utf8');

    client.id = Date.now() + seed++;
    client.log = fs.createWriteStream('client'+client.id+'.txt');
    client.ACK = false;
    client.on('data', (data) => {
        if (data === 'QA')
        {
            print(client, data+'\n');
            client.ACK= true;
            client.write('ACK');
        }
        else if(!client.ACK){
            client.write('DEC');
        }
        else {
            print(client,'Client: '+ data+'\n');
            let rand = Math.random()*4;
            rand = Math.ceil(rand);
            client.write(rand.toString());
            print(client, 'Server: '+rand+'\n');
        }
    });
    client.on('end', () => console.log('Client '+client.id+' disconnected'));
});

server.listen(port, () => {
    console.log('Server listening on localhost:'+port);
});

function print(client,data) {
    client.log.write(data);
    console.log(data);
}