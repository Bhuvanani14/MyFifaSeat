import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Seat } from "../types";
import { Sparkles, Move, ZoomIn, Eye, RotateCcw } from "lucide-react";

interface SeatPanoramicPreviewProps {
  seat: Seat | null;
}

export default function SeatPanoramicPreview({ seat }: SeatPanoramicPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interaction states for user to see on UI
  const [isDragging, setIsDragging] = useState(false);
  const [pitch, setPitch] = useState(-0.1); // Vertical angle
  const [yaw, setYaw] = useState(Math.PI); // Horizontal angle
  
  // Keep track of parameters in refs for the animation loop
  const pitchRef = useRef(pitch);
  const yawRef = useRef(yaw);
  
  useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);

  useEffect(() => {
    yawRef.current = yaw;
  }, [yaw]);

  // Handle selected seat updates by repositioning camera smoothly
  useEffect(() => {
    if (!seat) return;
    
    // Set starting angles based on seat section to face the pitch center
    const section = seat.section;
    let startYaw = Math.PI; // Default looking down Y/Z axis
    
    if (section === "101") startYaw = Math.PI; // Bottom (looks North)
    else if (section === "112") startYaw = 0; // Top (looks South)
    else if (section === "108") startYaw = Math.PI / 2; // Right (looks West)
    else if (section === "110-A") startYaw = -Math.PI / 2; // Left (looks East)
    else if (section === "215") startYaw = Math.PI / 4; // Top-Right (looks South-West)
    else if (section === "204") startYaw = (3 * Math.PI) / 4; // Bottom-Right (looks North-West)
    else if (section === "318") startYaw = -Math.PI / 4; // Top-Left (looks South-East)
    else if (section === "302") startYaw = -(3 * Math.PI) / 4; // Bottom-Left (looks North-East)
    
    setYaw(startYaw);
    setPitch(-0.15); // Look slightly down at the pitch
  }, [seat]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !seat) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 280;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814); // Sleek stadium twilight background
    scene.fog = new THREE.FogExp2(0x060814, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    
    // Position camera based on seat location
    const getSeatCoordinates = (s: Seat) => {
      let x = 0;
      let y = 5; // Height/Elevation
      let z = 30; // Depth
      
      const sec = s.section;
      const rowVal = s.row.charCodeAt(0) - 65; // A = 0, B = 1 etc
      const rowElevation = rowVal * 0.4;
      const rowDepth = rowVal * 0.3;

      // Base coordinates by Section
      switch (sec) {
        case "101": // VIP center bottom
          x = 0; y = 4.5 + rowElevation; z = 24 + rowDepth;
          break;
        case "112": // Cat 1 center top
          x = 0; y = 6.0 + rowElevation; z = -24 - rowDepth;
          break;
        case "108": // Cat 1 right
          x = 34 + rowDepth; y = 5.0 + rowElevation; z = 0;
          break;
        case "110-A": // Accessible left
          x = -32 - rowDepth; y = 3.5 + rowElevation; z = 0;
          break;
        case "215": // Cat 2 top right corner
          x = 26 + rowDepth; y = 10.0 + rowElevation; z = -26 - rowDepth;
          break;
        case "204": // Cat 2 bottom right corner
          x = 26 + rowDepth; y = 10.0 + rowElevation; z = 26 + rowDepth;
          break;
        case "318": // Cat 3 top left corner
          x = -28 - rowDepth; y = 16.0 + rowElevation; z = -28 - rowDepth;
          break;
        case "302": // Cat 3 bottom left corner
          x = -28 - rowDepth; y = 16.0 + rowElevation; z = 28 + rowDepth;
          break;
        default:
          x = 0; y = 10; z = 35;
      }

      // Add a slight variance based on seat number to make it unique
      x += (s.number - 10) * 0.15;
      
      return new THREE.Vector3(x, y, z);
    };

    const seatPos = getSeatCoordinates(seat);
    camera.position.copy(seatPos);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Dynamic multicolored stadium spot lights pointing to the field
    const createSpotLight = (x: number, y: number, z: number, color: number) => {
      const spot = new THREE.DirectionalLight(color, 0.7);
      spot.position.set(x, y, z);
      spot.target.position.set(0, 0, 0);
      scene.add(spot);
      scene.add(spot.target);
    };
    createSpotLight(-30, 25, -30, 0x4f46e5); // Blue-indigo floodlight
    createSpotLight(30, 25, 30, 0x10b981);  // Emerald floodlight
    createSpotLight(30, 25, -30, 0xffffff); // White bright floodlight
    createSpotLight(-30, 25, 30, 0xa855f7); // Purple floodlight

    // 5. Build Stadium Elements
    
    // Field (Grass Plane)
    const fieldWidth = 48;
    const fieldLength = 34;
    const fieldGeo = new THREE.PlaneGeometry(fieldWidth, fieldLength);
    const fieldMat = new THREE.MeshBasicMaterial({ 
      color: 0x14532d, // Dark green grass grass
      side: THREE.DoubleSide
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    scene.add(field);

    // Pitch Striping (Simulated lawn cuts via stripes)
    for (let i = -6; i <= 6; i++) {
      if (i % 2 === 0) {
        const stripeGeo = new THREE.PlaneGeometry(fieldWidth / 13, fieldLength);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0x166534, side: THREE.DoubleSide });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set((i * fieldWidth) / 13, 0.005, 0);
        scene.add(stripe);
      }
    }

    // Outer pitch border line
    const borderGeo = new THREE.PlaneGeometry(fieldWidth - 1, fieldLength - 1);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.01;
    scene.add(border);

    // Center line and circle
    const centerLineGeo = new THREE.PlaneGeometry(0.08, fieldLength - 1);
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerLine = new THREE.Mesh(centerLineGeo, whiteMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.012, 0);
    scene.add(centerLine);

    const centerCircleGeo = new THREE.RingGeometry(4, 4.08, 32);
    const centerCircle = new THREE.Mesh(centerCircleGeo, whiteMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.012, 0);
    scene.add(centerCircle);

    // Penalty Boxes (Left & Right)
    const createPenaltyBox = (isLeft: boolean) => {
      const boxWidth = 7;
      const boxLength = 14;
      const pBoxGeo = new THREE.PlaneGeometry(boxWidth, boxLength);
      const pBoxLine = new THREE.Mesh(pBoxGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
      pBoxLine.rotation.x = -Math.PI / 2;
      pBoxLine.position.set(isLeft ? -fieldWidth/2 + boxWidth/2 + 0.5 : fieldWidth/2 - boxWidth/2 - 0.5, 0.015, 0);
      scene.add(pBoxLine);
    };
    createPenaltyBox(true);
    createPenaltyBox(false);

    // Goals structures
    const createGoal = (isLeft: boolean) => {
      const goalGroup = new THREE.Group();
      const goalW = 0.15;
      const goalH = 2.4;
      const goalD = 4.8;
      
      const postGeo = new THREE.BoxGeometry(goalW, goalH, goalW);
      const crossbarGeo = new THREE.BoxGeometry(goalW, goalW, goalD);
      const netGeo = new THREE.BoxGeometry(2, goalH, goalD);
      const netMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.35 });

      const leftPost = new THREE.Mesh(postGeo, whiteMat);
      leftPost.position.set(0, goalH / 2, -goalD / 2);
      
      const rightPost = new THREE.Mesh(postGeo, whiteMat);
      rightPost.position.set(0, goalH / 2, goalD / 2);

      const crossbar = new THREE.Mesh(crossbarGeo, whiteMat);
      crossbar.position.set(0, goalH, 0);

      const net = new THREE.Mesh(netGeo, netMat);
      net.position.set(isLeft ? -1 : 1, goalH/2, 0);

      goalGroup.add(leftPost);
      goalGroup.add(rightPost);
      goalGroup.add(crossbar);
      goalGroup.add(net);

      goalGroup.position.set(isLeft ? -fieldWidth / 2 + 0.5 : fieldWidth / 2 - 0.5, 0, 0);
      scene.add(goalGroup);
    };
    createGoal(true);
    createGoal(false);

    // 6. Seating Tiers (Concentric Ring walls)
    const addSeatTier = (innerRadius: number, outerRadius: number, heightStart: number, heightEnd: number, color: number) => {
      const tierGeo = new THREE.CylinderGeometry(outerRadius, innerRadius, heightEnd - heightStart, 32, 2, true);
      const tierMat = new THREE.MeshStandardMaterial({ 
        color: color, 
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      });
      const tier = new THREE.Mesh(tierGeo, tierMat);
      tier.position.y = (heightStart + heightEnd) / 2;
      scene.add(tier);

      // Create stair gaps/segments inside the stands
      const wireGeo = new THREE.CylinderGeometry(outerRadius + 0.05, innerRadius + 0.05, heightEnd - heightStart, 16, 2, true);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true, transparent: true, opacity: 0.15 });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.copy(tier.position);
      scene.add(wire);
    };

    // Lower tier (VIP & Cat 1) - Closer, shallow
    addSeatTier(26, 32, 0, 4, 0x1e3a8a); // Blue Cat 1 ring
    addSeatTier(24, 26, 0, 2, 0xeab308); // Gold VIP row

    // Middle tier (Cat 2) - Higher, steeper
    addSeatTier(32, 40, 4, 12, 0x10b981); // Emerald Cat 2 ring

    // Upper tier (Cat 3) - Maximum height, far away
    addSeatTier(40, 52, 12, 24, 0x8b5cf6); // Purple Cat 3 ring

    // Giant central Jumbotron / Media Banner above the center of the pitch
    const boardGroup = new THREE.Group();
    const boardGeo = new THREE.BoxGeometry(10, 4, 10);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    boardGroup.add(board);

    // Bright screen face displays
    const screenGeo = new THREE.PlaneGeometry(9.6, 3.6);
    const screenMat = new THREE.MeshBasicMaterial({ 
      color: 0x2563eb,
      side: THREE.DoubleSide
    });
    const screenNorth = new THREE.Mesh(screenGeo, screenMat);
    screenNorth.position.set(0, 0, 5.01);
    boardGroup.add(screenNorth);

    const screenSouth = screenNorth.clone();
    screenSouth.position.set(0, 0, -5.01);
    screenSouth.rotation.y = Math.PI;
    boardGroup.add(screenSouth);

    boardGroup.position.set(0, 22, 0);
    scene.add(boardGroup);

    // Indicator of user's own seat position (stunning glowing beacon)
    const beaconGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.copy(seatPos);
    // Move slightly forward from the camera's precise eyes
    beacon.position.y -= 0.5;
    scene.add(beacon);

    // Ring below beacon
    const ringGeo = new THREE.RingGeometry(0.8, 0.9, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide });
    const seatRing = new THREE.Mesh(ringGeo, ringMat);
    seatRing.rotation.x = Math.PI / 2;
    seatRing.position.copy(seatPos);
    seatRing.position.y -= 1.4;
    scene.add(seatRing);

    // 7. Render Animation Loop with Interactive Yaw & Pitch
    let animationFrameId: number;

    const animate = () => {
      // Calculate look-at target based on interactive pitch & yaw angles
      const target = new THREE.Vector3();
      target.x = camera.position.x + Math.sin(yawRef.current) * Math.cos(pitchRef.current);
      target.y = camera.position.y + Math.sin(pitchRef.current);
      target.z = camera.position.z + Math.cos(yawRef.current) * Math.cos(pitchRef.current);
      
      camera.lookAt(target);

      // Rotate Jumbotron slightly to add life
      boardGroup.rotation.y += 0.0015;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 8. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      // Traverse and dispose all Three.js resources to prevent GPU memory leaks
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else if (mesh.material) {
            (mesh.material as THREE.Material).dispose();
          }
        }
      });
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    };

  }, [seat]);

  // Mouse Drag / Touch Swipe Mechanics for Panoramic Look-Around
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // Sensitivity factor
    const sens = 0.005;
    const newYaw = yaw - e.movementX * sens;
    // Lock pitch between looking almost straight up/down to prevent camera flip
    const newPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch + e.movementY * sens));
    
    setYaw(newYaw);
    setPitch(newPitch);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch controls for mobile
  const lastTouchX = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchX.current = e.touches[0].clientX;
      lastTouchY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || lastTouchX.current === null || lastTouchY.current === null || e.touches.length !== 1) return;
    
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    
    const movementX = clientX - lastTouchX.current;
    const movementY = clientY - lastTouchY.current;
    
    const sens = 0.006;
    const newYaw = yaw - movementX * sens;
    const newPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch + movementY * sens));
    
    setYaw(newYaw);
    setPitch(newPitch);
    
    lastTouchX.current = clientX;
    lastTouchY.current = clientY;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchX.current = null;
    lastTouchY.current = null;
  };

  return (
    <div className="space-y-3.5" id="3d-panoramic-view-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant/70 uppercase">
            3D Seat Vision (Interactive)
          </span>
        </div>
        {seat && (
          <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
            <Move className="w-2.5 h-2.5" /> Drag pitch to look around
          </span>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-white/5 bg-slate-950 shadow-inner flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {seat ? (
          <>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
            
            {/* Ambient HUD Layer overlaying the 3D scene */}
            <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
              {/* Top HUD */}
              <div className="flex justify-between items-start">
                <div className="bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[8px] font-mono text-on-surface-variant font-bold">
                  PERSPECTIVE: SEC {seat.section} • ROW {seat.row} • SEAT {seat.number}
                </div>
                <div className="bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[8px] font-mono text-emerald-400 font-extrabold uppercase tracking-wide">
                  100% Rendered
                </div>
              </div>

              {/* Center crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25">
                <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>

              {/* Bottom HUD */}
              <div className="flex justify-between items-end">
                <div className="flex gap-1">
                  <div className="bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[8px] font-mono text-on-surface-variant flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    PREVIEW PRECISE ANGLE
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPitch(-0.15);
                    setYaw(Math.PI);
                  }}
                  className="pointer-events-auto p-1.5 bg-slate-950/90 hover:bg-white/5 border border-white/10 rounded-lg text-white/75 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
                  title="Reset Camera View"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center space-y-2.5 max-w-xs">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-on-surface-variant/60">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Select any seat in the virtual arena above to load an interactive **3D panoramic view** of the field directly from that seat's exact location and height!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
