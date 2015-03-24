# node-thrift-proxy
School project


Launch server:
cd RPCProxyServer/ && node app.js

Launch client:
cd RPCPoxyClient/ && ./bin.www

Lanch web browser at:
http://localhost:3000/proxy/[caching policy]/[cache size]/[domain name]

eg.
http://localhost:3000/proxy/FIFO/500000/yahoo.com

http://localhost:3000/proxy/LRU/700000/live.com

http://localhost:3000/proxy/RAND/1000000/google.com
