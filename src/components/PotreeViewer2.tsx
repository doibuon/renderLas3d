import React, { useEffect, useRef } from "react";

const PotreeViewer2: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(`❌ Không load được script: ${src}`);
        document.body.appendChild(script);
      });
    };

    const loadCss = (href: string) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    };

    (async () => {
      try {
        const base = "/vendor/potree";

        await loadScript("https://code.jquery.com/jquery-3.5.1.min.js");
        await loadScript(`${base}/libs/proj4/proj4.js`);
        await loadScript(`${base}/libs/other/BinaryHeap.js`);
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js");
        await loadScript(`${base}/libs/plasio/js/laslaz.js`);

        await loadScript(`${base}/potree.js`);
        loadCss(`${base}/potree.css`);

        const Potree = (window as any).Potree;
        if (!Potree) {
          console.error("❌ Potree chưa có trên window");
          return;
        }

        Potree.scriptPath = base;

        console.log("✅ Potree loaded", Potree);

        const viewer = new Potree.Viewer(viewerRef.current);
        viewer.setEDLEnabled(true);
        viewer.setFOV(60);
        viewer.setPointBudget(1_000_000);

        const cloudUrl = `${base}/pointclouds/mycloud/metadata.json`;

        Potree.loadPointCloud(cloudUrl, "MyPointCloud", (e: any) => {
          const pointcloud = e.pointcloud;
          viewer.scene.addPointCloud(pointcloud);

          const material = pointcloud.material;
          material.size = 1;
          material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
          viewer.fitToScreen();
        });
      } catch (err) {
        console.error("🔥 Lỗi khi load Potree:", err);
      }
    })();
  }, []);

  return <div ref={viewerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default PotreeViewer2;
