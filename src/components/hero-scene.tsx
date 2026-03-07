import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

// ---------------------------------------------------------------------------
// Axis convention: +X = forward (nose), +Y = up, +Z = right (starboard)
// All dimensions in arbitrary scene units; tweak constants to adjust.
// ---------------------------------------------------------------------------

// Fuselage (787-inspired: depth/width 1.05)
const FUSELAGE_LENGTH = 10;
const FUSELAGE_RADIUS = 0.55;
const FUSELAGE_DEPTH_WIDTH = 1.05;  // ry/rz, slightly oval
const NOSE_CONE_LENGTH = 1.2;
const TAIL_TAPER_LENGTH = 3.2;
const FUSELAGE_SEGMENTS = 12;

// Wings (787: break 0.32, taper 0.18, dihedral 6°, t/c root 0.134, break 0.7, tip 0.655)
const WING_SPAN = 5.4;            // half-span (one side)
const WING_BREAK_FRACTION = 0.32;
const WING_DIHEDRAL_DEG = 6;
const WING_ROOT_CHORD = 2.8;
const WING_TAPER = 0.18;          // tip chord / root chord
const WING_TIP_CHORD = WING_ROOT_CHORD * WING_TAPER;
const WING_ROOT_THICKNESS = 0.18; // root t/c ~0.134 * chord
const WING_T_C_BREAK_RATIO = 0.7;  // t/c at break vs root
const WING_T_C_TIP_RATIO = 0.655;  // t/c at tip vs root
const WING_TIP_THICKNESS = WING_ROOT_THICKNESS * WING_T_C_TIP_RATIO;
const WING_SWEEP = 1.6;           // tip LE back from root LE (32.2° approx)
const WING_X_OFFSET = 1.0;        // leading edge of root relative to CG (X=0)
const WING_Y_OFFSET = -0.25;      // wings slightly below center
const WING_ROOT_Z = 0.3;          // root station (clear of fuselage)

// Horizontal tail (root LE inside the tail taper where fuselage still has body)
const HTAIL_SPAN = 2.0;
const HTAIL_ROOT_CHORD = 1.4;
const HTAIL_TIP_CHORD = 0.5;
const HTAIL_THICKNESS = 0.06;
const HTAIL_SWEEP = 0.8;
const HTAIL_X_OFFSET = -3.2;
const HTAIL_Y_OFFSET = 0.1;

// Vertical tail (787: fin sweep 40°, taper 0.333, TE less swept than LE)
const VTAIL_HEIGHT = 1.8;
const VTAIL_ROOT_CHORD = 2.2;
const VTAIL_TAPER = 0.333;
const VTAIL_TIP_CHORD = VTAIL_ROOT_CHORD * VTAIL_TAPER;
const VTAIL_THICKNESS = 0.07;
const VTAIL_SWEEP = 1.2;
const VTAIL_TE_SWEEP_DEG = 28;    // trailing edge sweep (side view), less than LE
const VTAIL_X_OFFSET = -3.0;

// Engines (787: nacelles at 26.5% semi-span; nac length/width ~1.55)
const ENGINE_DIAMETER = 0.72;
const ENGINE_LENGTH = 1.3;
const ENGINE_SEGMENTS = 10;
const ENGINE_SPAN_POS = WING_SPAN * 0.265;  // nacs-mounted-on-wing 0.265
const ENGINE_X_OFFSET = 0.8;
const ENGINE_Y_OFFSET = -0.86;
// Nacelle sections (x fraction from front to back, radius fraction of max): lip, max, mid, nozzle
const NACELLE_SECTIONS: { x: number; r: number }[] = [
  { x: 0.5, r: 1.02 },   // front lip
  { x: 0.25, r: 1 },     // max diameter
  { x: -0.2, r: 0.94 },  // mid taper
  { x: -0.5, r: 0.85 },  // rear nozzle
];

// Wing break station (semi-span fraction) and thickness there
const WING_BREAK_Z = WING_SPAN * WING_BREAK_FRACTION;
const WING_BREAK_THICKNESS = WING_ROOT_THICKNESS * WING_T_C_BREAK_RATIO;
// Thickness at engine span (between root and break)
const WING_THICKNESS_AT_ENGINE =
  WING_ROOT_THICKNESS +
  ((WING_BREAK_THICKNESS - WING_ROOT_THICKNESS) * (ENGINE_SPAN_POS - WING_ROOT_Z)) /
    (WING_BREAK_Z - WING_ROOT_Z);
const WING_DIHEDRAL_RAD = (WING_DIHEDRAL_DEG * Math.PI) / 180;
const WING_Y_AT_ENGINE =
  WING_Y_OFFSET + (ENGINE_SPAN_POS - WING_ROOT_Z) * Math.tan(WING_DIHEDRAL_RAD);
const WING_BOTTOM_AT_ENGINE = WING_Y_AT_ENGINE - WING_THICKNESS_AT_ENGINE / 2;
const ENGINE_TOP_Y = ENGINE_Y_OFFSET + ENGINE_DIAMETER / 2;

const PYLON_LENGTH = 0.9;
const PYLON_WIDTH_AT_WING = 0.14;   // wider at wing
const PYLON_WIDTH_AT_ENGINE = 0.06; // narrower at nacelle

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
  const ry = FUSELAGE_RADIUS * Math.sqrt(FUSELAGE_DEPTH_WIDTH); // vertical radius
  const rz = FUSELAGE_RADIUS / Math.sqrt(FUSELAGE_DEPTH_WIDTH);  // horizontal radius

  const sections: { x: number; ry: number; rz: number; yOff: number }[] = [];

  // Nose tip (small radius, not a point)
  sections.push({ x: noseStart, ry: ry * 0.1, rz: rz * 0.1, yOff: 0 });
  // Nose-body transition: smoother growth (x_norm)^0.45, 8 steps
  for (let i = 1; i <= 8; i++) {
    const t = i / 8;
    const x = noseStart - t * NOSE_CONE_LENGTH;
    const rNorm = Math.pow(t, 0.45);
    sections.push({ x, ry: ry * rNorm, rz: rz * rNorm, yOff: 0 });
  }
  // Main body (slight oval: depth/width 1.05)
  const mainSteps = 3;
  for (let i = 1; i <= mainSteps; i++) {
    const t = i / mainSteps;
    const x = noseEnd - t * (noseEnd - tailStart);
    sections.push({ x, ry, rz, yOff: 0 });
  }
  // Tail taper (rises upward, narrows, rz < ry for flattening)
  for (let i = 1; i <= 6; i++) {
    const t = i / 6;
    const x = tailStart - t * TAIL_TAPER_LENGTH;
    const rScale = 1 - t * 0.78;
    const yOff = t * 0.6;
    sections.push({ x, ry: ry * rScale, rz: rz * rScale * 0.72, yOff });
  }

  const segs = FUSELAGE_SEGMENTS;
  // Nose tip cap: single vertex at the very front
  const firstSection = sections[0];
  points.push(firstSection.x, firstSection.yOff, 0);

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
  const ringVertexOffset = 1; // after the nose-tip vertex

  // Nose cap: triangles from tip (0) to first ring (1..segs)
  for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs;
    indices.push(0, ringVertexOffset + j, ringVertexOffset + j1);
  }

  // Tube between sections (indices shifted by ringVertexOffset)
  for (let i = 0; i < numSections - 1; i++) {
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      const a = ringVertexOffset + i * segs + j;
      const b = ringVertexOffset + i * segs + j1;
      const c = ringVertexOffset + (i + 1) * segs + j;
      const d = ringVertexOffset + (i + 1) * segs + j1;
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
  const s = side;
  const rootLE_x = WING_X_OFFSET;
  const rootTE_x = rootLE_x - WING_ROOT_CHORD;
  // Break: chord interpolated (poly-taper), LE sweep proportional to span
  const breakChord =
    WING_ROOT_CHORD +
    (WING_TIP_CHORD - WING_ROOT_CHORD) * (WING_BREAK_FRACTION / 1);
  const breakLE_x = rootLE_x - (WING_SWEEP * WING_BREAK_FRACTION) / 1;
  const breakTE_x = breakLE_x - breakChord;
  const tipLE_x = rootLE_x - WING_SWEEP;
  const tipTE_x = tipLE_x - WING_TIP_CHORD;

  const rootZ = WING_ROOT_Z * s;
  const breakZ = WING_BREAK_Z * s;
  const tipZ = WING_SPAN * s;
  const rootY = WING_Y_OFFSET;
  const breakY = WING_Y_OFFSET + (WING_BREAK_Z - WING_ROOT_Z) * Math.tan(WING_DIHEDRAL_RAD);
  const tipY = WING_Y_OFFSET + (WING_SPAN - WING_ROOT_Z) * Math.tan(WING_DIHEDRAL_RAD);

  const rootHT = WING_ROOT_THICKNESS / 2;
  const breakHT = (WING_ROOT_THICKNESS * WING_T_C_BREAK_RATIO) / 2;
  const tipHT = WING_TIP_THICKNESS / 2;
  const rootNose = rootHT * 0.8;
  const breakNose = breakHT * 0.8;
  const tipNose = tipHT * 0.8;

  // 5 vertices per section: LE nose, upper LE, upper TE, lower TE, lower LE
  // Sections: root (0-4), break (5-9), tip (10-14)
  const verts = new Float32Array([
    rootLE_x + rootNose, rootY, rootZ,
    rootLE_x, rootY + rootHT, rootZ,
    rootTE_x, rootY + rootHT * TE_RATIO, rootZ,
    rootTE_x, rootY - rootHT * TE_RATIO, rootZ,
    rootLE_x, rootY - rootHT, rootZ,
    breakLE_x + breakNose, breakY, breakZ,
    breakLE_x, breakY + breakHT, breakZ,
    breakTE_x, breakY + breakHT * TE_RATIO, breakZ,
    breakTE_x, breakY - breakHT * TE_RATIO, breakZ,
    breakLE_x, breakY - breakHT, breakZ,
    tipLE_x + tipNose, tipY, tipZ,
    tipLE_x, tipY + tipHT, tipZ,
    tipTE_x, tipY + tipHT * TE_RATIO, tipZ,
    tipTE_x, tipY - tipHT * TE_RATIO, tipZ,
    tipLE_x, tipY - tipHT, tipZ,
  ]);

  const perSection = 5;
  const wrap = (sec: number, v: number) => sec * perSection + v;
  const idx =
    s > 0
      ? [
          // Root–break: upper
          wrap(0, 0), wrap(0, 1), wrap(1, 0),
          wrap(0, 1), wrap(1, 1), wrap(1, 0),
          wrap(0, 1), wrap(0, 2), wrap(1, 1),
          wrap(0, 2), wrap(1, 2), wrap(1, 1),
          // Root–break: lower
          wrap(0, 0), wrap(1, 0), wrap(0, 4),
          wrap(0, 4), wrap(1, 0), wrap(1, 4),
          wrap(0, 4), wrap(1, 4), wrap(0, 3),
          wrap(0, 3), wrap(1, 4), wrap(1, 3),
          // Root–break: TE
          wrap(0, 2), wrap(0, 3), wrap(1, 2),
          wrap(0, 3), wrap(1, 3), wrap(1, 2),
          // Break–tip: upper
          wrap(1, 0), wrap(1, 1), wrap(2, 0),
          wrap(1, 1), wrap(2, 1), wrap(2, 0),
          wrap(1, 1), wrap(1, 2), wrap(2, 1),
          wrap(1, 2), wrap(2, 2), wrap(2, 1),
          // Break–tip: lower
          wrap(1, 0), wrap(2, 0), wrap(1, 4),
          wrap(1, 4), wrap(2, 0), wrap(2, 4),
          wrap(1, 4), wrap(2, 4), wrap(1, 3),
          wrap(1, 3), wrap(2, 4), wrap(2, 3),
          // Break–tip: TE
          wrap(1, 2), wrap(1, 3), wrap(2, 2),
          wrap(1, 3), wrap(2, 3), wrap(2, 2),
          // Tip cap
          wrap(2, 0), wrap(2, 1), wrap(2, 2),
          wrap(2, 0), wrap(2, 2), wrap(2, 3),
          wrap(2, 0), wrap(2, 3), wrap(2, 4),
        ]
      : [
          wrap(0, 0), wrap(1, 0), wrap(0, 1),
          wrap(0, 1), wrap(1, 0), wrap(1, 1),
          wrap(0, 1), wrap(1, 1), wrap(0, 2),
          wrap(0, 2), wrap(1, 1), wrap(1, 2),
          wrap(0, 0), wrap(0, 4), wrap(1, 0),
          wrap(0, 4), wrap(1, 4), wrap(1, 0),
          wrap(0, 4), wrap(0, 3), wrap(1, 4),
          wrap(0, 3), wrap(1, 3), wrap(1, 4),
          wrap(0, 2), wrap(1, 2), wrap(0, 3),
          wrap(0, 3), wrap(1, 2), wrap(1, 3),
          wrap(1, 0), wrap(2, 0), wrap(1, 1),
          wrap(1, 1), wrap(2, 0), wrap(2, 1),
          wrap(1, 1), wrap(2, 1), wrap(1, 2),
          wrap(1, 2), wrap(2, 1), wrap(2, 2),
          wrap(1, 0), wrap(1, 4), wrap(2, 0),
          wrap(1, 4), wrap(2, 4), wrap(2, 0),
          wrap(1, 4), wrap(1, 3), wrap(2, 4),
          wrap(1, 3), wrap(2, 3), wrap(2, 4),
          wrap(1, 2), wrap(1, 3), wrap(2, 2),
          wrap(1, 3), wrap(2, 3), wrap(2, 2),
          wrap(2, 0), wrap(2, 2), wrap(2, 1),
          wrap(2, 0), wrap(2, 3), wrap(2, 2),
          wrap(2, 0), wrap(2, 4), wrap(2, 3),
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
  // TE sweep (side view): tip TE aft of root TE
  const teSweepRad = (VTAIL_TE_SWEEP_DEG * Math.PI) / 180;
  const tipTE_x = rootTE_x - VTAIL_HEIGHT * Math.tan(teSweepRad);
  const tipLE_x = tipTE_x + VTAIL_TIP_CHORD; // taper 0.333

  const rootY = 0.45;
  const tipY = rootY + VTAIL_HEIGHT;
  const ht = VTAIL_THICKNESS / 2;
  const noseExt = ht * 0.8;

  // 5 vertices per section: LE nose, port side LE, port side TE, starboard TE, starboard LE
  const verts = new Float32Array([
    rootLE_x + noseExt, rootY, 0,
    rootLE_x, rootY, -ht,
    rootTE_x, rootY, -ht * TE_RATIO,
    rootTE_x, rootY, ht * TE_RATIO,
    rootLE_x, rootY, ht,
    tipLE_x + noseExt, tipY, 0,
    tipLE_x, tipY, -ht,
    tipTE_x, tipY, -ht * TE_RATIO,
    tipTE_x, tipY, ht * TE_RATIO,
    tipLE_x, tipY, ht,
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
  const rMax = ENGINE_DIAMETER / 2;
  const halfLen = ENGINE_LENGTH / 2;
  const segs = ENGINE_SEGMENTS;
  const numSections = NACELLE_SECTIONS.length;
  // x: section.x is fraction in [-0.5, 0.5] along length → world x = cx + section.x * ENGINE_LENGTH
  const points: number[] = [];
  const indices: number[] = [];

  for (let sec = 0; sec < numSections; sec++) {
    const { x: xFrac, r: rFrac } = NACELLE_SECTIONS[sec];
    const x = cx + xFrac * ENGINE_LENGTH;
    const r = rMax * rFrac;
    for (let i = 0; i < segs; i++) {
      const angle = (i / segs) * Math.PI * 2;
      points.push(x, cy + Math.cos(angle) * r, cz + Math.sin(angle) * r);
    }
  }

  const ring = (sec: number, i: number) => sec * segs + (i % segs);
  for (let sec = 0; sec < numSections - 1; sec++) {
    for (let i = 0; i < segs; i++) {
      const i1 = (i + 1) % segs;
      const a = ring(sec, i);
      const b = ring(sec, i1);
      const c = ring(sec + 1, i);
      const d = ring(sec + 1, i1);
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Front cap (first ring + center)
  const frontCenter = numSections * segs;
  points.push(
    cx + NACELLE_SECTIONS[0].x * ENGINE_LENGTH,
    cy,
    cz
  );
  for (let i = 0; i < segs; i++) {
    indices.push(frontCenter, ring(0, i), ring(0, i + 1));
  }

  // Back cap
  const backCenter = frontCenter + 1;
  points.push(
    cx + NACELLE_SECTIONS[numSections - 1].x * ENGINE_LENGTH,
    cy,
    cz
  );
  const lastSec = numSections - 1;
  for (let i = 0; i < segs; i++) {
    indices.push(backCenter, ring(lastSec, i + 1), ring(lastSec, i));
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
  const hwTop = PYLON_WIDTH_AT_WING / 2;   // wider at wing
  const hwBot = PYLON_WIDTH_AT_ENGINE / 2; // narrower at nacelle
  const hl = PYLON_LENGTH / 2;

  const verts = new Float32Array([
    cx + hl, topY, cz - hwTop,  // 0
    cx - hl, topY, cz - hwTop,  // 1
    cx - hl, topY, cz + hwTop,  // 2
    cx + hl, topY, cz + hwTop,  // 3
    cx + hl, botY, cz - hwBot,  // 4
    cx - hl, botY, cz - hwBot,  // 5
    cx - hl, botY, cz + hwBot,  // 6
    cx + hl, botY, cz + hwBot,  // 7
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

function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;
  for (const g of geometries) {
    const pos = g.getAttribute('position');
    const idx = g.getIndex();
    if (!pos || !idx) continue;
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }
    for (let i = 0; i < idx.count; i++) {
      indices.push(idx.getX(i) + vertexOffset);
    }
    vertexOffset += pos.count;
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  merged.computeVertexNormals();
  return merged;
}

// Idle animation: subtle pitch/yaw/roll and position bob (radians / units)
const IDLE_PITCH_AMP = 0.14;
const IDLE_YAW_AMP = 0.05;
const IDLE_ROLL_AMP = 0.04;
const IDLE_BOB_AMP = 0.35;
const IDLE_SPEED = 0.38;

function Airplane({ scrollProgress }: AirplaneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const scrollRef = useRef(0);

  const mergedGeometry = useMemo(() => {
    const geos = [
      createFuselageGeometry(),
      createWingGeometry(-1),
      createWingGeometry(1),
      createHTailGeometry(-1),
      createHTailGeometry(1),
      createVTailGeometry(),
      createEngineGeometry(-1),
      createEngineGeometry(1),
      createPylonGeometry(-1),
      createPylonGeometry(1),
    ];
    return mergeGeometries(geos);
  }, []);

  useEffect(() => {
    scrollRef.current = scrollProgress.get();
    const unsub = scrollProgress.on('change', (v) => {
      scrollRef.current = v;
    });
    return () => unsub();
  }, [scrollProgress]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const v = scrollRef.current;
    const t = state.clock.elapsedTime * IDLE_SPEED;
    const baseScale = 0.62;
    g.scale.setScalar(baseScale * (1 - v * 0.05));
    // pitch and roll mapped to aircraft axes not graphics axes
    g.rotation.x = 0.24 * v + IDLE_ROLL_AMP * Math.sin(t);
    g.rotation.y = -0.45 * v + IDLE_YAW_AMP * Math.sin(t * 0.7 + 1);
    g.rotation.z = .18 + IDLE_PITCH_AMP * Math.sin(t * 0.5 + 2);
    g.position.y = IDLE_BOB_AMP * Math.sin(t * 0.6 + 0.5);
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.5]}>
      <mesh geometry={mergedGeometry}>
        <meshStandardMaterial color={PLANE_COLOR} flatShading />
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
