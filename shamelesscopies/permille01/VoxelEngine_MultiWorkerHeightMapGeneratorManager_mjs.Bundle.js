/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./VoxelEngine/Libraries/Listenable/Listenable.mjs":
/*!*********************************************************!*\
  !*** ./VoxelEngine/Libraries/Listenable/Listenable.mjs ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Listenable)\n/* harmony export */ });\nclass Listenable{\r\n  static Version = \"1.3\";\r\n  static Build = 4;\r\n  constructor(){\r\n    this.EventListeners = [];\r\n  }\r\n  AddEventListener(Event, Listener, Options = {\"TTL\": Infinity, \"Once\": false}){\r\n    if(this.EventListeners[Event] === undefined) this.EventListeners[Event] = [];\r\n    this.EventListeners[Event].push({\r\n      \"Event\": Event,\r\n      \"Listener\": Listener,\r\n      \"Options\": Options\r\n    });\r\n    return this.EventListeners[Event].length - 1;\r\n  }\r\n  RemoveEventListener(Event, ID){\r\n    this.EventListeners[Event].splice(ID, 1);\r\n  }\r\n  FireEventListeners(Event, ...Parameters){\r\n    const Listeners = this.EventListeners[Event];\r\n    if(Listeners === undefined) return;\r\n    const ListenersCopy = [];\r\n    for(let i = 0; i < Listeners.length; i++){\r\n      const Listener = Listeners[i].Listener;\r\n      if(!(this.EventListeners[Event][i].Options.TTL --> 0) || this.EventListeners[Event][i].Options.Once === true){\r\n        this.EventListeners[Event].splice(i--, 1);\r\n      }\r\n      ListenersCopy.push(Listener);\r\n    }\r\n    //This is done to avoid infinite loop if another event listener of the same name is added in the callback\r\n    for(const Listener of ListenersCopy) Listener(...Parameters);\r\n  }\r\n  on(...Args){\r\n    this.AddEventListener(...Args);\r\n  }\r\n};\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/Libraries/Listenable/Listenable.mjs?");

/***/ }),

/***/ "./VoxelEngine/MultiWorkerHeightMapGeneratorManager.mjs":
/*!**************************************************************!*\
  !*** ./VoxelEngine/MultiWorkerHeightMapGeneratorManager.mjs ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Libraries_Listenable_Listenable_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Libraries/Listenable/Listenable.mjs */ \"./VoxelEngine/Libraries/Listenable/Listenable.mjs\");\n\r\n\r\nlet EventHandler = {};\r\nlet Count = 0;\r\nlet Workers = [];\r\nlet Queue = [];\r\nconst MaxWorkers = 3;\r\nconst MaxWorkerQueue = 5;\r\n\r\nlet RequiredRegionsSelection;\r\n\r\nEventHandler.TransferRRS = function(Data){\r\n  RequiredRegionsSelection = Data.RequiredRegionsSelection;\r\n};\r\n\r\nclass WorkerHeightMapGenerator{\r\n  constructor(){\r\n    this.Events = new _Libraries_Listenable_Listenable_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\r\n    this.Worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(\"VoxelEngine_WorkerHeightMapGenerator_mjs\"), __webpack_require__.b));\r\n    this.OwnQueueSize = new Uint8Array(new SharedArrayBuffer(1));\r\n\r\n    this.Worker.postMessage({\r\n      \"Request\": \"ShareQueueSize\",\r\n      \"OwnQueueSize\": this.OwnQueueSize\r\n    });\r\n\r\n    this.Worker.postMessage({\r\n      \"Request\": \"TransferRequiredRegionsArray\",\r\n      \"RequiredRegionsSelection\": RequiredRegionsSelection\r\n    });\r\n\r\n    this.Worker.addEventListener(\"message\", function(Event){\r\n      self.postMessage(Event.data); //\"SaveHeightMap\", ...\r\n      this.Events.FireEventListeners(\"Finished\");\r\n    }.bind(this));\r\n  }\r\n}\r\n\r\nfor(let i = 0; i < MaxWorkers; i++){\r\n  let WorkerClass = new WorkerHeightMapGenerator;\r\n  Workers.push(WorkerClass);\r\n  WorkerClass.Events.AddEventListener(\"Finished\", (function(ID){\r\n    return function(){\r\n      QueueStep(ID);\r\n    };\r\n  }.bind(undefined))(i));\r\n}\r\n\r\nself.onmessage = function(Event){\r\n  EventHandler[Event.data.Request]?.(Event.data);\r\n}\r\n\r\nvoid function Load(){\r\n  self.setTimeout(Load, 1);\r\n  while(Queue.length > 0){\r\n    let SmallestWorkerID = -1;\r\n    let SmallestQueueSize = MaxWorkerQueue;\r\n    for(let i = 0; i < MaxWorkers; i++){\r\n      const WorkerQueueSize = Atomics.load(Workers[i].OwnQueueSize, 0);\r\n      if(WorkerQueueSize < SmallestQueueSize){\r\n        SmallestQueueSize = WorkerQueueSize;\r\n        SmallestWorkerID = i;\r\n      }\r\n    }\r\n    if(SmallestWorkerID === -1) break;\r\n    Workers[SmallestWorkerID].Worker.postMessage(Queue.shift());\r\n    Atomics.add(Workers[SmallestWorkerID].OwnQueueSize, 0, 1);\r\n  }\r\n}();\r\n\r\nfunction QueueWorkerTask(Data){\r\n  let SmallestWorkerID = -1;\r\n  let SmallestQueueSize = MaxWorkerQueue;\r\n  for(let i = 0; i < MaxWorkers; i++){\r\n    const WorkerQueueSize = Atomics.load(Workers[i].OwnQueueSize, 0);\r\n    if(WorkerQueueSize < SmallestQueueSize){\r\n      SmallestQueueSize = WorkerQueueSize;\r\n      SmallestWorkerID = i;\r\n    }\r\n  }\r\n\r\n  if(SmallestWorkerID !== -1){//If the queue has space, immediately send the request to the workers.\r\n    Workers[SmallestWorkerID].Worker.postMessage(Data);\r\n    Atomics.add(Workers[SmallestWorkerID].OwnQueueSize, 0, 1);\r\n  }\r\n  else Queue.push(Data); //Otherwise, add it to the queue.\r\n}\r\n\r\nfunction QueueStep(ID){\r\n  if(Queue.length === 0) return;\r\n  //console.log(ID);\r\n  Workers[ID].Worker.postMessage(Queue.shift());\r\n  Atomics.add(Workers[ID].OwnQueueSize, 0, 1);\r\n}\r\n\r\nEventHandler.SetSeed = function(Data){\r\n  for(let i = 0; i < MaxWorkers; i++){\r\n    Workers[i].Worker.postMessage(Data);\r\n  }\r\n}\r\n\r\nEventHandler.GenerateHeightMap = function(Data){\r\n  QueueWorkerTask(Data);\r\n}\r\n\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/MultiWorkerHeightMapGeneratorManager.mjs?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".Bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = self.location + "";
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"VoxelEngine_MultiWorkerHeightMapGeneratorManager_mjs": 1
/******/ 		};
/******/ 		
/******/ 		// no chunk install function needed
/******/ 		// no chunk loading
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./VoxelEngine/MultiWorkerHeightMapGeneratorManager.mjs");
/******/ 	
/******/ })()
;