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

/***/ "./VoxelEngine/WorkerHeightMapGenerator.mjs":
/*!**************************************************!*\
  !*** ./VoxelEngine/WorkerHeightMapGenerator.mjs ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _World_Region_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./World/Region.mjs */ \"./VoxelEngine/World/Region.mjs\");\n/* harmony import */ var _GetHeight_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GetHeight.mjs */ \"./VoxelEngine/GetHeight.mjs\");\n/* harmony import */ var _Simplex_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Simplex.js */ \"./VoxelEngine/Simplex.js\");\n\r\n\r\n\r\n_Simplex_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"].seed(17);\r\n\r\nlet Requests = 0;\r\nlet RequestsWhenLastGC = 0;\r\nlet RequestsWhenLastCheck = 0;\r\n\r\nif(self.gc) void function CollectGarbage(){\r\n  self.setTimeout(CollectGarbage, 1000);\r\n  let RequestsSinceLastGC = Requests - RequestsWhenLastGC;\r\n  let RequestsSinceLastCheck = Requests - RequestsWhenLastCheck;\r\n  if(RequestsSinceLastGC > 2000 && RequestsSinceLastCheck < 4){\r\n    //Do a GC if there have been a lot of requests AND if the worker isn't busy.\r\n    self.gc();\r\n    RequestsWhenLastGC = Requests;\r\n  }\r\n  RequestsWhenLastCheck = Requests;\r\n}();\r\n\r\n(0,_GetHeight_mjs__WEBPACK_IMPORTED_MODULE_1__.ReSeed)(17);\r\n\r\n\r\n/*\r\n  Might be more effective performance-wise to have all of these points saved in a file and then load them into\r\n  memory when needed instead of generating them on the fly. However, this could be ~1MB in json format, and\r\n  I can't be bothered to write a compressor/decompressor just to save maybe 200ms per load, at least for now.\r\n */\r\n\r\n//console.time();\r\n\r\n\r\n/*const DistancedNearbyPointMap = {};\r\n\r\nfor(const Density of [6, 10, 15]){\r\n  DistancedNearbyPointMap[Density] = {};\r\n  let DensityObject = DistancedNearbyPointMap[Density];\r\n  for(let RegionX = 0; RegionX < 16; RegionX++) for(let RegionZ = 0; RegionZ < 16; RegionZ++){\r\n    const Points = [];\r\n    for(let dX = -1; dX < 2; dX++) for(let dZ = -1; dZ < 2; dZ++){\r\n      const rX = dX + RegionX;\r\n      const rZ = dZ + RegionZ;\r\n      const NewPoints = DistancedPointMap[Density][(rX & 15) * 16 + (rZ & 15)];\r\n      for(const {X, Z} of NewPoints) Points.push({\"X\": X + Math.sign(dX) * 32, \"Z\": Z + Math.sign(dZ) * 32});\r\n    }\r\n    const Identifier = RegionX * 16 + RegionZ;\r\n    DensityObject[Identifier] = Points;\r\n  }\r\n}*/\r\n//console.timeEnd();\r\n\r\nself.EventHandler = {};\r\n\r\nself.onmessage = function(Event){\r\n  EventHandler[Event.data.Request]?.(Event.data);\r\n};\r\n\r\nEventHandler.SetSeed = function(Data){\r\n  (0,_GetHeight_mjs__WEBPACK_IMPORTED_MODULE_1__.ReSeed)(Data.Seed);\r\n};\r\n\r\nlet OwnQueueSize;\r\nEventHandler.ShareQueueSize = function(Data){\r\n  OwnQueueSize = Data.OwnQueueSize;\r\n};\r\n\r\nEventHandler.GenerateHeightMap = function(Data){\r\n  Requests++;\r\n  const RegionX = Data.RegionX;\r\n  const RegionZ = Data.RegionZ;\r\n  const Factor = 2 ** Data.Depth;\r\n\r\n  const FloatHeightMap = new Float32Array(64 * 64);\r\n  const FloatTemperatureMap = new Float32Array(64 * 64);\r\n  const FloatSlopeMap = new Float32Array(64 * 64);\r\n\r\n  const XLength = Data.XLength;\r\n  const ZLength = Data.ZLength;\r\n\r\n  let MinHeight = Infinity;\r\n  let MaxHeight = -Infinity;\r\n\r\n  for(let X = RegionX * 64, rX = 0, Stride = 0; rX < XLength; X++, rX++){\r\n    for(let Z = RegionZ * 64, rZ = 0; rZ < ZLength; Z++, rZ++){\r\n      const Height = (0,_GetHeight_mjs__WEBPACK_IMPORTED_MODULE_1__.GetHeight)(X * Factor, Z * Factor);\r\n      FloatHeightMap[Stride] = Height;\r\n      FloatTemperatureMap[Stride++] = (_Simplex_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"].simplex2(Factor * X / 1000, Factor * Z / 1000) / 2 + .5);\r\n      if(MinHeight > Height) MinHeight = Height;\r\n      if(MaxHeight < Height) MaxHeight = Height;\r\n    }\r\n  }\r\n  if(Data.GenerateSlopeMap){\r\n    const AverageLength = 3;\r\n    const XRatio = AverageLength / 64;\r\n    const ZRatio = AverageLength / 64;\r\n    for(let X = RegionX * 64, rX = 0, Stride = 0; rX < 64; X++, rX++){\r\n      const CurrentX = Math.ceil(rX - rX * XRatio);\r\n      for(let Z = RegionZ * 64, rZ = 0; rZ < 64; Z++, rZ++){\r\n        const CurrentZ = Math.ceil(rZ - rZ * ZRatio);\r\n        const Height = FloatHeightMap[CurrentX * 64 + CurrentZ];\r\n        const SlopeX = Math.abs(FloatHeightMap[(CurrentX + AverageLength - 1) * 64 + CurrentZ] - Height);\r\n        const SlopeZ = Math.abs(FloatHeightMap[CurrentX * 64 + AverageLength + CurrentZ - 1] - Height);\r\n        const Slope = Math.max(SlopeX, SlopeZ); //TODO: Make a better slope calculation.\r\n        FloatSlopeMap[Stride++] = Slope / Factor;\r\n      }\r\n    }\r\n  }\r\n  if(OwnQueueSize) Atomics.sub(OwnQueueSize, 0, 1);\r\n  self.postMessage({\r\n    \"Request\": \"SaveHeightMap\",\r\n    \"XLength\": XLength,\r\n    \"ZLength\": ZLength,\r\n    \"RegionX\": Data.RegionX,\r\n    \"RegionZ\": Data.RegionZ,\r\n    \"Depth\": Data.Depth, //Could be undefined if it's not for a virtual region.\r\n    \"HeightMap\": FloatHeightMap,\r\n    \"SlopeMap\": FloatSlopeMap,\r\n    \"TemperatureMap\": FloatTemperatureMap,\r\n    \"MinHeight\": MinHeight,\r\n    \"MaxHeight\": MaxHeight/*,\r\n    \"Points\": Data.Depth === -1 ? {\r\n      \"6\": DistancedPointMap[6][(RegionX & 15) * 16 + (RegionZ & 15)],\r\n      \"10\": DistancedPointMap[10][(RegionX & 15) * 16 + (RegionZ & 15)],\r\n      \"15\": DistancedPointMap[15][(RegionX & 15) * 16 + (RegionZ & 15)]\r\n    } : {}*/\r\n  });\r\n};\r\n\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/WorkerHeightMapGenerator.mjs?");

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
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["VoxelEngine_GetHeight_mjs-VoxelEngine_World_Region_mjs"], () => (__webpack_require__("./VoxelEngine/WorkerHeightMapGenerator.mjs")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
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
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"VoxelEngine_WorkerHeightMapGenerator_mjs": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkElectronProject"] = self["webpackChunkElectronProject"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("VoxelEngine_GetHeight_mjs-VoxelEngine_World_Region_mjs").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;