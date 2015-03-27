var request = require('request');


(function(){
  var MAX_PAGE=30;
  var CACHE_SIZE=[-1,1000000,2000000,3000000,4000000,5000000,6000000,7000000,8000000,9000000,10000000];
  var POLICY =["RAND","FIFO","LRU"];
  var SEED = "reddit.com";
  
  console.log("Workload Mode: Random crawler (user behavior)");
  var ms = 0, p = 0, c = 0, i = 0;
  var inter;
  var url = SEED;
  var suite = function(p,c,i) {

    request({method: 'GET', uri: 'http://localhost:3000/proxy/'+POLICY[p]+'/'+CACHE_SIZE[c]+'/'+url, jar: true}, function (error, response, body) {
      
      // Simulate the behavior of a user by selcting a random link on the current web page as the destination
      var cpt = 0;
      do{
        cpt++;
        url = body.split('href="http://')[Math.floor(Math.random()*body.split('href="http://').length)].split('/')[0];
        if(cpt==50) url = SEED; // We got lost, let's reset
      }while(url.indexOf('<') != -1 || url.indexOf('.') == -1); // Valid URL?
      
      if(p == 0 && i == 0 && c == 0) console.log("Cache Eviction Mode: "+POLICY[p]);
      i++;
      if(c == CACHE_SIZE.length-1){
        c = 0;
        p++;
        console.log(p);
        console.log("Cache Eviction Mode: "+POLICY[p]);
      }
      if(i == MAX_PAGE-1){
        clearInterval(inter);
        console.log("Cache Size: "+CACHE_SIZE[c]+
        "  Policy: "+POLICY[p]+
        " Avg. Time: "+(ms/MAX_PAGE)+" ms");
        ms = 0;
        i = 0;
        c++;
        url = SEED;
        if(p < POLICY.length) inter = setInterval(function(){ms++;}, 1);
      } 
      if(p < POLICY.length && c < CACHE_SIZE.length && i < MAX_PAGE) suite(p,c,i);
    });
  };
  inter = setInterval(function(){ms++;}, 1);
  suite(p,c,i);
}());

