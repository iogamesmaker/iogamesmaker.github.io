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

/***/ "./VoxelEngine/WorkerRegionGenerator.mjs":
/*!***********************************************!*\
  !*** ./VoxelEngine/WorkerRegionGenerator.mjs ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _World_Region_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./World/Region.mjs */ \"./VoxelEngine/World/Region.mjs\");\n/* harmony import */ var _World_RegionSD_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./World/RegionSD.mjs */ \"./VoxelEngine/World/RegionSD.mjs\");\n/* harmony import */ var _Block_BlockRegistry_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Block/BlockRegistry.mjs */ \"./VoxelEngine/Block/BlockRegistry.mjs\");\n/* harmony import */ var _Libraries_SVM_SVM_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Libraries/SVM/SVM.mjs */ \"./VoxelEngine/Libraries/SVM/SVM.mjs\");\n/* harmony import */ var _Libraries_SVM_SVMUtils_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Libraries/SVM/SVMUtils.mjs */ \"./VoxelEngine/Libraries/SVM/SVMUtils.mjs\");\n/* harmony import */ var _GetHeight_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./GetHeight.mjs */ \"./VoxelEngine/GetHeight.mjs\");\n/* harmony import */ var _World_LoadManager_DataManager_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./World/LoadManager/DataManager.mjs */ \"./VoxelEngine/World/LoadManager/DataManager.mjs\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n(0,_GetHeight_mjs__WEBPACK_IMPORTED_MODULE_5__.ReSeed)(17); //This is for pasting trees..\r\n\r\nclass NoData8Exception extends Error {\r\n  constructor() {\r\n    super(\"Ran out of Data8 memory.\");\r\n    this.name = \"NoData8Exception\";\r\n  }\r\n}\r\n\r\nlet Requests = 0;\r\nlet RequestsWhenLastGC = 0;\r\nlet RequestsWhenLastCheck = 0;\r\nlet Structures = [];\r\n\r\nif(self.gc) void function CollectGarbage(){\r\n  self.setTimeout(CollectGarbage, 1000);\r\n  let RequestsSinceLastGC = Requests - RequestsWhenLastGC;\r\n  let RequestsSinceLastCheck = Requests - RequestsWhenLastCheck;\r\n  if(RequestsSinceLastGC > 2000 && RequestsSinceLastCheck < 4){\r\n    //Do a GC if there have been a lot of requests AND if the worker isn't busy.\r\n    self.gc();\r\n    RequestsWhenLastGC = Requests;\r\n  }\r\n  RequestsWhenLastCheck = Requests;\r\n}();\r\n\r\nfunction Hash(x){\r\n  x = ((x >>> 16) ^ x) * 0x045d9f3b;\r\n  x = ((x >>> 16) ^ x) * 0x045d9f3b;\r\n  x = (x >>> 16) ^ x;\r\n  return x / 0xffffffff + .5;\r\n}\r\n\r\n//Yes, it's not actually random and yes, it's good enough.\r\nfunction RandomValue(X, Y, Z){\r\n  let w = ((X & 0xfff) << 20) | ((Y & 0xff) << 12) | (Z & 0xfff);\r\n  w = ((w >>> 16) ^ w) * 0x045d9f3b;\r\n  w = ((w >>> 16) ^ w) * 0x045d9f3b;\r\n  w = (w >>> 16) ^ w;\r\n  return w / 0xffffffff + .5;\r\n}\r\n\r\nconst EventHandler = {};\r\n\r\nself.onmessage = function(Event){\r\n  EventHandler[Event.data.Request]?.(Event.data);\r\n};\r\n\r\nlet MainBlockRegistry;\r\nlet RequiredRegions;\r\nlet OwnQueueSize;\r\nlet ScaledDistancedPointMap = [];\r\n\r\nlet VoxelTypes, Data1, Data8, Data64;\r\nlet AllocationIndex, AllocationArray;\r\nlet AllocationIndex64, AllocationArray64;\r\nlet Data64Offset;\r\n\r\nfunction AllocateData8(StartIndex8, x8, y8, z8){\r\n  const Index = Atomics.add(AllocationIndex, 0, 1) & (AllocationArray.length - 1);\r\n  const Location = Atomics.exchange(AllocationArray, Index, 2147483647); //Probably doesn't need to be atomic. Setting 2147483647 to mark location as invalid.\r\n  if(Location === 2147483647){\r\n    Atomics.sub(AllocationIndex, 0, 1);\r\n    throw new NoData8Exception;\r\n  }\r\n  Data8[(StartIndex8 << 9) | (x8 << 6) | (y8 << 3) | z8] = Location | (1 << 30);\r\n  return Location;\r\n}\r\n\r\nfunction AllocateData64(x64, y64, z64, Depth){\r\n  const Index = Atomics.add(AllocationIndex64, 0, 1) & 4095;\r\n  const Location64 = Atomics.exchange(AllocationArray64, Index, 65535);\r\n  //IMP/ORTANT: This sets the empty bit to not empty (1). It will have to be re-set manually if the Data64 is not deallocated. This is done because this might cause loading issues later.\r\n  Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] &=~(1 << 31);\r\n  Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] &=~0x0007ffff; //Reset any previous location.\r\n  //I can't just set it directly because I need to preserve the load state which should be 1 (started loading).\r\n  Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] |= Location64; //This is the StartIndex8 used in the other function.\r\n  return Location64;\r\n}\r\n\r\nfunction DeallocateData8(Index8){\r\n  const Location = Data8[Index8];\r\n  if((Location & 0x80000000) !== 0) return;\r\n  if((Location & 0x10000000) === 0){ //Doesn't have uniform type, so has to deallocate Data1 and VoxelTypes memory\r\n    const DeallocIndex = Atomics.add(AllocationIndex, 1, 1) & (AllocationArray.length - 1);\r\n    Atomics.store(AllocationArray, DeallocIndex, Location);\r\n  }\r\n  Data8[Index8] = 0x80000000;\r\n}\r\n\r\nfunction DeallocateData64(Location64, x64, y64, z64, Depth){\r\n  const DeallocIndex = Atomics.add(AllocationIndex64, 1, 1) & 4095; //Indexing 1 for deallocation.\r\n  Atomics.store(AllocationArray64, DeallocIndex, Location64); //Add location back to the allocation array to be reused.\r\n  Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] &=~0x0007ffff; //Reset previous location.\r\n  Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] |= 1 << 31; //Set existence marker to indicate that it's empty.\r\n}\r\n\r\nEventHandler.InitialiseBlockRegistry = function(Data){\r\n  MainBlockRegistry = _Block_BlockRegistry_mjs__WEBPACK_IMPORTED_MODULE_2__[\"default\"].Initialise(Data.BlockIDMapping, Data.BlockIdentifierMapping);\r\n};\r\n\r\nEventHandler.TransferRequiredRegionsArray = function(Data){\r\n  RequiredRegions = Data.RequiredRegions;\r\n};\r\n\r\nEventHandler.ShareDataBuffers = function(Data){\r\n  VoxelTypes = Data.VoxelTypes;\r\n  Data1 = Data.Data1;\r\n  Data8 = Data.Data8;\r\n  Data64 = Data.Data64;\r\n  AllocationIndex = Data.AllocationIndex;\r\n  AllocationArray = Data.AllocationArray;\r\n  AllocationIndex64 = Data.AllocationIndex64;\r\n  AllocationArray64 = Data.AllocationArray64;\r\n  Data64Offset = Data.Data64Offset;\r\n};\r\n\r\nEventHandler.ShareQueueSize = function(Data){\r\n  OwnQueueSize = Data.OwnQueueSize;\r\n};\r\n\r\nEventHandler.SaveDistancedPointMap = function(Data){\r\n  console.time();\r\n  ScaledDistancedPointMap[0] = Data.DistancedPointMap;\r\n  let Width = 8;\r\n  let Depth = 1;\r\n  do{\r\n    ScaledDistancedPointMap[Depth] = {};\r\n    const CurrentSDPM = ScaledDistancedPointMap[Depth];\r\n    const PreviousSDPM = ScaledDistancedPointMap[Depth - 1];\r\n\r\n    for(const Density in PreviousSDPM){\r\n      CurrentSDPM[Density] = {};\r\n      const CurrentDensity = CurrentSDPM[Density];\r\n      const PreviousDensity = PreviousSDPM[Density];\r\n      for(let X = 0; X < Width; X += 2) for(let Z = 0; Z < Width; Z += 2){\r\n        const x = X / 2;\r\n        const z = Z / 2;\r\n        const Identifier = x * Width / 2 + z; //Identifiers always multiply by 16.\r\n        CurrentDensity[Identifier] = [];\r\n        for(let dx = 0; dx < 2; dx++) for(let dz = 0; dz < 2; dz++) {\r\n          for(const Point of PreviousDensity[(X + dx) * Width + Z + dz]){\r\n            const PointX = Point.X;\r\n            const PointZ = Point.Z;\r\n            CurrentDensity[Identifier].push({\"X\": (64 << (Depth - 1)) * dx + PointX, \"Z\": (64 << (Depth - 1)) * dz + PointZ});\r\n          }\r\n        }\r\n      }\r\n    }\r\n  } while(Depth++, (Width /= 2) > 1);\r\n  console.timeEnd();\r\n};\r\n\r\nEventHandler.ShareStructures = function(Data){\r\n  for(const Structure of Data.Structures){\r\n    Structure.Selection = _Libraries_SVM_SVM_mjs__WEBPACK_IMPORTED_MODULE_3__[\"default\"].FromObject(Structure.Selection);\r\n    Structures.push(Structure);\r\n  }\r\n};\r\n\r\nconst TempDataBuffer = new Uint16Array(8 * 8 * 8);\r\nconst TempTypeBuffer = new Uint16Array(8 * 8);\r\n\r\nconst EmptyDataBuffer = new Uint16Array(8 * 8 * 8);\r\nconst EmptyTypeBuffer = new Uint16Array(8 * 8); //Somehow, TypedArray.set(Empty, 0) is 5x faster than TypedArray.fill(0)... so enjoy.\r\n\r\nEventHandler.GenerateRegionData = function(Data){\r\n  const RegionX = Data.RegionX;\r\n  const RegionY = Data.RegionY;\r\n  const RegionZ = Data.RegionZ;\r\n\r\n  const rx64 = RegionX - Data64Offset[0];\r\n  const ry64 = RegionY - Data64Offset[1];\r\n  const rz64 = RegionZ - Data64Offset[2];\r\n\r\n  Requests++;\r\n\r\n  const AirID = MainBlockRegistry.GetBlockByIdentifier(\"primary:air\").ID;\r\n  const GrassID = MainBlockRegistry.GetBlockByIdentifier(\"default:grass\").ID;\r\n  const RockID = MainBlockRegistry.GetBlockByIdentifier(\"default:rock\").ID;\r\n  const Rock1ID = MainBlockRegistry.GetBlockByIdentifier(\"default:rock1\").ID;\r\n  const WaterID = MainBlockRegistry.GetBlockByIdentifier(\"default:water\").ID;\r\n\r\n  const HeightMap = Data.HeightMap;\r\n  const SlopeMap = Data.SlopeMap;\r\n  const TemperatureMap = Data.TemperatureMap;\r\n\r\n\r\n  const Location64 = AllocateData64(rx64, ry64, rz64, 0);\r\n\r\n  const x1Offset = RegionX * 64;\r\n  const y1Offset = RegionY * 64;\r\n  const z1Offset = RegionZ * 64;\r\n\r\n  const Index64 = (rx64 << 6) | (ry64 << 3) | rz64;\r\n  let WrittenTo64 = false;\r\n  for(let x8 = 0; x8 < 8; ++x8) for(let y8 = 0; y8 < 8; ++y8) for(let z8 = 0; z8 < 8; ++z8){\r\n    const Index8 = (Location64 << 9) | (x8 << 6) | (y8 << 3) | z8;\r\n    TempDataBuffer.set(EmptyDataBuffer, 0);\r\n    TempTypeBuffer.set(EmptyTypeBuffer, 0);\r\n    let WrittenTo8 = false;\r\n    let UniformType = -1;\r\n    let HasUniformType = -1;\r\n    for(let x1 = 0; x1 < 8; ++x1) for(let z1 = 0; z1 < 8; ++z1){\r\n      const XPos64 = (x8 << 3) | x1;\r\n      const ZPos64 = (z8 << 3) | z1;\r\n      const MapIndex = (XPos64 << 6) | ZPos64;\r\n      const Height = Math.floor(HeightMap[MapIndex]);\r\n      const Slope = SlopeMap[MapIndex];\r\n      for(let y1 = 0; y1 < 8; ++y1){\r\n        let Type;\r\n        const X = x1Offset + x8 * 8 + x1;\r\n        const Z = z1Offset + z8 * 8 + z1;\r\n        const Y = y1Offset + y8 * 8 + y1;\r\n\r\n        if(Height > Y){\r\n          if(Slope < 4 - Height / 350) Type = GrassID;\r\n          else if(Slope < 5.5570110493302 - Height / 350) Type = RockID;\r\n          else Type = Rock1ID;\r\n        }\r\n        else{\r\n          if(Height < 0 && Y < 0){\r\n            Type = WaterID;\r\n          } else{\r\n            Type = AirID;\r\n          }\r\n        }\r\n        if(Type !== UniformType){\r\n          UniformType = Type;\r\n          HasUniformType++;\r\n        }\r\n        if(Type !== 0) WrittenTo8 = true;\r\n        TempDataBuffer[(x1 << 6) | (y1 << 3) | z1] = Type;\r\n        if(Type !== 0){ //For now, this just checks against air, but it will be more complicated than that...\r\n          TempTypeBuffer[(x1 << 3) | y1] |= 0 << z1 * 2;\r\n        } else TempTypeBuffer[(x1 << 3) | y1] |= 1 << z1;\r\n      }\r\n    }\r\n    if(!WrittenTo8) continue;\r\n    WrittenTo64 = true;\r\n    if(HasUniformType === 0){ //Means that it has a uniform type, and can be compressed.\r\n      Data8[Index8] = (1 << 28);    //Mark Data8 region as uniform type\r\n      Data8[Index8] |= UniformType; //Set uniform type in first 16 bits\r\n      Data8[Index8] |= (1 << 30);   //Mark it as updated to be sent to the gpu (this is usually done in AllocateData8 function)\r\n      continue;\r\n    }\r\n    //Now, since something was actually written to the temp buffer, write it to the Data1 buffer:\r\n    let Location8;\r\n    try {\r\n      Location8 = AllocateData8(Location64, x8, y8, z8); //This automatically registers the Data8\r\n    } catch(Error){\r\n      if(Error instanceof NoData8Exception){\r\n        Data64[Index64] &= ~(7 << 19); //Set stage to 0\r\n        for(let i = 0; i < 512; ++i){\r\n          const Index8 = (Location64 << 9) | i;\r\n          DeallocateData8(Index8);\r\n        }\r\n        DeallocateData64(Location64, rx64, ry64, rz64, 0);\r\n        if(OwnQueueSize) Atomics.sub(OwnQueueSize, 0, 1);\r\n        return self.postMessage({\r\n          \"Request\": \"NoData8\"\r\n        });\r\n      } else throw Error;\r\n    }\r\n\r\n    VoxelTypes.set(TempDataBuffer, Location8 << 9); //Location8 << 9 is the starting index of the voxel data 8x8x8 group.\r\n    Data1.set(TempTypeBuffer, Location8 << 6); //This is Location8 << 6, because the Z axis is compressed into the number.\r\n  }\r\n  if(((Data64[Index64] >> 31) & 1) === 1) console.log(Data64[Index64]);\r\n\r\n  if(!WrittenTo64){\r\n    DeallocateData64(Location64, rx64, ry64, rz64, 0);\r\n  } else{\r\n    Data64[Index64] &=~(1 << 31); //Mark the Data64 as not empty (this is required because of AllocateData64 not setting the existence marker!)\r\n  }\r\n\r\n\r\n  Data64[Index64] = (Data64[Index64] & ~(7 << 19)) | (2 << 19); //Set stage to 2 (finished terrain loading)\r\n\r\n  if(OwnQueueSize) Atomics.sub(OwnQueueSize, 0, 1);\r\n\r\n  self.postMessage({\r\n    \"Request\": \"GeneratedRegionData\",\r\n    \"RegionX\": Data.RegionX,\r\n    \"RegionY\": Data.RegionY,\r\n    \"RegionZ\": Data.RegionZ,\r\n    \"LoadingBatch\": Data.LoadingBatch\r\n  });\r\n};\r\n\r\nEventHandler.GenerateVirtualRegionData = function(Data){\r\n  const RegionX = Data.RegionX;\r\n  const RegionY = Data.RegionY;\r\n  const RegionZ = Data.RegionZ;\r\n  const Depth = Data.Depth;\r\n\r\n  const rx64 = RegionX - Data64Offset[Depth * 3 + 0];\r\n  const ry64 = RegionY - Data64Offset[Depth * 3 + 1];\r\n  const rz64 = RegionZ - Data64Offset[Depth * 3 + 2];\r\n\r\n  Requests++;\r\n\r\n  const Factor = 2 ** Data.Depth;\r\n\r\n  const AirID = MainBlockRegistry.GetBlockByIdentifier(\"primary:air\").ID;\r\n  const GrassID = MainBlockRegistry.GetBlockByIdentifier(\"default:grass\").ID;\r\n  const RockID = MainBlockRegistry.GetBlockByIdentifier(\"default:rock\").ID;\r\n  const Rock1ID = MainBlockRegistry.GetBlockByIdentifier(\"default:rock1\").ID;\r\n  const WaterID = MainBlockRegistry.GetBlockByIdentifier(\"default:water\").ID;\r\n  const LeavesID = MainBlockRegistry.GetBlockByIdentifier(\"default:leaves\").ID;\r\n\r\n  const HeightMap = Data.HeightMap;\r\n  const SlopeMap = Data.SlopeMap;\r\n  const TemperatureMap = Data.TemperatureMap;\r\n\r\n  const Location64 = AllocateData64(rx64, ry64, rz64, Depth);\r\n  const Index64 = (Depth << 9) | (rx64 << 6) | (ry64 << 3) | rz64;\r\n\r\n  if(((Data64[Index64] >> 31) & 1) === 1) console.log(\"Allocation: \" + Data64[Index64]);\r\n\r\n  try {\r\n    let WrittenTo64 = false;\r\n    for (let x8 = 0; x8 < 8; ++x8) for (let y8 = 0; y8 < 8; ++y8) for (let z8 = 0; z8 < 8; ++z8) {\r\n      const Index8 = (Location64 << 9) | (x8 << 6) | (y8 << 3) | z8;\r\n      TempDataBuffer.set(EmptyDataBuffer, 0);\r\n      TempTypeBuffer.set(EmptyTypeBuffer, 0);\r\n      let WrittenTo8 = false;\r\n      let UniformType = -1;\r\n      let HasUniformType = -1;\r\n      for (let x1 = 0; x1 < 8; ++x1) for (let z1 = 0; z1 < 8; ++z1) {\r\n        const XPos64 = (x8 << 3) | x1;\r\n        const ZPos64 = (z8 << 3) | z1;\r\n        const MapIndex = (XPos64 << 6) | ZPos64;\r\n        const Height = Math.floor(HeightMap[MapIndex] / Factor) * Factor;\r\n        const Slope = SlopeMap[MapIndex];\r\n        for (let y1 = 0; y1 < 8; ++y1) {\r\n          let Type;\r\n          const Y = (RegionY * 64 + y8 * 8 + y1) * Factor;\r\n          const X = (RegionX * 64 + x8 * 8 + x1) * Factor;\r\n          const Z = (RegionZ * 64 + z8 * 8 + z1) * Factor;\r\n          if (Height > Y) {\r\n            if (Slope < 4 - Height / 350) Type = GrassID;\r\n            else if (Slope < 5.5570110493302 - Height / 350) Type = RockID;\r\n            else Type = Rock1ID;\r\n          } else {\r\n            if (Height < 0 && Y < 0) {\r\n              Type = WaterID;\r\n            } else {\r\n              Type = AirID;\r\n            }\r\n          }\r\n          if (Type !== UniformType) {\r\n            UniformType = Type;\r\n            HasUniformType++;\r\n          }\r\n          if (Type !== 0) WrittenTo8 = true;\r\n          TempDataBuffer[(x1 << 6) | (y1 << 3) | z1] = Type;\r\n          if (Type !== 0) { //For now, this just checks against air, but it will be more complicated than that...\r\n            TempTypeBuffer[(x1 << 3) | y1] |= 0 << z1 * 2;\r\n          } else TempTypeBuffer[(x1 << 3) | y1] |= 1 << z1;\r\n        }\r\n      }\r\n      if (!WrittenTo8) continue;\r\n      WrittenTo64 = true;\r\n      if (HasUniformType === 0) { //Means that it has a uniform type, and can be compressed.\r\n        Data8[Index8] = (1 << 28);    //Mark Data8 region as uniform type\r\n        Data8[Index8] |= UniformType; //Set uniform type in first 16 bits\r\n        Data8[Index8] |= (1 << 30);   //Mark it as updated to be sent to the gpu (this is usually done in AllocateData8 function)\r\n        continue;\r\n      }\r\n      //Now, since something was actually written to the temp buffer, write it to the Data1 buffer:\r\n      const Location8 = AllocateData8(Location64, x8, y8, z8); //This automatically registers the Data8\r\n      VoxelTypes.set(TempDataBuffer, Location8 << 9); //Location8 << 9 is the starting index of the voxel data 8x8x8 group.\r\n      Data1.set(TempTypeBuffer, Location8 << 6); //This is Location8 << 6, because the Z axis is compressed into the number.\r\n    }\r\n    const SetBlock = function (X, Y, Z, BlockType) {\r\n      if (BlockType === 0 || X < 0 || Y < 0 || Z < 0 || X >= 64 || Y >= 64 || Z >= 64) return;\r\n\r\n      const Index8 = (Location64 << 9) | (((X >> 3) & 7) << 6) | (((Y >> 3) & 7) << 3) | ((Z >> 3) & 7);\r\n      let Info8 = Data8[Index8];\r\n      if ((Info8 & 0x80000000) !== 0) {\r\n        Info8 = AllocateData8(Location64, (X >> 3) & 7, (Y >> 3) & 7, (Z >> 3) & 7);\r\n        for (let i = 0; i < 64; ++i) Data1[((Info8 & 0x00ffffff) << 6) | i] = 255; //Clear Data1\r\n      } else if ((Info8 & 0x10000000) !== 0) { //Uniform type, have to decompress\r\n        const UniformType = Info8 & 0x0000ffff;\r\n        Info8 = AllocateData8(Location64, (X >> 3) & 7, (Y >> 3) & 7, (Z >> 3) & 7);\r\n        const Location8 = Info8 & 0x00ffffff;\r\n        for (let i = 0; i < 512; ++i) VoxelTypes[(Location8 << 9) | i] = UniformType;\r\n        for (let i = 0; i < 64; ++i) Data1[(Location8 << 6) | i] = 0;\r\n      }\r\n      const Location8 = Info8 & 0x00ffffff;\r\n      Data8[Index8] |= 0x40000000; //Looks like this has to be done every time. (GPU update)\r\n      const Index = (Location8 << 6) | ((X & 7) << 3) | (Y & 7);\r\n      Data1[Index] &= ~(1 << (Z & 7)); //Sets it to 0, which means subdivide (full)\r\n      VoxelTypes[(Index << 3) | (Z & 7)] = BlockType;\r\n    };\r\n\r\n    if (Depth < 4) {\r\n      const Width = 8 / Factor;\r\n      const SDPM6 = ScaledDistancedPointMap[Depth][6][((RegionX & (Width - 1)) * Width) | (RegionZ & (Width - 1))];\r\n      for (const Point of SDPM6) {\r\n        const RNG = RandomValue(Point.X + RegionX * Factor * 64, 0, Point.Z + RegionZ * Factor * 64);\r\n        const Random2 = RandomValue(Point.X + RegionX * Factor * 64, 3, Point.Z + RegionZ * Factor * 64);\r\n        const OriginalX = Point.X;\r\n        const OriginalZ = Point.Z;\r\n        const X = Math.round(OriginalX / Factor - .5);\r\n        const Z = Math.round(OriginalZ / Factor - .5);\r\n        const Temperature = TemperatureMap[(X << 6) | Z];\r\n        const Slope = Data.SlopeMap[(X << 6) | Z];\r\n\r\n        if(RNG > Temperature / 2.) continue;\r\n        if(Depth === 3 && RNG > Temperature / 3.) continue;\r\n\r\n        const PasteHeight = Math.floor(HeightMap[(X << 6) | Z]) / Factor;\r\n        if (PasteHeight < 0) continue;\r\n        if (!((RegionY + 1) * 64 > PasteHeight && PasteHeight > RegionY * 64 - 32)) continue;\r\n        if(Random2 < HeightMap[(X << 6) | Z] / 1000. || Random2 * 2 < Slope) continue;\r\n\r\n        WrittenTo64 = true;\r\n        const TreeRNG = RandomValue(Point.X + RegionX * Factor * 64, 1, Point.X + RegionZ * Factor * 64);\r\n        //Notice how for ^^ the Y value is 1, this is so that a different random value is generated.\r\n        const Tree = Math.floor(TreeRNG * Structures.length);\r\n        Structures[Tree].Selection.DirectPaste(X, PasteHeight - RegionY * 64, Z, Factor, MainBlockRegistry, SetBlock);\r\n      }\r\n    } else {\r\n      for (let X = 0; X < 64; ++X) for (let Z = 0; Z < 64; ++Z) {\r\n        const Temperature = TemperatureMap[(X << 6) | Z];\r\n        const Slope = Data.SlopeMap[(X << 6) | Z];\r\n        if(RandomValue(X, 1, Z) > Temperature / 1.5) continue;\r\n        if(RandomValue(X, 2, Z) < HeightMap[(X << 6) | Z] / 1000. || RandomValue(X, 3, Z) * 2 < Slope) continue;\r\n\r\n        const PasteHeight = Math.floor(HeightMap[(X << 6) | Z] / Factor) - RegionY * 64;\r\n        if (PasteHeight >= 0 && PasteHeight < 64) {\r\n          WrittenTo64 = true;\r\n          SetBlock(X, PasteHeight, Z, LeavesID);\r\n          if(Depth < 6 && PasteHeight < 63 && RandomValue(X, 4, Z) > Temperature / 0.9) SetBlock(X, PasteHeight + 1, Z, LeavesID);\r\n        }\r\n\r\n\r\n      }\r\n    }\r\n\r\n    if (((Data64[Index64] >> 31) & 1) === 1) console.log(Data64[Index64]);\r\n\r\n    if (!WrittenTo64) {\r\n      DeallocateData64(Location64, rx64, ry64, rz64, Depth);\r\n    } else{\r\n      Data64[Index64] &=~(1 << 31); //Mark the Data64 as not empty (this is required because of AllocateData64 not setting the existence marker!)\r\n    }\r\n\r\n    Data64[Index64] = (Data64[Index64] & ~(7 << 19)) | (7 << 19); //Set state to 7 (finished loading)\r\n    Data64[Index64] |= (1 << 30);\r\n  } catch(Error){\r\n    if(Error instanceof NoData8Exception){\r\n      Data64[Index64] &= ~(7 << 19); //Set state to 0\r\n      for(let i = 0; i < 512; ++i){\r\n        const Index8 = (Location64 << 9) | i;\r\n        DeallocateData8(Index8);\r\n      }\r\n      DeallocateData64(Location64, rx64, ry64, rz64, 0);\r\n      return self.postMessage({\r\n        \"Request\": \"NoData8\"\r\n      });\r\n    } else throw Error;\r\n  }\r\n\r\n  if(OwnQueueSize) Atomics.sub(OwnQueueSize, 0, 1);\r\n\r\n\r\n  self.postMessage({\r\n    \"Request\": \"GeneratedRegionData\",\r\n    \"RegionX\": Data.RegionX,\r\n    \"RegionY\": Data.RegionY,\r\n    \"RegionZ\": Data.RegionZ,\r\n    \"Depth\": Data.Depth,\r\n    \"LoadingBatch\": Data.LoadingBatch\r\n  });\r\n};\r\n\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/WorkerRegionGenerator.mjs?");

/***/ }),

/***/ "./VoxelEngine/World/LoadManager/DataManager.mjs":
/*!*******************************************************!*\
  !*** ./VoxelEngine/World/LoadManager/DataManager.mjs ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"DeallocateData64Init\": () => (/* binding */ DeallocateData64Init),\n/* harmony export */   \"DeallocateData8Init\": () => (/* binding */ DeallocateData8Init)\n/* harmony export */ });\nfunction DeallocateData8Init(Data8, AllocationIndex, AllocationArray){\r\n  return function(Location64, x8, y8, z8){\r\n    const Location = Data8[(Location64 << 9) | (x8 << 6) | (y8 << 3) | z8];\r\n    if((Location & (1 << 31)) !== 0) return;\r\n    if((Location & (1 << 28)) === 0) { //Is not of uniform type\r\n      const DeallocIndex = Atomics.add(AllocationIndex, 1, 1) & (AllocationArray.length - 1);\r\n      Atomics.store(AllocationArray, DeallocIndex, Location);\r\n    }\r\n    Data8[(Location64 << 9) | (x8 << 6) | (y8 << 3) | z8] = 0x80000000;\r\n  };\r\n};\r\n\r\nfunction DeallocateData64Init(Data64, AllocationIndex64, AllocationArray64){\r\n  return function(Location64, x64, y64, z64, Depth){\r\n    if(((Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] >> 31) & 1) === 1) return;\r\n    const DeallocIndex = Atomics.add(AllocationIndex64, 1, 1) & 4095; //Indexing 1 for deallocation.\r\n    Atomics.store(AllocationArray64, DeallocIndex, Location64); //Add location back to the allocation array to be reused.\r\n    Data64[(Depth << 9) | (x64 << 6) | (y64 << 3) | z64] = 1 << 31;\r\n  };\r\n};\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/World/LoadManager/DataManager.mjs?");

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
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["VoxelEngine_Block_BlockRegistry_mjs-VoxelEngine_Libraries_SVM_SVM_mjs-VoxelEngine_Libraries_S-2a9e21","VoxelEngine_Libraries_SVM_SVMUtils_mjs","VoxelEngine_GetHeight_mjs-VoxelEngine_World_Region_mjs"], () => (__webpack_require__("./VoxelEngine/WorkerRegionGenerator.mjs")))
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
/******/ 			"VoxelEngine_WorkerRegionGenerator_mjs": 1
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
/******/ 			return Promise.all(["VoxelEngine_Block_BlockRegistry_mjs-VoxelEngine_Libraries_SVM_SVM_mjs-VoxelEngine_Libraries_S-2a9e21","VoxelEngine_Libraries_SVM_SVMUtils_mjs","VoxelEngine_GetHeight_mjs-VoxelEngine_World_Region_mjs"].map(__webpack_require__.e, __webpack_require__)).then(next);
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