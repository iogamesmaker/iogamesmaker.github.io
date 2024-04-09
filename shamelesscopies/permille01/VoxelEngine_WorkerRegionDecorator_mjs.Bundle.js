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

/***/ "./VoxelEngine/WorkerRegionDecorator.mjs":
/*!***********************************************!*\
  !*** ./VoxelEngine/WorkerRegionDecorator.mjs ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _World_Region_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./World/Region.mjs */ \"./VoxelEngine/World/Region.mjs\");\n/* harmony import */ var _World_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./World/RegionSD.mjs */ \"./VoxelEngine/World/RegionSD.mjs\");\n/* harmony import */ var _Block_BlockRegistry_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Block/BlockRegistry.mjs */ \"./VoxelEngine/Block/BlockRegistry.mjs\");\n/* harmony import */ var _Libraries_SVM_SVM_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Libraries/SVM/SVM.mjs */ \"./VoxelEngine/Libraries/SVM/SVM.mjs\");\n\r\n\r\n\r\n\r\n\r\nclass NoData8Exception extends Error {\r\n  constructor() {\r\n    super(\"Ran out of Data8 memory.\");\r\n    this.name = \"NoData8Exception\";\r\n  }\r\n}\r\n\r\nlet Requests = 0;\r\nlet RequestsWhenLastGC = 0;\r\nlet RequestsWhenLastCheck = 0;\r\n\r\nif(self.gc) void function CollectGarbage(){\r\n  self.setTimeout(CollectGarbage, 1000);\r\n  let RequestsSinceLastGC = Requests - RequestsWhenLastGC;\r\n  let RequestsSinceLastCheck = Requests - RequestsWhenLastCheck;\r\n  if(RequestsSinceLastGC > 2000 && RequestsSinceLastCheck < 4){\r\n    //Do a GC if there have been a lot of requests AND if the worker isn't busy.\r\n    self.gc();\r\n    RequestsWhenLastGC = Requests;\r\n  }\r\n  RequestsWhenLastCheck = Requests;\r\n}();\r\n\r\nfunction* RandomNumberGenerator(Seed){\r\n  while(true) yield (Seed = Seed * 0x41a7 % 0x7fffffff) / 0x7fffffff;\r\n}\r\n\r\nfunction Hash(x){\r\n  x = ((x >>> 16) ^ x) * 0x045d9f3b;\r\n  x = ((x >>> 16) ^ x) * 0x045d9f3b;\r\n  x = (x >>> 16) ^ x;\r\n  return x / 0xffffffff + .5;\r\n}\r\n\r\n//Yes, it's not actually random and yes, it's good enough.\r\nfunction RandomValue(X, Y, Z){\r\n  let w = ((X & 0xfff) << 20) | ((Y & 0xff) << 12) | (Z & 0xfff);\r\n  w = ((w >>> 16) ^ w) * 0x045d9f3b;\r\n  w = ((w >>> 16) ^ w) * 0x045d9f3b;\r\n  w = (w >>> 16) ^ w;\r\n  return w / 0xffffffff + .5;\r\n}\r\n\r\nconst EventHandler = {};\r\n\r\nself.onmessage = function(Event){\r\n  EventHandler[Event.data.Request]?.(Event.data);\r\n};\r\n\r\nlet MainBlockRegistry;\r\nlet RequiredRegions;\r\nlet OwnQueueSize;\r\nlet DistancedPointMap;\r\n\r\nlet Structures = [];\r\n\r\nlet VoxelTypes, Data1, Data8, Data64;\r\nlet AllocationIndex, AllocationArray;\r\nlet AllocationIndex64, AllocationArray64;\r\nlet Data64Offset;\r\n\r\nconst EmptyData1 = new Uint8Array(64).fill(0b11111111); //Empty\r\nconst EmptyVoxelTypes = new Uint16Array(512); //Air\r\n\r\nfunction AllocateData8(Location64, x8, y8, z8) {\r\n  const Index = Atomics.add(AllocationIndex, 0, 1) & (AllocationArray.length - 1);\r\n  const Location = Atomics.exchange(AllocationArray, Index, 2147483647); //Probably doesn't need to be atomic. Setting 2147483647 to mark location as invalid.\r\n  if(Location === 2147483647){\r\n    Atomics.sub(AllocationIndex, 0, 1);\r\n    throw new NoData8Exception;\r\n  }\r\n  Data8[(Location64 << 9) | (x8 << 6) | (y8 << 3) | z8] = Location | 0x40000000; //GPU update\r\n  Data1.set(EmptyData1, Location << 6);\r\n  VoxelTypes.set(EmptyVoxelTypes, Location << 9);\r\n  return Location;\r\n}\r\n\r\nfunction AllocateData64(x64, y64, z64){\r\n  const Index = Atomics.add(AllocationIndex64, 0, 1) & 4095;\r\n  const Location64 = Atomics.exchange(AllocationArray64, Index, 65535);\r\n  if(Location64 === 65535) debugger;\r\n  const Index64 = (x64 << 6) | (y64 << 3) | z64;\r\n\r\n  Data64[Index64] &=~(1 << 31); //Mark existence\r\n  Data64[Index64] &=~0x0007ffff; //Reset location\r\n  Data64[Index64] |= Location64; //This is the StartIndex8 used in the other function.\r\n  Data64[Index64] |= 1 << 30; //Set GPU update to true\r\n  return Location64;\r\n}\r\n\r\nEventHandler.InitialiseBlockRegistry = function(Data){\r\n  MainBlockRegistry = _Block_BlockRegistry_mjs__WEBPACK_IMPORTED_MODULE_2__[\"default\"].Initialise(Data.BlockIDMapping, Data.BlockIdentifierMapping);\r\n};\r\n\r\nEventHandler.TransferRequiredRegionsArray = function(Data){\r\n  RequiredRegions = Data.RequiredRegions;\r\n};\r\n\r\nEventHandler.ShareQueueSize = function(Data){\r\n  OwnQueueSize = Data.OwnQueueSize;\r\n};\r\n\r\nEventHandler.SaveDistancedPointMap = function(Data){\r\n  DistancedPointMap = Data.DistancedPointMap;\r\n  console.log(DistancedPointMap);\r\n};\r\n\r\nEventHandler.ShareDataBuffers = function(Data){\r\n  VoxelTypes = Data.VoxelTypes;\r\n  Data1 = Data.Data1;\r\n  Data8 = Data.Data8;\r\n  Data64 = Data.Data64;\r\n  AllocationIndex = Data.AllocationIndex;\r\n  AllocationArray = Data.AllocationArray;\r\n  AllocationIndex64 = Data.AllocationIndex64;\r\n  AllocationArray64 = Data.AllocationArray64;\r\n  Data64Offset = Data.Data64Offset;\r\n};\r\n\r\nEventHandler.ShareStructures = function(Data){\r\n  for(const Structure of Data.Structures){\r\n    Structure.Selection = _Libraries_SVM_SVM_mjs__WEBPACK_IMPORTED_MODULE_3__[\"default\"].FromObject(Structure.Selection);\r\n    Structures.push(Structure);\r\n  }\r\n};\r\n\r\nEventHandler.DecorateRegion = function(Data){\r\n  const RegionX = Data.RegionX;\r\n  const RegionY = Data.RegionY;\r\n  const RegionZ = Data.RegionZ;\r\n  const rx64 = RegionX - Data64Offset[0];\r\n  const ry64 = RegionY - Data64Offset[1];\r\n  const rz64 = RegionZ - Data64Offset[2];\r\n  if(rx64 < 0 || rx64 > 7 || ry64 < 0 || ry64 > 7 || rz64 < 0 || rz64 > 7) console.warn(\"Generating out of bounds!!\");\r\n  Requests++;\r\n\r\n  const Index64 = (rx64 << 6) | (ry64 << 3) | rz64;\r\n  //??\r\n  //Data64[Index64] = (Data64[Index64] & ~(7 << 19)) | (7 << 19); //Set state to 7 (fully loaded)\r\n  const ModifiedData64 = new Set([Index64]); //Add current region to modification set (so it's uploaded to the gpu)\r\n  Data64[Index64] &=~(1 << 30); //Suppress updates while region is being modified. This will be set at the end.\r\n  const SetBlock = function(X, Y, Z, BlockType){\r\n    if(BlockType === 0) return;\r\n    const ix64 = rx64 + (X >> 6);\r\n    const iy64 = ry64 + (Y >> 6);\r\n    const iz64 = rz64 + (Z >> 6);\r\n    const Index64 = (ix64 << 6) | (iy64 << 3) | iz64;\r\n    ModifiedData64.add(Index64);\r\n    let Info64 = Data64[Index64];\r\n    let Location64 = Info64 & 0x0007ffff;\r\n    //I could probably remove this check by allocating it beforehand, and deallocating it if nothing was written to it\r\n    if(((Info64 >> 31) & 1) === 1) Location64 = AllocateData64(ix64, iy64, iz64);\r\n    Data64[Index64] |= 1 << 30;\r\n    Data64[Index64] &= ~(1 << 31);\r\n    const Index8 = (Location64 << 9) | (((X >> 3) & 7) << 6) | (((Y >> 3) & 7) << 3) | ((Z >> 3) & 7);\r\n    let Info8 = Data8[Index8];\r\n    try {\r\n      if (((Info8 >> 31) & 1) === 1) Info8 = AllocateData8(Location64, (X >> 3) & 7, (Y >> 3) & 7, (Z >> 3) & 7);\r\n      else if (((Info8 >> 28) & 1) === 1) { //Uniform type, have to decompress\r\n        const UniformType = Info8 & 0x0000ffff;\r\n        Info8 = AllocateData8(Location64, (X >> 3) & 7, (Y >> 3) & 7, (Z >> 3) & 7);\r\n        const Location8 = Info8 & 0x0fffffff;\r\n        for (let i = 0; i < 512; ++i) VoxelTypes[(Location8 << 9) | i] = UniformType;\r\n        for (let i = 0; i < 64; ++i) Data1[(Location8 << 6) | i] = 0;\r\n      }\r\n    } catch(Error){\r\n      if(Error instanceof NoData8Exception){\r\n        console.error(\"Ran out of Data8 while decorating region.\");\r\n        if(OwnQueueSize) Atomics.sub(OwnQueueSize, 0, 1);\r\n        return self.postMessage({\r\n          \"Request\": \"NoData8\"\r\n        });\r\n      } else throw Error;\r\n    }\r\n    const Location8 = Info8 & 0x0fffffff;\r\n    Data8[Index8] |= 1 << 30; //Looks like this has to be done every time. (GPU update)\r\n    const Index = (Location8 << 6) | ((X & 7) << 3) | (Y & 7);\r\n    Data1[Index] &= ~(1 << (Z & 7)); //Sets it to 0, which means solid\r\n    VoxelTypes[(Index << 3) | (Z & 7)] = BlockType;\r\n  };\r\n\r\n  const Points6 = DistancedPointMap[6][(RegionX & 7) * 8 + (RegionZ & 7)];\r\n  for(const {X, Z} of Points6){\r\n    const PasteHeight = Math.floor(Data.Maps.HeightMap[X * 64 + Z]);\r\n    const Temperature = Data.Maps.TemperatureMap[X * 64 + Z];\r\n    const Slope = Data.Maps.SlopeMap[X * 64 + Z];\r\n\r\n    const Random = RandomValue(X + RegionX * 64, 0, Z + RegionZ * 64);\r\n    const Random2 = RandomValue(X + RegionX * 64, 3, Z + RegionZ * 64);\r\n\r\n    if((RegionY + 1) * 64 > PasteHeight && PasteHeight >= RegionY * 64){\r\n      if(Random > Temperature / 2.) continue;\r\n      if(PasteHeight < 0) continue;\r\n      if(Random2 < PasteHeight / 1000. || Random2 * 2 < Slope) continue;\r\n      const Y = PasteHeight - RegionY * 64;\r\n      //if(Random < 0.97) continue;\r\n      //                        Important: the Y vvv value is 1 as to generate a different hash than for the temperature.\r\n      const Tree = (RandomValue(X + RegionX * 64, 1, Z + RegionZ * 64) * Structures.length) >> 0;\r\n      Structures[Tree].Selection.DirectPaste(X, Y, Z, 1, null, SetBlock);\r\n      //SetBlock(X, PasteHeight - RegionY * 64, Z, 5);\r\n    }\r\n  }\r\n  Data64[Index64] = (Data64[Index64] & ~(7 << 19)) | (7 << 19); //Set state to 7 (finished loading)\r\n  for(const dIndex64 of ModifiedData64) Data64[dIndex64] |= (1 << 30), Data64[dIndex64] &=~(1 << 29); //Request GPU and mesh updates\r\n  if(OwnQueueSize) Atomics.sub(OwnQueueSize, 0, 1);\r\n  self.postMessage({\r\n    \"Request\": \"Finished\",\r\n    RegionX,\r\n    RegionY,\r\n    RegionZ\r\n  });\r\n};\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/WorkerRegionDecorator.mjs?");

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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["VoxelEngine_Block_BlockRegistry_mjs-VoxelEngine_Libraries_SVM_SVM_mjs-VoxelEngine_Libraries_S-2a9e21"], () => (__webpack_require__("./VoxelEngine/WorkerRegionDecorator.mjs")))
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
/******/ 			"VoxelEngine_WorkerRegionDecorator_mjs": 1
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
/******/ 			return __webpack_require__.e("VoxelEngine_Block_BlockRegistry_mjs-VoxelEngine_Libraries_SVM_SVM_mjs-VoxelEngine_Libraries_S-2a9e21").then(next);
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