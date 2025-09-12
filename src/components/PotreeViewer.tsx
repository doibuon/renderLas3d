import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Potree, PointSizeType } from "@pnext/three-loader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const PotreeViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ----- Scene setup -----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    // ----- Load pointcloud with @pnext/three-loader -----
    const potree = new Potree();
    potree
      .loadPointCloud(
        "/pointclouds/mycloud/cloud.js",
        (p) => `/pointclouds/mycloud/${p}`   // getUrl function
      )
      .then((pointcloud: any) => {
        pointcloud.material.size = 1.0;
        pointcloud.material.pointSizeType = PointSizeType.ADAPTIVE;
        scene.add(pointcloud);

        // fit camera
        const box = new THREE.Box3().setFromObject(pointcloud);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        camera.lookAt(center);
      })
      .catch((err: any) => console.error("Failed to load pointcloud:", err));

    // ----- Render loop -----
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // cleanup
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "600px" }} />;
};

export default PotreeViewer;
