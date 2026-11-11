import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Grimoire3DCanvasProps {
  coverColor?: string;
  isOpening?: boolean;
}

export function Grimoire3DCanvas({ coverColor = "#70272f", isOpening = false }: Grimoire3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Warm ambient and candle point lights
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.85);
    scene.add(ambientLight);

    const candleLight = new THREE.PointLight(0xffb84d, 2.5, 8);
    candleLight.position.set(1.5, 2.0, 1.5);
    scene.add(candleLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.2);
    rimLight.position.set(-2, 3, -1);
    scene.add(rimLight);

    // Book spine and pages mesh
    const bookGroup = new THREE.Group();

    // Cover material with gilded sheen
    const coverMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(coverColor),
      roughness: 0.45,
      metalness: 0.25,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdfb76c,
      roughness: 0.2,
      metalness: 0.85,
    });

    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xf5ebd0,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Left Leaf
    const leafGeo = new THREE.BoxGeometry(1.2, 0.06, 1.6);
    const leftCover = new THREE.Mesh(leafGeo, coverMat);
    leftCover.position.set(-0.62, 0, 0);
    bookGroup.add(leftCover);

    // Right Leaf
    const rightCover = new THREE.Mesh(leafGeo, coverMat);
    rightCover.position.set(0.62, 0, 0);
    bookGroup.add(rightCover);

    // Inner Parchment blocks
    const pageBlockGeo = new THREE.BoxGeometry(1.15, 0.08, 1.54);
    const leftPages = new THREE.Mesh(pageBlockGeo, pagesMat);
    leftPages.position.set(-0.6, 0.04, 0);
    bookGroup.add(leftPages);

    const rightPages = new THREE.Mesh(pageBlockGeo, pagesMat);
    rightPages.position.set(0.6, 0.04, 0);
    bookGroup.add(rightPages);

    // Spine
    const spineGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.62, 16, 1, false, -Math.PI / 2, Math.PI);
    const spineMesh = new THREE.Mesh(spineGeo, goldMat);
    spineMesh.rotation.z = Math.PI / 2;
    spineMesh.rotation.y = Math.PI / 2;
    bookGroup.add(spineMesh);

    // Corners
    const cornerGeo = new THREE.BoxGeometry(0.14, 0.07, 0.14);
    const corner1 = new THREE.Mesh(cornerGeo, goldMat);
    corner1.position.set(-1.18, 0.02, 0.76);
    bookGroup.add(corner1);

    const corner2 = new THREE.Mesh(cornerGeo, goldMat);
    corner2.position.set(1.18, 0.02, 0.76);
    bookGroup.add(corner2);

    bookGroup.rotation.x = 0.55;
    scene.add(bookGroup);

    // Particle magic sparkles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3;
      positions[i + 1] = Math.random() * 2;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd277,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating animation
      bookGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.06;
      bookGroup.position.y = Math.sin(elapsed * 1.5) * 0.04;

      // Sparkle drift
      const pos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 0.003;
        if (pos[i] > 2.2) pos[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [coverColor, isOpening]);

  return <div ref={mountRef} className="sc-grimoire-3d-canvas" style={{ width: "100%", height: "180px", pointerEvents: "none" }} />;
}
