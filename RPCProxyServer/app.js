var thrift = require("thrift");
var Proxy = require("./gen-nodejs/Proxy");
var request = require('request');

var g_cacheSize = 0;
var cache = {};
cache.url = [null];
cache.content = [null];
cache.time = [null];
cache.size = 0;

var server = thrift.createServer(Proxy, {
  get: function(url, cacheSize, policy, res) {
    console.log("Max cache size: "+cacheSize);
    console.log("Caching policy: "+policy);
    
    // Cache size parameter changed, flush cache
    if(g_cacheSize != cacheSize){
      console.log("New cache size");
      g_cacheSize = cacheSize;
      cache.url = [];
      cache.content = [];
      cache.time = [];
      cache.size = 0;
    }
    
    console.log(cache.url);
    
    // Do we have the page in cache?
    var find = cache.url.binarySearchFast(url);
    
    
    if(find == -1){ // No
      console.log("GET "+url);
      request({method: 'GET', uri: url, jar: true}, function (error, response, body) {
        if(error) throw error;
        console.log("STATUSCODE: "+ response.statusCode);
        console.log("Serving from web and caching: "+url);
        
        if(cache.size + body.length > g_cacheSize){ // Eviction needed, which policy?
          var i = 0;
          if(policy == 'RAND'){
            i = Math.floor(Math.random()*cache.content.length);
            // Element i is random
          } else if(policy == 'FIFO'){
            i = 0;
            // Element i is the "first in"
          } else if(policy == 'LRU'){
            var sorted = cache.time.quickSort();
            i = cache.time.binarySearchFast(sorted[0]);
            // Element i has the lowest timestamp
          } else console.log("Unknown policy, defaulting to FIFO.");
          if(cache.content[i]){
            cache.size -= cache.content[i].length;
            cache.content.splice(i,1);
            cache.url.splice(i,1);
            cache.time.splice(i,1);
          }
          console.log("Cache eviction performed");
        }
        cache.url.push(url);
        cache.content.push(body);
        cache.time.push(Math.floor(Date.now() / 1000));
        cache.size += body.length;
        console.log("Current cache size: "+cache.size);
        
        res(null, body);
      });
    } else { // Yes
      console.log("Serving from cache (updating timestamp): "+url);
      cache.time[find] = Math.floor(Date.now() / 1000);
      console.log("Current cache size: "+cache.size);
      res(null, cache.content[find]);
    }
  }
},{});

Array.prototype.binarySearchFast = function(value) {
  var startIndex = 0,
        stopIndex = this.length - 1,
        middle = Math.floor((stopIndex + startIndex) / 2);

  while (this[middle] != value && startIndex < stopIndex) {
    if (value < this[middle]) stopIndex = middle - 1;
    else if (value > this[middle]) startIndex = middle + 1;

    //recalculate middle
    middle = Math.floor((stopIndex + startIndex) / 2);
  }
  return (this[middle] != value) ? -1 : middle;
};


    

Array.prototype.quickSort = function () {
    if (this.length <= 1)
        return this;
 
    var pivot = this[Math.round(this.length / 2)];
 
    return this.filter(function (x) { return x <  pivot }).quickSort().concat(
           this.filter(function (x) { return x == pivot })).concat(
           this.filter(function (x) { return x >  pivot }).quickSort());
};

server.listen(9090);

