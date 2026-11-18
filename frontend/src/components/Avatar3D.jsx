import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, ShieldAlert, Cpu, HeartPulse, Zap } from 'lucide-react';

export default function Avatar3D({ liveTelemetry, selectedOrgan, setSelectedOrgan }) {
  const mountRef = useRef(null);
  const organNodesRef = useRef({});

  // Default telemetry organ heatmaps
  const organData = liveTelemetry?.organ_heatmaps || {
    pancreas: 25,
    liver: 35,
    heart: 40,
    muscle: 50,
    brain: 85
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3B82F6, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Group for Human Avatar
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // 1. Outer Holographic Human Body Silhouette (Torso + Head + Limbs)
    const bodyMat = new THREE.MeshBasicMaterial({
      color: 0x1E293B,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
    headGeo.translate(0, 2.4, 0);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    avatarGroup.add(headMesh);

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.85, 0.65, 2.2, 16);
    torsoGeo.translate(0, 0.7, 0);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMat);
    avatarGroup.add(torsoMesh);

    // Spine Line
    const spineMat = new THREE.LineDashedMaterial({ color: 0x3B82F6, dashSize: 0.1, gapSize: 0.05 });
    const spinePoints = [new THREE.Vector3(0, 2.0, 0), new THREE.Vector3(0, -1.5, 0)];
    const spineGeo = new THREE.BufferGeometry().setFromPoints(spinePoints);
    const spineLine = new THREE.Line(spineGeo, spineMat);
    avatarGroup.add(spineLine);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.3, 0.2, 1.8, 12);
    const leftLeg = new THREE.Mesh(legGeo, bodyMat);
    leftLeg.position.set(-0.45, -1.3, 0);
    avatarGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bodyMat);
    rightLeg.position.set(0.45, -1.3, 0);
    avatarGroup.add(rightLeg);

    // 2. Interactive Organ Nodes with Dynamic Glow
    const organs = [
      { id: 'brain', name: 'Brain (Neural Network)', pos: [0, 2.4, 0], size: 0.28 },
      { id: 'heart', name: 'Heart & Vascular System', pos: [-0.2, 1.2, 0.1], size: 0.24 },
      { id: 'liver', name: 'Liver (Glycogen Reserve)', pos: [0.3, 0.7, 0.1], size: 0.22 },
      { id: 'pancreas', name: 'Pancreas & Gut Microbiome', pos: [-0.1, 0.3, 0.15], size: 0.22 },
      { id: 'muscle', name: 'Skeletal Muscle Transporters', pos: [0.45, -1.1, 0.1], size: 0.20 }
    ];

    const getOrganColor = (stress) => {
      if (stress > 70) return 0xF43F5E; // Red/Rose High Stress
      if (stress > 45) return 0xF59E0B; // Amber Moderate
      return 0x10B981; // Emerald Optimal
    };

    organs.forEach(o => {
      const stressVal = organData[o.id] || 30;
      const colorHex = getOrganColor(stressVal);

      // Core Organ Sphere
      const organGeo = new THREE.SphereGeometry(o.size, 16, 16);
      const organMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const organMesh = new THREE.Mesh(organGeo, organMat);
      organMesh.position.set(...o.pos);
      organMesh.userData = { id: o.id, name: o.name };
      avatarGroup.add(organMesh);

      // Halo Ring around organ
      const ringGeo = new THREE.RingGeometry(o.size * 1.3, o.size * 1.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(...o.pos);
      avatarGroup.add(ringMesh);

      organNodesRef.current[o.id] = { mesh: organMesh, ring: ringMesh };
    });

    // Raycasting for Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(avatarGroup.children);

      for (let hit of intersects) {
        if (hit.object.userData && hit.object.userData.id) {
          setSelectedOrgan(hit.object.userData.id);
          break;
        }
      }
    };

    currentMount.addEventListener('pointerdown', handlePointerDown);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle continuous 3D avatar rotation
      avatarGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.3;

      // Pulse organ rings
      Object.values(organNodesRef.current).forEach(({ ring, mesh }, idx) => {
        if (ring) {
          ring.rotation.z = elapsed * (idx % 2 === 0 ? 0.8 : -0.8);
          const s = 1 + Math.sin(elapsed * 2 + idx) * 0.08;
          ring.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [organData, setSelectedOrgan]);

  const organNames = {
    pancreas: "Pancreas & Beta-Cell System",
    liver: "Hepatic Glycogen Engine",
    heart: "Cardiovascular & Vascular System",
    muscle: "Skeletal Muscle Transporters",
    brain: "Central Nervous System & Cognitive State"
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full relative overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-lg font-bold text-white font-heading tracking-wide">3D Biological Digital Twin Avatar</h2>
          </div>
          <p className="text-xs text-slate-400">Interactive WebGL Organ Heatmap & Real-Time Node Status</p>
        </div>
        <div className="bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs text-cyan-300 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bi-directional Sync</span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-80 my-2 cursor-grab active:cursor-grabbing relative">
        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <div className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Metabolic Stress Index</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Optimal (0-45%)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate Strain (45-70%)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High Stress (&gt;70%)</div>
        </div>
      </div>

      {/* Selected Organ Detail Card */}
      <div className="mt-auto bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Node Selected</div>
            <div className="text-sm font-bold text-white font-heading">{organNames[selectedOrgan] || "Select an Organ Node"}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Metabolic Stress</div>
          <div className={`text-base font-extrabold ${organData[selectedOrgan] > 70 ? 'text-rose-400' : organData[selectedOrgan] > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {organData[selectedOrgan] || 30}%
          </div>
        </div>
      </div>
    </div>
  );
}
