import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

// ---------------------------------------------------------------------------
// Axis convention: +X = forward (nose), +Y = up, +Z = right (starboard)
// All dimensions in arbitrary scene units; tweak constants to adjust.
// ---------------------------------------------------------------------------

// Fuselage
const FUSELAGE_LENGTH = 10;
const FUSELAGE_RADIUS = 0.55;
const NOSE_CONE_LENGTH = 1.2;
const TAIL_TAPER_LENGTH = 3.2;
const FUSELAGE_SEGMENTS = 12;

// Wings
const WING_SPAN = 5.4;            // half-span (one side)
const WING_ROOT_CHORD = 2.8;
const WING_TIP_CHORD = 0.9;
const WING_ROOT_THICKNESS = 0.18;
const WING_TIP_THICKNESS = 0.06;
const WING_SWEEP = 1.6;           // tip is this far back from root leading edge
const WING_X_OFFSET = 1.0;        // leading edge of root relative to CG (X=0)
const WING_Y_OFFSET = -0.25;      // wings slightly below center

// Horizontal tail (root LE inside the tail taper where fuselage still has body)
const HTAIL_SPAN = 2.0;
const HTAIL_ROOT_CHORD = 1.4;
const HTAIL_TIP_CHORD = 0.5;
const HTAIL_THICKNESS = 0.06;
const HTAIL_SWEEP = 0.8;
const HTAIL_X_OFFSET = -3.2;
const HTAIL_Y_OFFSET = 0.1;

// Vertical tail
const VTAIL_HEIGHT = 1.8;
const VTAIL_ROOT_CHORD = 2.2;
const VTAIL_TIP_CHORD = 0.8;
const VTAIL_THICKNESS = 0.07;
const VTAIL_SWEEP = 1.2;
const VTAIL_X_OFFSET = -3.0;

// Engines (shorter and fatter)
const ENGINE_DIAMETER = 0.72;
const ENGINE_LENGTH = 1.3;
const ENGINE_SEGMENTS = 10;
const ENGINE_SPAN_POS = 2.0;
const ENGINE_X_OFFSET = 0.8;
const ENGINE_Y_OFFSET = -0.86;

// Wing bottom Y at engine span (linear interpolate root–tip thickness)
const WING_THICKNESS_AT_ENGINE =
  WING_ROOT_THICKNESS +
  ((WING_TIP_THICKNESS - WING_ROOT_THICKNESS) * (ENGINE_SPAN_POS - 0.3)) / (WING_SPAN - 0.3);
const WING_BOTTOM_AT_ENGINE = WING_Y_OFFSET - WING_THICKNESS_AT_ENGINE / 2;
const ENGINE_TOP_Y = ENGINE_Y_OFFSET + ENGINE_DIAMETER / 2;

const PYLON_WIDTH = 0.08;
const PYLON_LENGTH = 0.9;

// Airfoil TE is thinner than max thickness
const TE_RATIO = 0.3;

const PLANE_COLOR = '#c8cfd0';

// ---------------------------------------------------------------------------
// Geometry builders
// ---------------------------------------------------------------------------

function createFuselageGeometry(): THREE.BufferGeometry {
  const points: number[] = [];
  const indices: number[] = [];

  const noseStart = FUSELAGE_LENGTH / 2;
  const noseEnd = noseStart - NOSE_CONE_LENGTH;
  const tailStart = -FUSELAGE_LENGTH / 2 + TAIL_TAPER_LENGTH;

  const sections: { x: number; ry: number; rz: number; yOff: number }[] = [];

  // Nose tip (small radius, not a point)
  sections.push({ x: noseStart, ry: FUSELAGE_RADIUS * 0.12, rz: FUSELAGE_RADIUS * 0.12, yOff: 0 });
  // Nose-body transition (blunt elliptical profile)
  for (let i = 1; i <= 6; i++) {
    const t = i / 6;
    const x = noseStart - t * NOSE_CONE_LENGTH;
    const r = FUSELAGE_RADIUS * Math.pow(t, 0.35);
    sections.push({ x, ry: r, rz: r, yOff: 0 });
  }
  // Main body
  const mainSteps = 3;
  for (let i = 1; i <= mainSteps; i++) {
    const t = i / mainSteps;
    const x = noseEnd - t * (noseEnd - tailStart);
    sections.push({ x, ry: FUSELAGE_RADIUS, rz: FUSELAGE_RADIUS, yOff: 0 });
  }
  // Tail taper (rises upward and narrows)
  for (let i = 1; i <= 5; i++) {
    const t = i / 5;
    const x = tailStart - t * TAIL_TAPER_LENGTH;
    const r = FUSELAGE_RADIUS * (1 - t * 0.75);
    const yOff = t * 0.6;
    sections.push({ x, ry: r, rz: r * 0.7, yOff });
  }

  const segs = FUSELAGE_SEGMENTS;
  for (const sec of sections) {
    if (sec.ry === 0 && sec.rz === 0) {
      for (let j = 0; j < segs; j++) {
        points.push(sec.x, sec.yOff, 0);
      }
    } else {
      for (let j = 0; j < segs; j++) {
        const angle = (j / segs) * Math.PI * 2;
        const y = Math.cos(angle) * sec.ry + sec.yOff;
        const z = Math.sin(angle) * sec.rz;
        points.push(sec.x, y, z);
      }
    }
  }

  const numSections = sections.length;
  for (let i = 0; i < numSections - 1; i++) {
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      const a = i * segs + j;
      const b = i * segs + j1;
      const c = (i + 1) * segs + j;
      const d = (i + 1) * segs + j1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  geo.computeVertexNormals();
  return geo;
}

function createWingGeometry(side: 1 | -1): THREE.BufferGeometry {
  const rootLE_x = WING_X_OFFSET;
  const rootTE_x = rootLE_x - WING_ROOT_CHORD;
  const tipLE_x = rootLE_x - WING_SWEEP;
  const tipTE_x = tipLE_x - WING_TIP_CHORD;

  const rootZ = 0.3 * side;
  const tipZ = WING_SPAN * side;
  const y = WING_Y_OFFSET;
  const rootHT = WING_ROOT_THICKNESS / 2;
  const tipHT = WING_TIP_THICKNESS / 2;
  const rootNose = rootHT * 0.8;
  const tipNose = tipHT * 0.8;

  // 5 vertices per section: LE nose, upper LE, upper TE, lower TE, lower LE
  const verts = new Float32Array([
    // Root (0-4)
    rootLE_x + rootNose, y, rootZ,
    rootLE_x, y + rootHT, rootZ,
    rootTE_x, y + rootHT * TE_RATIO, rootZ,
    rootTE_x, y - rootHT * TE_RATIO, rootZ,
    rootLE_x, y - rootHT, rootZ,
    // Tip (5-9)
    tipLE_x + tipNose, y, tipZ,
    tipLE_x, y + tipHT, tipZ,
    tipTE_x, y + tipHT * TE_RATIO, tipZ,
    tipTE_x, y - tipHT * TE_RATIO, tipZ,
    tipLE_x, y - tipHT, tipZ,
  ]);

  const idx = side > 0
    ? [
        // Upper surface
        0,1,5, 1,6,5, 1,2,6, 2,7,6,
        // Lower surface
        0,5,4, 4,5,9, 4,9,3, 3,9,8,
        // Trailing edge
        2,3,7, 3,8,7,
        // Tip cap
        5,6,7, 5,7,8, 5,8,9,
      ]
    : [
        // Upper surface (flipped)
        0,5,1, 1,5,6, 1,6,2, 2,6,7,
        // Lower surface
        0,4,5, 4,9,5, 4,3,9, 3,8,9,
        // Trailing edge
        2,7,3, 3,7,8,
        // Tip cap
        5,7,6, 5,8,7, 5,9,8,
      ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  geo.computeVertexNormals();
  return geo;
}

function createHTailGeometry(side: 1 | -1): THREE.BufferGeometry {
  const rootLE_x = HTAIL_X_OFFSET;
  const rootTE_x = rootLE_x - HTAIL_ROOT_CHORD;
  const tipLE_x = rootLE_x - HTAIL_SWEEP;
  const tipTE_x = tipLE_x - HTAIL_TIP_CHORD;

  const rootZ = 0;
  const tipZ = HTAIL_SPAN * side;
  const y = HTAIL_Y_OFFSET + 0.5;
  const ht = HTAIL_THICKNESS / 2;
  const noseExt = ht * 0.8;

  const verts = new Float32Array([
    // Root (0-4)
    rootLE_x + noseExt, y, rootZ,
    rootLE_x, y + ht, rootZ,
    rootTE_x, y + ht * TE_RATIO, rootZ,
    rootTE_x, y - ht * TE_RATIO, rootZ,
    rootLE_x, y - ht, rootZ,
    // Tip (5-9)
    tipLE_x + noseExt, y, tipZ,
    tipLE_x, y + ht, tipZ,
    tipTE_x, y + ht * TE_RATIO, tipZ,
    tipTE_x, y - ht * TE_RATIO, tipZ,
    tipLE_x, y - ht, tipZ,
  ]);

  const idx = side > 0
    ? [
        0,1,5, 1,6,5, 1,2,6, 2,7,6,
        0,5,4, 4,5,9, 4,9,3, 3,9,8,
        2,3,7, 3,8,7,
        5,6,7, 5,7,8, 5,8,9,
      ]
    : [
        0,5,1, 1,5,6, 1,6,2, 2,6,7,
        0,4,5, 4,9,5, 4,3,9, 3,8,9,
        2,7,3, 3,7,8,
        5,7,6, 5,8,7, 5,9,8,
      ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  geo.computeVertexNormals();
  return geo;
}

function createVTailGeometry(): THREE.BufferGeometry {
  const rootLE_x = VTAIL_X_OFFSET;
  const rootTE_x = rootLE_x - VTAIL_ROOT_CHORD;
  const tipLE_x = rootLE_x - VTAIL_SWEEP;
  const tipTE_x = tipLE_x - VTAIL_TIP_CHORD;

  const rootY = 0.45;
  const tipY = rootY + VTAIL_HEIGHT;
  const ht = VTAIL_THICKNESS / 2;
  const noseExt = ht * 0.8;

  // 5 vertices per section: LE nose, port side LE, port side TE, starboard TE, starboard LE
  const verts = new Float32Array([
    // Root (0-4)
    rootLE_x + noseExt, rootY, 0,
    rootLE_x, rootY, -ht,
    rootTE_x, rootY, -ht * TE_RATIO,
    rootTE_x, rootY,  ht * TE_RATIO,
    rootLE_x, rootY,  ht,
    // Tip (5-9)
    tipLE_x + noseExt, tipY, 0,
    tipLE_x, tipY, -ht,
    tipTE_x, tipY, -ht * TE_RATIO,
    tipTE_x, tipY,  ht * TE_RATIO,
    tipLE_x, tipY,  ht,
  ]);

  const idx = [
    // Port face (-Z)
    0,1,5, 1,6,5, 1,2,6, 2,7,6,
    // Starboard face (+Z)
    0,5,4, 4,5,9, 4,9,3, 3,9,8,
    // Trailing edge
    2,3,7, 3,8,7,
    // Tip cap
    5,6,7, 5,7,8, 5,8,9,
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  geo.computeVertexNormals();
  return geo;
}

function createEngineGeometry(side: 1 | -1): THREE.BufferGeometry {
  const cx = ENGINE_X_OFFSET;
  const cy = ENGINE_Y_OFFSET;
  const cz = ENGINE_SPAN_POS * side;
  const r = ENGINE_DIAMETER / 2;
  const halfLen = ENGINE_LENGTH / 2;
  const segs = ENGINE_SEGMENTS;

  const points: number[] = [];
  const indices: number[] = [];

  // Front cap center, ring, back cap center, ring
  // Front center = 0
  points.push(cx + halfLen, cy, cz);
  // Front ring: 1..segs
  for (let i = 0; i < segs; i++) {
    const angle = (i / segs) * Math.PI * 2;
    points.push(cx + halfLen, cy + Math.cos(angle) * r, cz + Math.sin(angle) * r);
  }
  // Back center = segs+1
  points.push(cx - halfLen, cy, cz);
  // Back ring: segs+2 .. 2*segs+1
  for (let i = 0; i < segs; i++) {
    const angle = (i / segs) * Math.PI * 2;
    points.push(cx - halfLen, cy + Math.cos(angle) * r * 0.85, cz + Math.sin(angle) * r * 0.85);
  }

  // Front cap
  for (let i = 0; i < segs; i++) {
    const i1 = 1 + i;
    const i2 = 1 + (i + 1) % segs;
    indices.push(0, i1, i2);
  }

  // Back cap
  const bc = segs + 1;
  for (let i = 0; i < segs; i++) {
    const i1 = bc + 1 + i;
    const i2 = bc + 1 + (i + 1) % segs;
    indices.push(bc, i2, i1);
  }

  // Side
  for (let i = 0; i < segs; i++) {
    const f1 = 1 + i;
    const f2 = 1 + (i + 1) % segs;
    const b1 = bc + 1 + i;
    const b2 = bc + 1 + (i + 1) % segs;
    indices.push(f1, b1, f2);
    indices.push(f2, b1, b2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  geo.computeVertexNormals();
  return geo;
}

function createPylonGeometry(side: 1 | -1): THREE.BufferGeometry {
  const engineCenterX = ENGINE_X_OFFSET - ENGINE_LENGTH / 2 + ENGINE_LENGTH * 0.45;
  const cx = engineCenterX;
  const cz = ENGINE_SPAN_POS * side;
  const topY = WING_BOTTOM_AT_ENGINE;
  const botY = ENGINE_TOP_Y;
  const hw = PYLON_WIDTH / 2;
  const hl = PYLON_LENGTH / 2;

  const verts = new Float32Array([
    cx + hl, topY,  cz - hw,  // 0
    cx - hl, topY,  cz - hw,  // 1
    cx - hl, topY,  cz + hw,  // 2
    cx + hl, topY,  cz + hw,  // 3
    cx + hl, botY,  cz - hw,  // 4
    cx - hl, botY,  cz - hw,  // 5
    cx - hl, botY,  cz + hw,  // 6
    cx + hl, botY,  cz + hw,  // 7
  ]);

  const idx = [
    0,1,4, 4,1,5,  // front
    3,7,2, 2,7,6,  // back
    0,4,3, 3,4,7,  // right
    1,2,5, 5,2,6,  // left
    0,3,1, 1,3,2,  // top
    4,5,7, 7,5,6,  // bottom
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// Airplane mesh component
// ---------------------------------------------------------------------------

interface AirplaneProps {
  scrollProgress: MotionValue<number>;
}

function Airplane({ scrollProgress }: AirplaneProps) {
  const groupRef = useRef<THREE.Group>(null!);

  const geometries = useMemo(() => ({
    fuselage: createFuselageGeometry(),
    wingL: createWingGeometry(-1),
    wingR: createWingGeometry(1),
    htailL: createHTailGeometry(-1),
    htailR: createHTailGeometry(1),
    vtail: createVTailGeometry(),
    engineL: createEngineGeometry(-1),
    engineR: createEngineGeometry(1),
    pylonL: createPylonGeometry(-1),
    pylonR: createPylonGeometry(1),
  }), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const v = scrollProgress.get();
    const baseScale = 0.62; // smaller in view
    const s = baseScale * (1 - v * 0.05);
    groupRef.current.scale.setScalar(s);
    groupRef.current.rotation.y = -0.225 * v;
    groupRef.current.rotation.x = 0.12 * v;
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.5]}>
      <mesh geometry={geometries.fuselage}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.wingL}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.wingR}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.htailL}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.htailR}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.vtail}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.engineL}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.engineR}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.pylonL}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
      <mesh geometry={geometries.pylonR}>
        <meshStandardMaterial attach="material" color={PLANE_COLOR} flatShading />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// HeroScene: top-level component with Canvas, client-only + desktop-only
// ---------------------------------------------------------------------------

interface HeroSceneProps {
  scrollProgress: MotionValue<number>;
}

const DESKTOP_QUERY = '(min-width: 901px)';

const HeroScene: React.FC<HeroSceneProps> = ({ scrollProgress }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const update = () => setShouldRender(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  if (!shouldRender) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        camera={{
          fov: 35,
          position: [12, 7, -8],
          near: 0.1,
          far: 100,
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 12, -5]} intensity={0.8} />
        <directionalLight position={[-5, 3, 8]} intensity={0.3} />
        <Airplane scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
