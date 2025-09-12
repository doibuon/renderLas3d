import React, { useEffect, useRef, useState } from "react";
import { Viewer, Cesium3DTileset } from "resium";
import {
  Ion,
  IonResource,
  Viewer as CesiumViewer,
  Cesium3DTileset as CesiumTileset,
  Resource,
} from "cesium";
import { CesiumComponentRef } from "resium";
import "cesium/Build/Cesium/Widgets/widgets.css";

(window as any).CESIUM_BASE_URL = "/Cesium";

// Token Cesium Ion
Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjAwZWY3OC1kMmI0LTRkOTktOTNmMi1mOTE4M2EwZjM0OTciLCJpZCI6MzQwNjM3LCJpYXQiOjE3NTc2NDY4Mzl9.KTqRlwfb058R3t2Adlx5tNZTIg8SFP1i2u4VTr91CIY";

const assetId = 3710477;

const ModelViewer: React.FC = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [tilesetUrl, setTilesetUrl] = useState<Resource | undefined>();

  useEffect(() => {
    // Lấy IonResource và set vào state
    IonResource.fromAssetId(assetId).then((resource) => {
      console.log("✅ Ion resource resolved:", resource);
      setTilesetUrl(resource);
    });
  }, []);

  return (
    <Viewer full ref={viewerRef}>
      {tilesetUrl && (
        <Cesium3DTileset
          url={tilesetUrl}
          onReady={(tileset: CesiumTileset) => {
            const viewer = viewerRef.current?.cesiumElement;
            if (viewer) {
              viewer.zoomTo(tileset).then(() => {
                console.log("✅ Zoomed to tileset");
              });
            }
          }}
        />
      )}
    </Viewer>
  );
};

export default ModelViewer;

