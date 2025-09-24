import React, { useEffect, useRef, useState } from "react";
import { Viewer, Cesium3DTileset } from "resium";
import {
  // Ion,
  // IonResource,
  Viewer as CesiumViewer,
  Cesium3DTileset as CesiumTileset,
  Color,
  Cartesian3,
  HeadingPitchRange,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartographic,
  Cesium3DTileStyle,
  Entity
} from "cesium";
import { CesiumComponentRef } from "resium";
import "cesium/Build/Cesium/Widgets/widgets.css";

(window as any).CESIUM_BASE_URL = "/Cesium";

// Token Cesium Ion
// Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjAwZWY3OC1kMmI0LTRkOTktOTNmMi1mOTE4M2EwZjM0OTciLCJpZCI6MzQwNjM3LCJpYXQiOjE3NTc2NDY4Mzl9.KTqRlwfb058R3t2Adlx5tNZTIg8SFP1i2u4VTr91CIY";
// const ASSET_ID = 3710477;

const LOCAL_TILESET_URL = "/tilesets/terra_pnts_2/tileset.json";

const ModelViewer: React.FC = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer> | null>(null);
  const [markers, setMarkers] = useState<Entity[]>([]);
  // const [tilesetResource, setTilesetResource] = useState<any | null>(null);

  // useEffect(() => {
  //   let mounted = true;
  //   IonResource.fromAssetId(ASSET_ID)
  //     .then((r) => mounted && setTilesetResource(r))
  //     .catch((err) => console.error("Failed to resolve IonResource:", err));
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  const handleTilesetReady = (tileset: CesiumTileset) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    (tileset as any).pointCloudShading.pointSize = 4.0; // mặc định thường 1.0

    (tileset as any).style = new Cesium3DTileStyle({
      pointSize: 4.0
    });

    viewer.scene.globe.show = false;
    viewer.scene.imageryLayers.removeAll();
    if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
    if (viewer.scene.sun) viewer.scene.sun.show = false;
    viewer.scene.backgroundColor = Color.BLACK;

    const bs = (tileset as any).boundingSphere;
    if (bs) {
      viewer.camera.flyToBoundingSphere(bs, {
        duration: 1.5,
        offset: new HeadingPitchRange(
          CesiumMath.toRadians(0),
          CesiumMath.toRadians(-20),
          bs.radius * 3
        ),
      });
    }

    // const markers: any[] = [];

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: { position: any }) => {
      const cartesian: Cartesian3 | undefined =
        viewer.scene.pickPosition(movement.position);
      if (!cartesian) {
        console.warn("Không pick được point cloud");
        return;
      }

      const cartographic = Cartographic.fromCartesian(cartesian);
      const lon = CesiumMath.toDegrees(cartographic.longitude);
      const lat = CesiumMath.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      console.log("Clicked position:");
      console.log(" - Cartesian (ECEF):", cartesian);
      console.log(" - Cartographic (WGS84):", { lat, lon, height });

      const newMarker = viewer.entities.add({
        position: cartesian,
        point: {
          pixelSize: 12,
          color: Color.YELLOW,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
        },
        label: {
          text: `${lat.toFixed(6)}, ${lon.toFixed(6)}\n${height.toFixed(2)}m`,
          font: "14px sans-serif",
          fillColor: Color.WHITE,
          style: 2,
          verticalOrigin: 1,
          pixelOffset: new Cartesian3(0, -20, 0),
        },
      });

      setMarkers((prev) => [...prev, newMarker]);
    }, ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement: { position: any }) => {
      const picked = viewer.scene.pick(movement.position);
      if (picked && picked.id) {
        viewer.entities.remove(picked.id);
        setMarkers((prev) => prev.filter((m) => m !== picked.id));
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  };

  const clearAllMarkers = () => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    markers.forEach((m) => viewer.entities.remove(m));
    setMarkers([]);
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {markers.length && <button
        onClick={clearAllMarkers}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: "rgba(200,0,0,0.8)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Xóa tất cả marker
      </button>}

      <Viewer
        full
        ref={viewerRef}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        homeButton={false}
      >
        <Cesium3DTileset
          url={LOCAL_TILESET_URL}
          onReady={(tileset: any) => handleTilesetReady(tileset)}
          maximumScreenSpaceError={16}
        />
        {/* {tilesetResource && (
          <Cesium3DTileset
            url={tilesetResource}
            onReady={(tileset: any) => handleTilesetReady(tileset)}
            maximumScreenSpaceError={16}
          />
        )} */}
      </Viewer>
    </div>
  );
};

export default ModelViewer;