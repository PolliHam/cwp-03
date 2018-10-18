const net = require('net');
const fs = require('fs');
const files = require('./summary.js');
const port = 8124;
let arr =[];

process.argv.slice(2).forEach((dir)=>{
    arr = arr.concat( files.parser(dir));
});

const client = new net.Socket();

client.setEncoding('utf8');

client.connect(port, function() {
    client.write('FILES');
});


client.on('data', function(data) {
    if(data === 'ACK' || data === 'NEXT'){
        if (!arr.length<1){
            let file_name = arr.pop();
            fs.readFile(file_name, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    client.write(file_name + '|CONTENT_FILE|' +data );
                }
            });
        }else{
            client.destroy();
        }

    }
    else if (data === 'DEC'){
        client.destroy();
    }

});

client.on('close', function() {
    console.log('Connection closed');
});

