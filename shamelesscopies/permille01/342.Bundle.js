(()=>{"use strict";var e,t,r={2342:(e,t,r)=>{var n=r(3987),i=r(1997),o=r(1758);let s,a,c={},u=[],f=[],l=!1;const p={},h={};class d{constructor(){this.Events=new n.Z,this.Worker=new Worker(new URL(r.p+r.u(837),r.b)),this.OwnQueueSize=new Uint8Array(new SharedArrayBuffer(1)),this.Worker.postMessage({Request:"ShareQueueSize",OwnQueueSize:this.OwnQueueSize}),this.Worker.addEventListener("message",function(e){"Skipped"!==e.data.Request&&self.postMessage(e.data);{const t=e.data.LoadingBatch;h[t]||=0,h[t]++,p[t]===h[t]&&self.postMessage({Request:"FinishedLoadingBatch",LoadingBatch:t})}this.Events.FireEventListeners("Finished")}.bind(this))}}for(let e=0;e<5;e++){let t=new d;u.push(t),t.Events.AddEventListener("Finished",function(e){return function(){S(e)}}.bind(void 0)(e))}function g(e){let t=-1,r=1;for(let e=0;e<5;e++){const n=Atomics.load(u[e].OwnQueueSize,0);n<r&&(r=n,t=e)}l&&-1!==t?(u[t].Worker.postMessage(e),Atomics.add(u[t].OwnQueueSize,0,1)):f.push(e)}function S(e){0!==f.length&&(u[e].Worker.postMessage(f.shift()),Atomics.add(u[e].OwnQueueSize,0,1))}function v(e,t){fetch(e).then((e=>e.text())).then((e=>{t(e)}))}!function e(){if(self.setTimeout(e,1),l)for(;f.length>0;){let e=-1,t=1;for(let r=0;r<5;r++){const n=Atomics.load(u[r].OwnQueueSize,0);n<t&&(t=n,e=r)}if(-1===e)break;u[e].Worker.postMessage(f.shift()),Atomics.add(u[e].OwnQueueSize,0,1)}}(),self.onmessage=function(e){c[e.data.Request]?.(e.data)},c.TransferRRSArray=function(e){a=e.RequiredRegionSelection;for(let t=0;t<5;t++)u[t].Worker.postMessage({Request:"TransferRRSArray",RequiredRegionSelection:e.RequiredRegionSelection})},c.InitialiseBlockRegistry=function(e){s=i.Z.Initialise(e.BlockIDMapping,e.BlockIdentifierMapping);for(let t=0;t<5;t++)u[t].Worker.postMessage({Request:"InitialiseBlockRegistry",BlockIDMapping:e.BlockIDMapping,BlockIdentifierMapping:e.BlockIdentifierMapping})},c.SaveDistancedPointMap=function(e){for(const t of u)t.Worker.postMessage({Request:"SaveDistancedPointMap",DistancedPointMap:e.DistancedPointMap})},c.ShareDataBuffers=function(e){for(const t of u)t.Worker.postMessage(e)},c.ShareStructures=function(e){let t=e.Structures.length,r=0;const n=e.ForeignMapping;for(const i of e.Structures)v(i.FilePath,(function(s,a){if(s?i.Selection=o.Z.DeserialiseBOP(s,n,i.Offset):(console.warn("[MultiWorkerRegionGeneratorManager/ShareStructures/GetFile] An error occurred while loading a structure."),console.warn(a)),++r===t){l=!0;for(const t of u)t.Worker.postMessage({Request:"ShareStructures",Structures:e.Structures})}}))},c.GenerateRegionData=function(e){p[e.LoadingBatch]||=e.BatchSize,g(e)},c.GenerateVirtualRegionData=function(e){p[e.LoadingBatch]||=e.BatchSize,g(e)}}},n={};function i(e){var t=n[e];if(void 0!==t)return t.exports;var o=n[e]={exports:{}};return r[e](o,o.exports,i),o.exports}i.m=r,i.x=()=>{var e=i.O(void 0,[258],(()=>i(2342)));return i.O(e)},e=[],i.O=(t,r,n,o)=>{if(!r){var s=1/0;for(f=0;f<e.length;f++){for(var[r,n,o]=e[f],a=!0,c=0;c<r.length;c++)(!1&o||s>=o)&&Object.keys(i.O).every((e=>i.O[e](r[c])))?r.splice(c--,1):(a=!1,o<s&&(s=o));if(a){e.splice(f--,1);var u=n();void 0!==u&&(t=u)}}return t}o=o||0;for(var f=e.length;f>0&&e[f-1][2]>o;f--)e[f]=e[f-1];e[f]=[r,n,o]},i.d=(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.f={},i.e=e=>Promise.all(Object.keys(i.f).reduce(((t,r)=>(i.f[r](e,t),t)),[])),i.u=e=>e+".Bundle.js",i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e;i.g.importScripts&&(e=i.g.location+"");var t=i.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");r.length&&(e=r[r.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),i.p=e})(),(()=>{i.b=self.location+"";var e={342:1};i.f.i=(t,r)=>{e[t]||importScripts(i.p+i.u(t))};var t=self.webpackChunkElectronProject=self.webpackChunkElectronProject||[],r=t.push.bind(t);t.push=t=>{var[n,o,s]=t;for(var a in o)i.o(o,a)&&(i.m[a]=o[a]);for(s&&s(i);n.length;)e[n.pop()]=1;r(t)}})(),t=i.x,i.x=()=>i.e(258).then(t),i.x()})();