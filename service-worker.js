if(!self.define){let n,i={};const e=(e,c)=>(e=new URL(e+".js",c).href,i[e]||new Promise((i=>{if("document"in self){const n=document.createElement("script");n.src=e,n.onload=i,document.head.appendChild(n)}else n=e,importScripts(e),i()})).then((()=>{let n=i[e];if(!n)throw new Error(`Module ${e} didn’t register its module`);return n})));self.define=(c,o)=>{const s=n||("document"in self?document.currentScript.src:"")||location.href;if(i[s])return;let r={};const l=n=>e(n,s),f={module:{uri:s},exports:r,require:l};i[s]=Promise.all(c.map((n=>f[n]||l(n)))).then((n=>(o(...n),r)))}}define(["./workbox-3c958eff"],(function(n){"use strict";n.setCacheNameDetails({prefix:"mqtttiles"}),self.addEventListener("message",(n=>{n.data&&"SKIP_WAITING"===n.data.type&&self.skipWaiting()})),n.precacheAndRoute([{url:"css/1.456bd961.css",revision:null},{url:"css/3.9b20521d.css",revision:null},{url:"css/app.e7e53c4f.css",revision:null},{url:"css/vendor.9712c46f.css",revision:null},{url:"favicon.ico",revision:"6a398e80a59c5be4e5cb574e6f72d631"},{url:"fonts/KFOkCnqEu92Fr1MmgVxIIzQ.68bb21d0.woff",revision:null},{url:"fonts/KFOlCnqEu92Fr1MmEU9fBBc-.48af7707.woff",revision:null},{url:"fonts/KFOlCnqEu92Fr1MmSU5fBBc-.c2f7ab22.woff",revision:null},{url:"fonts/KFOlCnqEu92Fr1MmWUlfBBc-.77ecb942.woff",revision:null},{url:"fonts/KFOlCnqEu92Fr1MmYUtfBBc-.f5677eb2.woff",revision:null},{url:"fonts/KFOmCnqEu92Fr1Mu4mxM.f1e2a767.woff",revision:null},{url:"fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.4d73cb90.woff",revision:null},{url:"fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.c5371cfb.woff2",revision:null},{url:"fonts/materialdesignicons-webfont.d8e8e0f7.woff",revision:null},{url:"fonts/materialdesignicons-webfont.e9db4005.woff2",revision:null},{url:"grid-9px-light.png",revision:"c806426925589f17b3a2134850872288"},{url:"icons/apple-icon-152x152.png",revision:"cf4fa3ec0ec96cd47e2d73d302af1716"},{url:"icons/apple-touch-icon-114x114.png",revision:"3ec551b38d5fc9df52e5891850e2bb05"},{url:"icons/apple-touch-icon-120x120.png",revision:"d96f1c935149ba49e4fe5c173ab257b3"},{url:"icons/apple-touch-icon-144x144.png",revision:"457e201cb44bbf929a441a4c31955ab0"},{url:"icons/apple-touch-icon-152x152.png",revision:"5bbfe74c5337a0274d33ad6c9508933f"},{url:"icons/apple-touch-icon-57x57.png",revision:"6ca38f2c550252ff214f4c2b75ae02bd"},{url:"icons/apple-touch-icon-60x60.png",revision:"2a43bae514c656e860a8ece15d3d1115"},{url:"icons/apple-touch-icon-72x72.png",revision:"3f4fe93c1e76d3d2226a641dfd63210d"},{url:"icons/apple-touch-icon-76x76.png",revision:"1c94d86bf6b3db238df933f40d79c936"},{url:"icons/favicon-128x128.png",revision:"c973814e56ef4c2880534a90797e971d"},{url:"icons/favicon-16x16.png",revision:"38e884c9114660366c69ca0390e7deae"},{url:"icons/favicon-196x196.png",revision:"1288c509d62807d356dc3c840521809a"},{url:"icons/favicon-32x32.png",revision:"0e3fb5411838ed21c6c2aa8868bcf4c2"},{url:"icons/favicon-96x96.png",revision:"3ef203ebfd8d9682c952608a3e4ba4ac"},{url:"icons/icon-128x128.png",revision:"c973814e56ef4c2880534a90797e971d"},{url:"icons/icon-192x192.png",revision:"e1e243ed1d0ede18157ac17c17a0d2aa"},{url:"icons/icon-256x256.png",revision:"4335745280dd52c742248f24116ff768"},{url:"icons/icon-384x384.png",revision:"68853917849c40e8e8b7e5dfdb5ab922"},{url:"icons/icon-512x512.png",revision:"853d7b482c93458838e7ab1b1798e6f4"},{url:"icons/ms-icon-144x144.png",revision:"457e201cb44bbf929a441a4c31955ab0"},{url:"icons/mstile-144x144.png",revision:"457e201cb44bbf929a441a4c31955ab0"},{url:"icons/mstile-150x150.png",revision:"3985a59ab7e51a65da385c0aded04626"},{url:"icons/mstile-310x150.png",revision:"f45dcc8e5dfdd3f42a9006cda65a5ca3"},{url:"icons/mstile-310x310.png",revision:"cc6ffcc57666a7d6371105eb8464db68"},{url:"icons/mstile-70x70.png",revision:"1278d26cea8d24a048e3bc6f3ddea5b4"},{url:"img/icomoon.ed52e165.svg",revision:null},{url:"index.html",revision:"5d905fb4c3418fb0cd77c8638c97a099"},{url:"js/1.17534a54.js",revision:null},{url:"js/3.986c233c.js",revision:null},{url:"js/4.97cef4ca.js",revision:null},{url:"js/app.9f47ac40.js",revision:null},{url:"manifest.json",revision:"e7a653f90f8c69a0581fe790d461a8b8"},{url:"mqtttiles-logo.png",revision:"c973814e56ef4c2880534a90797e971d"}],{}),n.registerRoute(new n.NavigationRoute(n.createHandlerBoundToURL("index.html"),{denylist:[/service-worker\.js$/,/workbox-(.)*\.js$/]}))}));
