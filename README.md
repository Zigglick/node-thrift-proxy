# node-thrift-proxy
Advanced OS Project 3

Launch server:
cd RPCProxyServer/ && node app.js

Launch client:
cd RPCPoxyClient/ && node ./bin/www

Run testing scripts:
cd RPCProxyClient/

Then

node test-random.js

or

node test-backforth.js


or

node test-crawler.js

Alternatively, to actually use the proxy, launch web browser at:
http://localhost:3000/proxy/[caching policy]/[cache size]/[domain name]

eg.
http://localhost:3000/proxy/FIFO/500000/yahoo.com

http://localhost:3000/proxy/LRU/700000/live.com

http://localhost:3000/proxy/RAND/1000000/google.com


![screen](/screen.png?raw=true "screen")
