"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkElectronProject"] = self["webpackChunkElectronProject"] || []).push([["VoxelEngine_Mods_Inspector_DefaultMeasurements_mjs"],{

/***/ "./VoxelEngine/BackgroundTasks/SharedDebugData.mjs":
/*!*********************************************************!*\
  !*** ./VoxelEngine/BackgroundTasks/SharedDebugData.mjs ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"FREE_GPU_SEGMENTS\": () => (/* binding */ FREE_GPU_SEGMENTS),\n/* harmony export */   \"MAX_GPU_SEGMENTS\": () => (/* binding */ MAX_GPU_SEGMENTS)\n/* harmony export */ });\nconst FREE_GPU_SEGMENTS = 0;\r\nconst MAX_GPU_SEGMENTS = 1;\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/BackgroundTasks/SharedDebugData.mjs?");

/***/ }),

/***/ "./VoxelEngine/Mods/Inspector/DefaultMeasurements.mjs":
/*!************************************************************!*\
  !*** ./VoxelEngine/Mods/Inspector/DefaultMeasurements.mjs ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _Libraries_DeferredPromise_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Libraries/DeferredPromise.mjs */ \"./VoxelEngine/Libraries/DeferredPromise.mjs\");\n/* harmony import */ var _BackgroundTasks_SharedDebugData_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../BackgroundTasks/SharedDebugData.mjs */ \"./VoxelEngine/BackgroundTasks/SharedDebugData.mjs\");\n\r\n\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([\r\n  {\r\n    \"Name\": \"FPS\",\r\n    \"Colour\": \"#663399\",\r\n    \"HistoryLength\": 5000.,\r\n    \"Unit\": \" fps\",\r\n    \"Generator\": function(){\r\n      let Sum = 0.;\r\n      let Count = 0.;\r\n      let Yielded = false;\r\n      void function Update(){\r\n        Application.Main.Renderer.RequestAnimationFrame(Update);\r\n        if(Yielded){\r\n          Yielded = false;\r\n          Count = 0.;\r\n          Sum = 0.;\r\n        }\r\n        Count++;\r\n        Sum += Application.Main.Renderer.RenderTime;\r\n      }();\r\n      return async function*(){\r\n        while(true){\r\n          yield 1000. * Count / Sum;\r\n          Yielded = true;\r\n        }\r\n      }();\r\n    }()\r\n  },\r\n  {\r\n    \"Name\": \"Lowest FPS\",\r\n    \"Colour\": \"#0fcf3f\",\r\n    \"HistoryLength\": 15000.,\r\n    \"Unit\": \" fps\",\r\n    \"Generator\": function(){\r\n      let Slowest = -Infinity;\r\n      let Yielded = false;\r\n      void function Update(){\r\n        Application.Main.Renderer.RequestAnimationFrame(Update);\r\n        if(Yielded){\r\n          Yielded = false;\r\n          Slowest = -Infinity;\r\n        }\r\n        Slowest = Math.max(Slowest, Application.Main.Renderer.RenderTime);\r\n      }();\r\n      return async function*(){\r\n        while(true){\r\n          await new _Libraries_DeferredPromise_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\"Timeout\": 100., \"Throw\": false});\r\n          yield 1000. / Slowest;\r\n          Yielded = true;\r\n        }\r\n      }();\r\n    }()\r\n  },\r\n  {\r\n    \"Name\": \"Data8 utilization\",\r\n    \"Colour\": \"#00afff\",\r\n    \"HistoryLength\": 30000.,\r\n    \"Unit\": \"%\",\r\n    \"Generator\": async function*(){\r\n      const AllocationIndex = Application.Main.World.AllocationIndex;\r\n      const Size8 = Application.Main.World.AllocationArray.length;\r\n      while(true){\r\n        await new _Libraries_DeferredPromise_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\"Timeout\": 100., \"Throw\": false});\r\n        yield ((AllocationIndex[0] - AllocationIndex[1]) & (Size8 - 1)) / Size8 * 100.;\r\n      }\r\n    }()\r\n  },\r\n  {\r\n    \"Name\": \"Data64 utilization\",\r\n    \"Colour\": \"#0d4fd4\",\r\n    \"HistoryLength\": 30000.,\r\n    \"Unit\": \"%\",\r\n    \"Generator\": async function*(){\r\n      const AllocationIndex = Application.Main.World.AllocationIndex64;\r\n      while(true){\r\n        await new _Libraries_DeferredPromise_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\"Timeout\": 100., \"Throw\": false});\r\n        yield ((AllocationIndex[0] - AllocationIndex[1]) & (4096 - 1)) / 4096 * 100.;\r\n      }\r\n    }()\r\n  },\r\n  {\r\n    \"Name\": \"Free GPU segments\",\r\n    \"Colour\": \"#9ae019\",\r\n    \"HistoryLength\": 30000.,\r\n    \"Unit\": \" segments\",\r\n    \"Generator\": async function*(){\r\n      while(true){\r\n        await new _Libraries_DeferredPromise_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\"Timeout\": 100., \"Throw\": false});\r\n        yield Application.Main.SharedDebugData[_BackgroundTasks_SharedDebugData_mjs__WEBPACK_IMPORTED_MODULE_1__.FREE_GPU_SEGMENTS];\r\n      }\r\n    }()\r\n  }\r\n]);\n\n//# sourceURL=webpack://ElectronProject/./VoxelEngine/Mods/Inspector/DefaultMeasurements.mjs?");

/***/ })

}]);