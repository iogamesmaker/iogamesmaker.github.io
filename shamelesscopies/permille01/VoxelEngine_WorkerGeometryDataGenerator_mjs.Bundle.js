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

/***/ "./VoxelEngine/WorkerGeometryDataGenerator.mjs":
/*!*****************************************************!*\
  !*** ./VoxelEngine/WorkerGeometryDataGenerator.mjs ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _World_Region_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./World/Region.mjs */ \"./VoxelEngine/World/Region.mjs\");\n/* harmony import */ var _World_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./World/RegionSD.mjs */ \"./VoxelEngine/World/RegionSD.mjs\");\n\r\n\r\n\r\nlet Requests = 0;\r\nlet RequestsWhenLastGC = 0;\r\nlet RequestsWhenLastCheck = 0;\r\n\r\nif(self.gc) void function CollectGarbage(){\r\n  self.setTimeout(CollectGarbage, 1000);\r\n  let RequestsSinceLastGC = Requests - RequestsWhenLastGC;\r\n  let RequestsSinceLastCheck = Requests - RequestsWhenLastCheck;\r\n  if(RequestsSinceLastGC > 2000 && RequestsSinceLastCheck < 4){\r\n    //Do a GC if there have been a lot of requests AND if the worker isn't busy.\r\n    self.gc();\r\n    RequestsWhenLastGC = Requests;\r\n  }\r\n  RequestsWhenLastCheck = Requests;\r\n}();\r\n\r\nlet VoxelTypes;\r\nlet Data8;\r\nlet Data64;\r\nlet GPUBoundingBox1;\r\nlet GPUInfo8;\r\nlet GPUInfo64;\r\nlet Data64Offset;\r\nlet OwnQueueSize;\r\n\r\nlet EventHandler = {};\r\n\r\nself.onmessage = function(Event){\r\n  EventHandler[Event.data.Request]?.(Event.data);\r\n};\r\n\r\nEventHandler.SaveStuff = function(Data){\r\n  VoxelTypes = Data.VoxelTypes;\r\n  Data8 = Data.Data8;\r\n  Data64 = Data.Data64;\r\n  GPUBoundingBox1 = Data.GPUBoundingBox1;\r\n  GPUInfo8 = Data.GPUInfo8;\r\n  GPUInfo64 = Data.GPUInfo64;\r\n  Data64Offset = Data.Data64Offset;\r\n  OwnQueueSize = Data.OwnQueueSize;\r\n};\r\n\r\nEventHandler.GenerateBoundingGeometry = function(Data){\r\n  Requests++;\r\n\r\n  const RegionX = Data.RegionX;\r\n  const RegionY = Data.RegionY;\r\n  const RegionZ = Data.RegionZ;\r\n  const Depth = Data.Depth;\r\n  const Info = [];\r\n\r\n  const x64 = RegionX - Data64Offset[Depth * 3 + 0];\r\n  const y64 = RegionY - Data64Offset[Depth * 3 + 1];\r\n  const z64 = RegionZ - Data64Offset[Depth * 3 + 2];\r\n\r\n  const Info64 = GPUInfo64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64];\r\n\r\n\r\n  const Location64 = Info64 & 0x0fffffff;\r\n  const CPULocation64 = Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] & 0x0007ffff;\r\n  let IndexCounter = 0;\r\n\r\n\r\n\r\n\r\n  //Important: The order in which these triangles are entered could influence how fast the mesh is rendered.\r\n  //This could be leveraged to boost fps even more depending on the direction that's being looked at, however,\r\n  //that would require multiple versions of the same mesh to be sent to the gpu.\r\n  //This order is probably the best compromise, since x/z sides are more likely to be looked at than the y side.\r\n  //\r\n  //For reference, this is how different orders performed:\r\n  //xyz, while looking at +x, +z: 480 fps\r\n  //xyz, while looking at -x, -z: 230 fps\r\n  //yxz, while looking anywhere:  330 fps (+/- 30 fps depending on x/z)\r\n  //The latter is the best choice because it gives a consistent framerate regardless of which direction the camera is facing.\r\n  //\r\n  //It also matters whether the loops iterate from 0 -> 7 or 7 -> 0: the former works better for looking in +ve directions\r\n  //of the outermost loop direction, and the latter for -ve directions. This could be the best and easiest optimisation\r\n  //to undertake, and could possibly yield a ~30% fps boost, at the cost of doubling or tripling the meshes sent to the gpu.\r\n  //In this case, it probably makes sense to use the order xzy or zxy.\r\n\r\n  for(let y8 = 7; y8 >= 0; --y8) for(let x8 = 7; x8 >= 0; --x8) for(let z8 = 7; z8 >= 0; --z8){\r\n    const Exists = ((GPUInfo8[(Location64 << 9) | (x8 << 6) | (y8 << 3) | z8] >> 31) & 1) === 0;\r\n    if(Exists){\r\n      const LocalIndex8 = (x8 << 6) | (y8 << 3) | z8;\r\n      const Index8 = (Location64 << 9) | LocalIndex8;\r\n      const Location8 = GPUInfo8[Index8] & 0x0fffffff;\r\n\r\n      const MinX = (GPUBoundingBox1[Index8] >> 15) & 7;\r\n      const MinY = (GPUBoundingBox1[Index8] >> 12) & 7;\r\n      const MinZ = (GPUBoundingBox1[Index8] >> 9) & 7;\r\n      const MaxX = (GPUBoundingBox1[Index8] >> 6) & 7;\r\n      const MaxY = (GPUBoundingBox1[Index8] >> 3) & 7;\r\n      const MaxZ = GPUBoundingBox1[Index8] & 7;\r\n\r\n      if(MaxX < MinX || MaxY < MinY || MaxZ < MinZ) continue;\r\n\r\n      //This section optimises the bounding box faces by removing the parts which are occluded by the blocks in front of it.\r\n      //TODO: I disabled this!!\r\n      //1. I should not do this on faces of 8-chunks which are in the middle of a 64-chunk so that there aren't holes when\r\n      //half of a chunk is hidden\r\n      //2. When the AllocationIndex[0] exceeds the Data8 buffer size, indexing VoxelTypes starts to give strange results\r\n      //and strange holes in the mesh can be seen (because the code thinks the side is occluded)\r\n      //Using this can increase the fps by a lot. (10-30%)\r\n      PlusX: {\r\n        let NewMinY = MinY;\r\n        let NewMinZ = MinZ;\r\n        let NewMaxY = MaxY;\r\n        let NewMaxZ = MaxZ;\r\n\r\n        if(false){}\r\n        //This is because it is at the outer side of a block\r\n        NewMaxY++;\r\n        NewMaxZ++;\r\n\r\n        IndexCounter += 6;\r\n\r\n        Info.push(\r\n          (4 << 21) | (MinX << 17) | (NewMaxY << 13) | (NewMinZ << 9) | LocalIndex8,\r\n          (4 << 21) | (MinX << 17) | (NewMinY << 13) | (NewMinZ << 9) | LocalIndex8,\r\n          (4 << 21) | (MinX << 17) | (NewMaxY << 13) | (NewMaxZ << 9) | LocalIndex8,\r\n          (4 << 21) | (MinX << 17) | (NewMinY << 13) | (NewMaxZ << 9) | LocalIndex8\r\n        );\r\n      }\r\n\r\n      PlusY: {\r\n        let NewMinX = MinX;\r\n        let NewMinZ = MinZ;\r\n        let NewMaxX = MaxX;\r\n        let NewMaxZ = MaxZ;\r\n\r\n        if(false){}\r\n        //This is because it is at the outer side of a block\r\n        NewMaxX++;\r\n        NewMaxZ++;\r\n\r\n        IndexCounter += 6;\r\n\r\n        Info.push(\r\n          (5 << 21) | (NewMaxX << 17) | (MinY << 13) | (NewMaxZ << 9) | LocalIndex8,\r\n          (5 << 21) | (NewMinX << 17) | (MinY << 13) | (NewMaxZ << 9) | LocalIndex8,\r\n          (5 << 21) | (NewMaxX << 17) | (MinY << 13) | (NewMinZ << 9) | LocalIndex8,\r\n          (5 << 21) | (NewMinX << 17) | (MinY << 13) | (NewMinZ << 9) | LocalIndex8\r\n        );\r\n      }\r\n\r\n      PlusZ: {\r\n        let NewMinX = MinX;\r\n        let NewMinY = MinY;\r\n        let NewMaxX = MaxX;\r\n        let NewMaxY = MaxY;\r\n\r\n        if(false){}\r\n        //This is because it is at the outer side of a block\r\n        NewMaxX++;\r\n        NewMaxY++;\r\n\r\n        IndexCounter += 6;\r\n\r\n        Info.push(\r\n          (6 << 21) | (NewMaxX << 17) | (NewMinY << 13) | (MinZ << 9) | LocalIndex8,\r\n          (6 << 21) | (NewMinX << 17) | (NewMinY << 13) | (MinZ << 9) | LocalIndex8,\r\n          (6 << 21) | (NewMaxX << 17) | (NewMaxY << 13) | (MinZ << 9) | LocalIndex8,\r\n          (6 << 21) | (NewMinX << 17) | (NewMaxY << 13) | (MinZ << 9) | LocalIndex8\r\n        );\r\n      }\r\n\r\n      MinusX: {\r\n        let NewMinY = MinY;\r\n        let NewMinZ = MinZ;\r\n        let NewMaxY = MaxY;\r\n        let NewMaxZ = MaxZ;\r\n\r\n        if(false){}\r\n        //This is because it is at the outer side of a block\r\n        NewMaxY++;\r\n        NewMaxZ++;\r\n\r\n        IndexCounter += 6;\r\n\r\n        Info.push(\r\n          (2 << 21) | ((MaxX + 1) << 17) | (NewMaxY << 13) | (NewMaxZ << 9) | LocalIndex8,\r\n          (2 << 21) | ((MaxX + 1) << 17) | (NewMinY << 13) | (NewMaxZ << 9) | LocalIndex8,\r\n          (2 << 21) | ((MaxX + 1) << 17) | (NewMaxY << 13) | (NewMinZ << 9) | LocalIndex8,\r\n          (2 << 21) | ((MaxX + 1) << 17) | (NewMinY << 13) | (NewMinZ << 9) | LocalIndex8\r\n        );\r\n      }\r\n\r\n      MinusY: {\r\n        let NewMinX = MinX;\r\n        let NewMinZ = MinZ;\r\n        let NewMaxX = MaxX;\r\n        let NewMaxZ = MaxZ;\r\n\r\n        if(false){}\r\n        //This is because it is at the outer side of a block\r\n        NewMaxX++;\r\n        NewMaxZ++;\r\n\r\n        IndexCounter += 6;\r\n\r\n        Info.push(\r\n          (1 << 21) | (NewMinX << 17) | ((MaxY + 1) << 13) | (NewMaxZ << 9) | LocalIndex8,\r\n          (1 << 21) | (NewMaxX << 17) | ((MaxY + 1) << 13) | (NewMaxZ << 9) | LocalIndex8,\r\n          (1 << 21) | (NewMinX << 17) | ((MaxY + 1) << 13) | (NewMinZ << 9) | LocalIndex8,\r\n          (1 << 21) | (NewMaxX << 17) | ((MaxY + 1) << 13) | (NewMinZ << 9) | LocalIndex8\r\n        );\r\n      }\r\n\r\n      MinusZ: {\r\n        let NewMinX = MinX;\r\n        let NewMinY = MinY;\r\n        let NewMaxX = MaxX;\r\n        let NewMaxY = MaxY;\r\n\r\n        if(false){}\r\n        //This is because it is at the outer side of a block\r\n        NewMaxX++;\r\n        NewMaxY++;\r\n\r\n        IndexCounter += 6;\r\n\r\n        Info.push(\r\n          (0 << 21) | (NewMinX << 17) | (NewMinY << 13) | ((MaxZ + 1) << 9) | LocalIndex8,\r\n          (0 << 21) | (NewMaxX << 17) | (NewMinY << 13) | ((MaxZ + 1) << 9) | LocalIndex8,\r\n          (0 << 21) | (NewMinX << 17) | (NewMaxY << 13) | ((MaxZ + 1) << 9) | LocalIndex8,\r\n          (0 << 21) | (NewMaxX << 17) | (NewMaxY << 13) | ((MaxZ + 1) << 9) | LocalIndex8\r\n        );\r\n      }\r\n    }\r\n  }\r\n\r\n\r\n\r\n  if(OwnQueueSize !== undefined) Atomics.sub(OwnQueueSize, 0, 1); //Decrease own queue size if needed\r\n\r\n  const TypedInfo = new Uint32Array(Info);\r\n  self.postMessage({\r\n    \"Request\": \"GenerateBoundingGeometry\",\r\n    \"IndexCount\": IndexCounter,\r\n    \"Info\": TypedInfo,\r\n    \"RegionX\": RegionX,\r\n    \"RegionY\": RegionY,\r\n    \"RegionZ\": RegionZ,\r\n    \"Depth\": Depth,\r\n    \"Time\": Data.Time\r\n  }, [TypedInfo.buffer]);\r\n};\r\n\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/WorkerGeometryDataGenerator.mjs?");

/***/ }),

/***/ "./VoxelEngine/World/Region.mjs":
/*!**************************************!*\
  !*** ./VoxelEngine/World/Region.mjs ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Region\": () => (/* binding */ Region),\n/* harmony export */   \"VirtualRegion\": () => (/* binding */ VirtualRegion)\n/* harmony export */ });\n/* harmony import */ var _RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RegionSD.mjs */ \"./VoxelEngine/World/RegionSD.mjs\");\n\r\nclass Region{\r\n  static Version = \"Alpha 0.1.4.16\";\r\n  static Build = 33;\r\n\r\n  static X_LENGTH = 32;\r\n  static X_POWER = 5;\r\n  static X_LENGTH_SQUARED = 1024;\r\n  static X_LENGTH_MINUS_ONE = 31;\r\n\r\n  static Y_LENGTH = 64;\r\n  static Y_POWER = 6;\r\n  static Y_LENGTH_SQUARED = 4096;\r\n  static Y_LENGTH_MINUS_ONE = 63;\r\n\r\n  static Z_LENGTH = 32;\r\n  static Z_POWER = 5;\r\n  static Z_LENGTH_SQUARED = 1024;\r\n  static Z_LENGTH_MINUS_ONE = 31;\r\n\r\n  constructor(SharedData, RegionData, RegionX, RegionY, RegionZ){\r\n    this.SharedData = SharedData;\r\n    this.RegionData = RegionData;\r\n\r\n    this.RegionX = RegionX;\r\n    this.RegionY = RegionY;\r\n    this.RegionZ = RegionZ;\r\n\r\n    this.ThreadSafeTime = self.performance.now();\r\n\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].REQUEST_TIME] = this.ThreadSafeTime;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].UNLOAD_TIME] = -Infinity;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].DATA_ATTACHED] = 0;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].REGION_X] = RegionX;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].REGION_Y] = RegionY;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].REGION_Z] = RegionZ;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].DEPTH] = -1;\r\n  }\r\n\r\n  GetIdentifier(){\r\n    return this.RegionX + \",\" + this.RegionY + \",\" + this.RegionZ;\r\n  }\r\n\r\n  Init(RegionData, CommonBlock, IsEntirelySolid){\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].LOADED] = 1;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].COMMON_BLOCK] = CommonBlock ?? -1;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].IS_ENTIRELY_SOLID] = IsEntirelySolid | 0;\r\n\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].GD_REQUIRED] = 1;\r\n\r\n    if(!CommonBlock || this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].DEPTH] !== -1){\r\n      this.RegionData = RegionData;\r\n      this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].DATA_ATTACHED] = 1;\r\n      this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].REVERSE_DATA_ACKNOWLEDGED] = 1;\r\n      return true;\r\n    } else{\r\n      this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].DATA_ATTACHED] = 0;\r\n      return false;\r\n    }\r\n  }\r\n\r\n  Destruct(){\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].UNLOAD_TIME] = self.performance.now();\r\n\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].LOADED] = 0;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].DATA_ATTACHED] = 0;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].GD_REQUIRED] = 0;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].GD_UPDATE_REQUIRED] = 0;\r\n\r\n    this.RegionData = undefined;\r\n  }\r\n\r\n  SetBlock(rX, rY, rZ, BlockID){\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].GD_REQUIRED] = 1;\r\n    this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].GD_UPDATE_REQUIRED] = 1;\r\n\r\n    if(this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].IS_ENTIRELY_SOLID] === 1 && BlockID === 0){\r\n      this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].IS_ENTIRELY_SOLID] = 0;\r\n    }\r\n\r\n    let NewlyCreatedData = false;\r\n    if(!this.RegionData){\r\n      this.RegionData = new Uint16Array(new SharedArrayBuffer(Region.X_LENGTH * Region.Y_LENGTH * Region.Z_LENGTH * 2));\r\n      NewlyCreatedData = true;\r\n    }\r\n\r\n    if(this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].COMMON_BLOCK] !== -1){\r\n      if(NewlyCreatedData) this.RegionData.set(this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].COMMON_BLOCK]);\r\n\r\n      if(BlockID !== this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].COMMON_BLOCK]) this.SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].COMMON_BLOCK] = -1;\r\n    }\r\n    this.Data[rX * Region.Z_LENGTH * Region.Y_LENGTH + rY * Region.Z_LENGTH + rZ] = BlockID;\r\n    return NewlyCreatedData;\r\n  }\r\n}\r\n\r\nclass VirtualRegion extends Region{\r\n  constructor(SharedData, RegionData, RegionX, RegionY, RegionZ, Depth){\r\n    SharedData[_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].DEPTH] = Depth;\r\n    super(SharedData, RegionData, RegionX, RegionY, RegionZ);\r\n    this.Depth = Depth;\r\n  }\r\n}\r\n/*\r\nexport class MicroRegion extends Region{\r\n\r\n  static X_LENGTH = 16;\r\n  static X_POWER = 4;\r\n  static X_LENGTH_SQUARED = 256;\r\n  static X_LENGTH_MINUS_ONE = 15;\r\n\r\n  static Y_LENGTH = 16;\r\n  static Y_POWER = 4;\r\n  static Y_LENGTH_SQUARED = 256;\r\n  static Y_LENGTH_MINUS_ONE = 15;\r\n\r\n  static Z_LENGTH = 16;\r\n  static Z_POWER = 4;\r\n  static Z_LENGTH_SQUARED = 256;\r\n  static Z_LENGTH_MINUS_ONE = 15;\r\n\r\n  constructor(RegionX, RegionY, RegionZ){\r\n    super(RegionX, RegionY, RegionZ);\r\n  }\r\n}*/\r\n\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/World/Region.mjs?");

/***/ }),

/***/ "./VoxelEngine/World/RegionSD.mjs":
/*!****************************************!*\
  !*** ./VoxelEngine/World/RegionSD.mjs ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nconst REGION_SD = {\r\n  \"REQUEST_TIME\": 0,\r\n\r\n  \"UNLOAD_TIME\": 1,\r\n  \"DATA_ATTACHED\": 2,\r\n\r\n  \"MAIN_THREAD_RECEIVED\": 3,\r\n  \"LOADED\": 4,\r\n  \"LOAD_ACKNOWLEDGED\": 5,\r\n  \"GD_REQUIRED\": 6,\r\n  \"GD_UPDATE_REQUIRED\": 7,\r\n  \"REVERSE_DATA_ACKNOWLEDGED\": 8,\r\n\r\n  \"REGION_X\": 9,\r\n  \"REGION_Y\": 10,\r\n  \"REGION_Z\": 11,\r\n  \"DEPTH\": 12,\r\n\r\n  \"IS_ENTIRELY_SOLID\": 13,\r\n  \"COMMON_BLOCK\": 14,\r\n\r\n  \"LOADING_STAGE\": 15,\r\n\r\n  \"BUFFER_SIZE\": 16 * 8\r\n};\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (REGION_SD);\r\n\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/World/RegionSD.mjs?");

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
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./VoxelEngine/WorkerGeometryDataGenerator.mjs");
/******/ 	
/******/ })()
;