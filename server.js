var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var baseDirectory = "./public/" ;  // or whatever base directory

var port = 9615;
if(process.argv.length >2){
    if(Number(process.argv[2])!==NaN){
        if(Number.isInteger(Number(process.argv[2]))){
            port = Number(process.argv[2]);
        } 
    }
}

http.createServer(function (request, response) {
   try {
     var requestUrl = url.parse(request.url);

     // need to use path.normalize so people can"t access directories underneath baseDirectory
     var fsPath;
     console.log(requestUrl.pathname);
     if(requestUrl.pathname==="/" || requestUrl.pathname==="" /* ||requestUrl.pathname==="/register" */){
        fsPath = baseDirectory+"index.html";
     } else{
         fsPath = baseDirectory+path.normalize(requestUrl.pathname);
     }

     response.writeHead(200);
     var fileStream = fs.createReadStream(fsPath);
     fileStream.pipe(response);
     fileStream.on("error",function(e) {
         response.writeHead(404);     // assume the file doesn"t exist
         response.end();
     });
   } catch(e) {
     response.writeHead(500);
     response.end();   // end the response so browsers don"t hang
     console.log(e.stack);
   }
}).listen(port);

console.log("listening on port "+port)