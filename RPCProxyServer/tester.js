var MAX_PAGE=30;
var CACHE_SIZE=[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000];
var POLICY =["RAND","FIFO","LRU"];
var URLList=["http://yahoo.com",
"http://sina.com",
"http://cnn.com",
"http://reddit.com",
"http://ufc.tv",
"http://www.reddit.com/controversial/",
"https://www.coursera.org/",
"http://www.bodybuilding.com/",
"http://github.com",
"https://youtube.com",
"http://craigslist.com"];

var thrift = require('thrift');
var ThriftTransports = require('./node_modules/thrift/lib/thrift/transport.js');
var ThriftProtocols = require('./node_modules/thrift/lib/thrift/protocol.js');
var Proxy = require("./gen-nodejs/Proxy");


console.log("Connecting to server...");
var connection = thrift.createConnection("localhost", 9090, {
    transport : ThriftTransports.TBufferedTransport(),
    protocol : ThriftProtocols.TBinaryProtocol()
  });
connection.on('error', function(err) {
    //assert(false, err);
    console.log(err);
  });
var client = thrift.createClient(Proxy, connection);

//under workload config 1
//3 policies in a loop
console.log("Workload Mode: Random Select");
for(k=0;k<POLICY.length;k++)
{
	console.log("Cache Eviction Mode: "+POLICY[k]);
	//calculate average page acceess time under diff cache sizes for policy[k]
	for(i=0;i<CACHE_SIZE.length;i++)
	{
		var cacheSize = CACHE_SIZE[i];
		var overallStart = new Date().getTime();
		
		for (j=0;j<MAX_PAGE;j++)
		{
			var url =URLList[Math.floor(Math.random() * URLList.length)];
			client.get(url, cacheSize, POLICY[k], function(err, response) {
			//PROBLEM: client call is not blocked at all
			});
		}
		var overallEnd = new Date().getTime();
		var overallTime = overallEnd - overallStart;
		console.log("Cache Size: "+cacheSize+
		    	    "  Policy: "+POLICY[k]+
			    " Avg. Time: "+(overallTime/MAX_PAGE)+" ms");
	}

	//calculate peak page access time under diff cache sizes for policy[k]
	for(i=0;i<CACHE_SIZE.length;i++)
	{
		var cacheSize = CACHE_SIZE[i];
		var peak=0;
		for (j=0;j<MAX_PAGE;j++)
		{	
			var start = new Date().getTime();
			var url = URLList[Math.round(Math.random() * URLList.length)];
			client.get(url, cacheSize, POLICY[k], function(err, response) {});
			var end = new Date().getTime();
			var time = end -start;
			if(time>peak) peak = time;
		}
		console.log("Cache Size: "+cacheSize+
			    "  Policy: "+POLICY[k]+
			    " Peak Time: "+peak+" ms");
	}
}

//under workload config 2
console.log("Workload Mode: Back and Forth");
for(k=0;k<POLICY.length;k++)
{
	console.log("Cache Eviction Mode: "+POLICY[k]);
	//calculate average page acceess time under diff cache sizes for policy[k]
	for(i=0;i<CACHE_SIZE.length;i++)
	{
		var cacheSize = CACHE_SIZE[i];
		var overallStart = new Date().getTime();
		var index=0;//index pattern => 1,2,3...n-1,n,n-1,n-2...3,2,1
		var increase=1;
		for (j=0;j<MAX_PAGE;j++)
		{	
			if(increase)
			{
				index++;
				if(index==URLList.length-1) increase=0;
			}
			else
			{
				index--;
				if(index==0) increase=1;
			}

			var url =URLList[index];
			client.get(url, cacheSize, POLICY[k], function(err, response) {});
		}
		var overallEnd = new Date().getTime();
		var overallTime = overallEnd - overallStart;
		console.log("Cache Size: "+cacheSize+
			    "  Policy: "+POLICY[k]+
			    " Avg. Time: "+(overallTime/MAX_PAGE)+" ms");
	}

	//calculate peak page access time under diff cache sizes for policy[k]
	for(i=0;i<CACHE_SIZE.length;i++)
	{
		var cacheSize = CACHE_SIZE[i];
		var peak=0;
		var index=0;//index pattern => 1,2,3...n-1,n,n-1,n-2...3,2,1
		var increase=1;
		for (j=0;j<MAX_PAGE;j++)
		{	
			if(increase)
			{
				index++;
				if(index==URLList.length-1) increase=0;
			}
			else
			{
				index--;
				if(index==0) increase=1;
			}

			var url =URLList[index];
			var start = new Date().getTime();
			client.get(url, cacheSize, POLICY[k], function(err, response) {});
			var end = new Date().getTime();
			var time = end -start;
			if(time>peak) peak = time;
		}
		console.log("Cache Size: "+cacheSize+
			    "  Policy: "+POLICY[k]+
			    " Peak Time: "+peak+" ms");
	}
}

