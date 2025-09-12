const fs = require("fs-extra");
const path = require("path");

const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumDest = "public/Cesium";

fs.copySync(cesiumSource, cesiumDest);
console.log("Cesium static assets copied to /public/Cesium");