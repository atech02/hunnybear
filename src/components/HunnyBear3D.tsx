import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { BodyRegion, AnimationState, MouthShape } from '../types/game';

const GLB_MODEL_URL = '/models/cute_simple_bear_3d_model__rigging.glb';

// Module-level cache to avoid unnecessary repeated network/parse loading of the GLB model
let cachedGltfPromise: Promise<GLTF> | null = null;

const loadBearGlbOnce = (): Promise<GLTF> => {
  if (!cachedGltfPromise) {
    const loader = new GLTFLoader();
    cachedGltfPromise = new Promise<GLTF>((resolve, reject) => {
      loader.load(
        GLB_MODEL_URL,
        (gltf) => resolve(gltf),
        undefined,
        (err) => {
          cachedGltfPromise = null;
          reject(err);
        }
      );
    });
  }
  return cachedGltfPromise;
};

export interface GlbInspectionSummary {
  url: string;
  meshNames: string[];
  boneNames: string[];
  animationNames: string[];
  morphTargetNames: string[];
  hasSkeleton: boolean;
}

interface HunnyBear3DProps {
  animationState: AnimationState;
  mouthShape?: MouthShape;
  isSpeaking: boolean;
  onTapRegion: (region: BodyRegion, clientX?: number, clientY?: number) => void;
}

const SPECIFIC_FACE_REGIONS = new Set<BodyRegion>([
  'nose',
  'mouth',
  'left-eye',
  'right-eye',
  'left-cheek',
  'right-cheek',
  'left-ear',
  'right-ear',
]);

const SPECIFIC_LIMB_REGIONS = new Set<BodyRegion>([
  'left-hand',
  'right-hand',
  'left-foot',
  'right-foot',
]);

function resolveRegionFromIntersections(intersects: THREE.Intersection[]): BodyRegion | null {
  const hitsWithRegion: Array<{ region: BodyRegion; distance: number }> = [];
  for (const hit of intersects) {
    let currentObj: THREE.Object3D | null = hit.object;
    while (currentObj) {
      if (currentObj.userData && currentObj.userData.region) {
        hitsWithRegion.push({
          region: currentObj.userData.region as BodyRegion,
          distance: hit.distance,
        });
        break;
      }
      currentObj = currentObj.parent;
    }
  }

  if (hitsWithRegion.length === 0) return null;

  const first = hitsWithRegion[0];
  // Prioritize specific facial features if the ray grazed the head mesh nearby
  if (first.region === 'head') {
    const specificFaceHit = hitsWithRegion.find(
      (h) => SPECIFIC_FACE_REGIONS.has(h.region) && h.distance - first.distance < 0.45
    );
    if (specificFaceHit) return specificFaceHit.region;
  }

  // Prioritize limb hits if the ray grazed the outer torso mesh nearby
  if (first.region === 'stomach') {
    const specificLimbHit = hitsWithRegion.find(
      (h) => SPECIFIC_LIMB_REGIONS.has(h.region) && h.distance - first.distance < 0.35
    );
    if (specificLimbHit) return specificLimbHit.region;
  }

  return first.region;
}

export const HunnyBear3D: React.FC<HunnyBear3DProps> = ({
  animationState,
  mouthShape = 'closed',
  isSpeaking,
  onTapRegion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const animationStateRef = useRef<AnimationState>(animationState);
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const mouthShapeRef = useRef<MouthShape>(mouthShape);
  const onTapRegionRef = useRef<typeof onTapRegion>(onTapRegion);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    mouthShapeRef.current = mouthShape;
  }, [mouthShape]);

  useEffect(() => {
    onTapRegionRef.current = onTapRegion;
  }, [onTapRegion]);

  const handlePointerDown = useCallback(
    (
      event: MouseEvent | TouchEvent,
      renderer: THREE.WebGLRenderer,
      camera: THREE.PerspectiveCamera,
      interactiveMeshes: THREE.Object3D[]
    ) => {
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in event) {
        if (event.touches.length === 0) return;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = (event as MouseEvent).clientX;
        clientY = (event as MouseEvent).clientY;
      }

      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(interactiveMeshes, true);
      const region = resolveRegionFromIntersections(intersects);
      if (region) {
        onTapRegionRef.current(region, clientX, clientY);
      }
    },
    []
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer Setup (mobile & Capacitor optimized)
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.12, 6.95);
    camera.lookAt(0, -0.04, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    container.appendChild(renderer.domElement);

    // 2. Natural Fairytale Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ec, 1.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff9e6, 0x8b6b4a, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2d6, 1.35);
    keyLight.position.set(3.2, 5.2, 5.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xcde8f6, 0.55);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfce198, 0.95);
    rimLight.position.set(0, 3.5, -4);
    scene.add(rimLight);

    // 3. Shared PBR Materials
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xd9923b,
      roughness: 0.74,
      metalness: 0.03,
    });

    const earFurMat = new THREE.MeshStandardMaterial({
      color: 0xcc852f,
      roughness: 0.76,
      metalness: 0.03,
    });

    const creamMat = new THREE.MeshStandardMaterial({
      color: 0xfff3dc,
      roughness: 0.68,
      metalness: 0.02,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x3d2012,
      roughness: 0.28,
      metalness: 0.12,
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x361e10,
      roughness: 0.25,
    });

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x110804 });
    const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf47c7c,
      roughness: 0.82,
      transparent: true,
      opacity: 0.68,
    });

    const mouthInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x8c2c28,
      roughness: 0.45,
    });

    const tongueMat = new THREE.MeshStandardMaterial({
      color: 0xe86f68,
      roughness: 0.5,
    });

    const eyebrowMat = new THREE.MeshStandardMaterial({
      color: 0x4a2c18,
      roughness: 0.6,
    });

    const invisibleHitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    // 4. Build Articulated 3D Hierarchy & Mount Loaded GLB Mesh
    const interactiveMeshes: THREE.Object3D[] = [];

    const bearRoot = new THREE.Group();
    bearRoot.name = 'HunnyBearRoot';
    bearRoot.position.set(0, -0.1, 0);
    bearRoot.scale.set(0.9, 0.9, 0.9);
    scene.add(bearRoot);

    const pelvis = new THREE.Group();
    pelvis.name = 'Pelvis';
    pelvis.position.set(0, -0.36, 0);
    bearRoot.add(pelvis);

    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Torso';
    pelvis.add(torsoGroup);

    const torsoGeo = new THREE.SphereGeometry(1.02, 32, 24);
    torsoGeo.scale(0.98, 1.12, 0.88);
    const torsoMesh = new THREE.Mesh(torsoGeo, furMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoMesh.userData = { region: 'stomach' };
    torsoGroup.add(torsoMesh);
    interactiveMeshes.push(torsoMesh);

    // Stomach / Tummy Region ('stomach')
    const stomachGroup = new THREE.Group();
    stomachGroup.name = 'Stomach';
    stomachGroup.position.set(0, -0.04, 0.64);
    stomachGroup.userData = { region: 'stomach' };
    torsoGroup.add(stomachGroup);

    const bellyPatchGeo = new THREE.SphereGeometry(0.74, 28, 22);
    bellyPatchGeo.scale(0.94, 1.08, 0.42);
    const bellyPatchMesh = new THREE.Mesh(bellyPatchGeo, creamMat);
    bellyPatchMesh.userData = { region: 'stomach' };
    stomachGroup.add(bellyPatchMesh);
    interactiveMeshes.push(bellyPatchMesh);

    // Head Pivot & Head Group ('head')
    const headPivot = new THREE.Group();
    headPivot.name = 'HeadPivot';
    headPivot.position.set(0, 1.48, 0.04);
    torsoGroup.add(headPivot);

    const headGroup = new THREE.Group();
    headGroup.name = 'Head';
    headPivot.add(headGroup);

    // Fallback procedural head sphere (replaced by loaded GLB Quad Sphere mesh once GLB finishes loading)
    const fallbackHeadGeo = new THREE.SphereGeometry(1.0, 28, 28);
    fallbackHeadGeo.scale(1.02, 0.96, 0.92);
    const fallbackHeadMesh = new THREE.Mesh(fallbackHeadGeo, furMat);
    fallbackHeadMesh.castShadow = true;
    fallbackHeadMesh.receiveShadow = true;
    fallbackHeadMesh.userData = { region: 'head' };
    headGroup.add(fallbackHeadMesh);
    interactiveMeshes.push(fallbackHeadMesh);

    // Cream Muzzle
    const muzzleGroup = new THREE.Group();
    muzzleGroup.name = 'Muzzle';
    muzzleGroup.position.set(0, -0.22, 0.76);
    headGroup.add(muzzleGroup);

    const muzzleGeo = new THREE.SphereGeometry(0.48, 28, 22);
    muzzleGeo.scale(1.18, 0.84, 0.78);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, creamMat);
    muzzleMesh.castShadow = true;
    muzzleMesh.userData = { region: 'head' };
    muzzleGroup.add(muzzleMesh);

    // Nose ('nose')
    const noseGeo = new THREE.SphereGeometry(0.16, 20, 18);
    noseGeo.scale(1.22, 0.86, 0.95);
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.name = 'Nose';
    noseMesh.position.set(0, 0.16, 0.42);
    noseMesh.userData = { region: 'nose' };
    muzzleGroup.add(noseMesh);
    interactiveMeshes.push(noseMesh);

    // Slightly larger invisible collider around nose for forgiving touch/click selection
    const noseHitGeo = new THREE.SphereGeometry(0.18, 12, 10);
    const noseHitMesh = new THREE.Mesh(noseHitGeo, invisibleHitMat);
    noseHitMesh.position.set(0, 0.16, 0.42);
    noseHitMesh.userData = { region: 'nose' };
    muzzleGroup.add(noseHitMesh);
    interactiveMeshes.push(noseHitMesh);

    // Mouth & Jaw ('mouth')
    const mouthGroup = new THREE.Group();
    mouthGroup.name = 'Mouth';
    mouthGroup.position.set(0, -0.16, 0.4);
    mouthGroup.userData = { region: 'mouth' };
    muzzleGroup.add(mouthGroup);

    const smileCurve = new THREE.TorusGeometry(0.16, 0.028, 14, 28, Math.PI);
    smileCurve.rotateZ(Math.PI);
    const smileMesh = new THREE.Mesh(smileCurve, noseMat);
    smileMesh.position.set(0, 0.02, 0.02);
    smileMesh.userData = { region: 'mouth' };
    mouthGroup.add(smileMesh);
    interactiveMeshes.push(smileMesh);

    const mouthCavityGeo = new THREE.SphereGeometry(0.15, 20, 16);
    mouthCavityGeo.scale(1.0, 0.75, 0.55);
    const mouthCavityMesh = new THREE.Mesh(mouthCavityGeo, mouthInteriorMat);
    mouthCavityMesh.position.set(0, -0.05, -0.01);
    mouthCavityMesh.userData = { region: 'mouth' };
    mouthGroup.add(mouthCavityMesh);
    interactiveMeshes.push(mouthCavityMesh);

    const tongueGeo = new THREE.SphereGeometry(0.08, 14, 10);
    tongueGeo.scale(1.1, 0.55, 0.5);
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    tongueMesh.position.set(0, -0.05, 0.05);
    tongueMesh.userData = { region: 'mouth' };
    mouthCavityMesh.add(tongueMesh);

    // Forgiving invisible hit collider for mouth region (kept strictly below noseHitMesh)
    const mouthHitGeo = new THREE.SphereGeometry(0.18, 12, 10);
    mouthHitGeo.scale(1.15, 0.85, 0.75);
    const mouthHitMesh = new THREE.Mesh(mouthHitGeo, invisibleHitMat);
    mouthHitMesh.position.set(0, -0.05, 0.02);
    mouthHitMesh.userData = { region: 'mouth' };
    mouthGroup.add(mouthHitMesh);
    interactiveMeshes.push(mouthHitMesh);

    // Eyes & Movable Eyelids ('left-eye', 'right-eye')
    const createEye = (isLeft: boolean) => {
      const eyeRoot = new THREE.Group();
      eyeRoot.name = isLeft ? 'LeftEye' : 'RightEye';
      eyeRoot.position.set(isLeft ? -0.42 : 0.42, 0.15, 0.84);
      const region: BodyRegion = isLeft ? 'left-eye' : 'right-eye';
      eyeRoot.userData = { region };

      const scleraGeo = new THREE.SphereGeometry(0.21, 22, 18);
      scleraGeo.scale(1.0, 1.12, 0.65);
      const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
      sclera.userData = { region };
      eyeRoot.add(sclera);
      interactiveMeshes.push(sclera);

      const irisGeo = new THREE.SphereGeometry(0.145, 20, 18);
      irisGeo.scale(1.0, 1.08, 0.32);
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(0, -0.01, 0.12);
      iris.userData = { region };
      eyeRoot.add(iris);
      interactiveMeshes.push(iris);

      const pupilGeo = new THREE.SphereGeometry(0.09, 16, 14);
      pupilGeo.scale(1.0, 1.0, 0.22);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, -0.01, 0.16);
      eyeRoot.add(pupil);

      const sparkleGeo = new THREE.SphereGeometry(0.04, 12, 10);
      const sparkle1 = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
      sparkle1.position.set(isLeft ? 0.045 : 0.04, 0.045, 0.19);
      eyeRoot.add(sparkle1);

      const sparkle2Geo = new THREE.SphereGeometry(0.02, 10, 8);
      const sparkle2 = new THREE.Mesh(sparkle2Geo, eyeSparkleMat);
      sparkle2.position.set(isLeft ? -0.035 : -0.03, -0.035, 0.19);
      eyeRoot.add(sparkle2);

      // Eyelid hemisphere: thetaStart=0..PI/2 is the +Y hemisphere.
      // At rotation.x = -PI/2 it is tucked in the back (-Z).
      // At rotation.x = +PI/2 it covers the entire front (+Z) of the eye.
      const lidGeo = new THREE.SphereGeometry(0.23, 22, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      lidGeo.scale(1.04, 1.15, 0.74);
      const eyelid = new THREE.Mesh(lidGeo, earFurMat);
      eyelid.name = isLeft ? 'LeftEyelid' : 'RightEyelid';
      eyelid.position.set(0, 0, 0.02);
      eyelid.rotation.x = -Math.PI / 2;
      eyelid.userData = { region };
      eyeRoot.add(eyelid);

      // Closed-eyelid lash line on the front rim of the eyelid
      const lashCurve = new THREE.TorusGeometry(0.16, 0.022, 10, 20, Math.PI);
      lashCurve.rotateX(Math.PI / 2);
      const lashMesh = new THREE.Mesh(lashCurve, eyebrowMat);
      lashMesh.position.set(0, 0.16, 0.04);
      eyelid.add(lashMesh);

      // Forgiving eye hit collider
      const eyeHitGeo = new THREE.SphereGeometry(0.27, 12, 10);
      const eyeHitMesh = new THREE.Mesh(eyeHitGeo, invisibleHitMat);
      eyeHitMesh.position.set(0, 0, 0.08);
      eyeHitMesh.userData = { region };
      eyeRoot.add(eyeHitMesh);
      interactiveMeshes.push(eyeHitMesh);

      return { eyeRoot, eyelid };
    };

    const leftEye = createEye(true);
    const rightEye = createEye(false);
    headGroup.add(leftEye.eyeRoot);
    headGroup.add(rightEye.eyeRoot);

    // Horizontal Eyebrows above the eyes
    const createEyebrow = (isLeft: boolean) => {
      const browGroup = new THREE.Group();
      browGroup.name = isLeft ? 'LeftEyebrow' : 'RightEyebrow';
      browGroup.position.set(isLeft ? -0.42 : 0.42, 0.48, 0.86);

      const browGeo = new THREE.CapsuleGeometry(0.038, 0.18, 8, 12);
      // CapsuleGeometry is vertical along Y by default; rotate 90 deg around Z so it is horizontal
      browGeo.rotateZ(Math.PI / 2);
      const browMesh = new THREE.Mesh(browGeo, eyebrowMat);
      browGroup.add(browMesh);
      return browGroup;
    };

    const leftEyebrow = createEyebrow(true);
    const rightEyebrow = createEyebrow(false);
    headGroup.add(leftEyebrow);
    headGroup.add(rightEyebrow);

    // Cheeks ('left-cheek', 'right-cheek')
    const createCheek = (isLeft: boolean) => {
      const cheekGroup = new THREE.Group();
      cheekGroup.name = isLeft ? 'LeftCheek' : 'RightCheek';
      cheekGroup.position.set(isLeft ? -0.68 : 0.68, -0.18, 0.68);
      cheekGroup.rotation.y = isLeft ? -0.42 : 0.42;
      const region: BodyRegion = isLeft ? 'left-cheek' : 'right-cheek';
      cheekGroup.userData = { region };

      const cheekGeo = new THREE.SphereGeometry(0.24, 20, 16);
      cheekGeo.scale(1.22, 0.78, 0.45);
      const cheekMesh = new THREE.Mesh(cheekGeo, blushMat);
      cheekMesh.userData = { region };
      cheekGroup.add(cheekMesh);
      interactiveMeshes.push(cheekMesh);

      return { cheekGroup, cheekMesh };
    };

    const leftCheek = createCheek(true);
    const rightCheek = createCheek(false);
    headGroup.add(leftCheek.cheekGroup);
    headGroup.add(rightCheek.cheekGroup);

    // Ears ('left-ear', 'right-ear') pivoted at their base on the head so drooping rotates naturally
    const createEar = (isLeft: boolean) => {
      const earPivot = new THREE.Group();
      earPivot.name = isLeft ? 'LeftEar' : 'RightEar';
      earPivot.position.set(isLeft ? -0.68 : 0.68, 0.72, 0.02);
      const region: BodyRegion = isLeft ? 'left-ear' : 'right-ear';
      earPivot.userData = { region };

      const earOffsetX = isLeft ? -0.16 : 0.16;
      const earOffsetY = 0.2;

      const outerGeo = new THREE.SphereGeometry(0.42, 24, 18);
      outerGeo.scale(1.0, 1.0, 0.52);
      const outerEar = new THREE.Mesh(outerGeo, earFurMat);
      outerEar.position.set(earOffsetX, earOffsetY, 0);
      outerEar.castShadow = true;
      outerEar.userData = { region };
      earPivot.add(outerEar);
      interactiveMeshes.push(outerEar);

      const innerGeo = new THREE.SphereGeometry(0.26, 20, 16);
      innerGeo.scale(0.92, 0.92, 0.42);
      const innerEar = new THREE.Mesh(innerGeo, creamMat);
      innerEar.position.set(earOffsetX, earOffsetY - 0.02, 0.15);
      innerEar.userData = { region };
      earPivot.add(innerEar);
      interactiveMeshes.push(innerEar);

      return earPivot;
    };

    const leftEar = createEar(true);
    const rightEar = createEar(false);
    headGroup.add(leftEar);
    headGroup.add(rightEar);

    // Arms & Hands ('left-hand', 'right-hand')
    // Note on Three.js right-handed Z rotation of a downward (-Y) limb:
    // x' = L * sin(rotZ), y' = -L * cos(rotZ).
    // For the left arm (x < 0), outward (-X) requires negative rotZ.
    // For the right arm (x > 0), outward (+X) requires positive rotZ.
    const createArm = (isLeft: boolean) => {
      const shoulderPivot = new THREE.Group();
      shoulderPivot.name = isLeft ? 'LeftShoulder' : 'RightShoulder';
      shoulderPivot.position.set(isLeft ? -0.92 : 0.92, 0.52, 0.12);
      const region: BodyRegion = isLeft ? 'left-hand' : 'right-hand';
      shoulderPivot.userData = { region };

      const armGeo = new THREE.CapsuleGeometry(0.22, 0.48, 12, 16);
      const armMesh = new THREE.Mesh(armGeo, furMat);
      armMesh.position.set(0, -0.28, 0);
      armMesh.castShadow = true;
      armMesh.userData = { region };
      shoulderPivot.add(armMesh);
      interactiveMeshes.push(armMesh);

      const handPivot = new THREE.Group();
      handPivot.name = isLeft ? 'LeftHand' : 'RightHand';
      handPivot.position.set(0, -0.62, 0.08);
      handPivot.userData = { region };
      shoulderPivot.add(handPivot);

      const pawGeo = new THREE.SphereGeometry(0.29, 20, 18);
      pawGeo.scale(1.0, 0.94, 0.92);
      const pawMesh = new THREE.Mesh(pawGeo, earFurMat);
      pawMesh.castShadow = true;
      pawMesh.userData = { region };
      handPivot.add(pawMesh);
      interactiveMeshes.push(pawMesh);

      const padGeo = new THREE.SphereGeometry(0.13, 14, 10);
      padGeo.scale(1.0, 0.85, 0.35);
      const mainPad = new THREE.Mesh(padGeo, creamMat);
      mainPad.position.set(0, -0.04, 0.25);
      mainPad.userData = { region };
      handPivot.add(mainPad);
      interactiveMeshes.push(mainPad);

      [-0.1, 0, 0.1].forEach((xOff, idx) => {
        const toeGeo = new THREE.SphereGeometry(0.048, 10, 8);
        toeGeo.scale(1.0, 0.85, 0.35);
        const toe = new THREE.Mesh(toeGeo, creamMat);
        toe.position.set(xOff, 0.12 + (idx === 1 ? 0.02 : -0.01), 0.24);
        toe.userData = { region };
        handPivot.add(toe);
        interactiveMeshes.push(toe);
      });

      return { shoulderPivot, handPivot };
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    torsoGroup.add(leftArm.shoulderPivot);
    torsoGroup.add(rightArm.shoulderPivot);

    leftArm.shoulderPivot.rotation.z = -0.42;
    rightArm.shoulderPivot.rotation.z = 0.42;
    leftArm.shoulderPivot.rotation.x = -0.15;
    rightArm.shoulderPivot.rotation.x = -0.15;

    // Legs & Feet ('left-foot', 'right-foot')
    const createLeg = (isLeft: boolean) => {
      const hipPivot = new THREE.Group();
      hipPivot.name = isLeft ? 'LeftHip' : 'RightHip';
      hipPivot.position.set(isLeft ? -0.54 : 0.54, -0.92, 0.12);
      const region: BodyRegion = isLeft ? 'left-foot' : 'right-foot';
      hipPivot.userData = { region };

      const legGeo = new THREE.CapsuleGeometry(0.25, 0.36, 12, 16);
      const legMesh = new THREE.Mesh(legGeo, furMat);
      legMesh.position.set(0, -0.2, 0);
      legMesh.castShadow = true;
      legMesh.userData = { region };
      hipPivot.add(legMesh);
      interactiveMeshes.push(legMesh);

      const footPivot = new THREE.Group();
      footPivot.name = isLeft ? 'LeftFoot' : 'RightFoot';
      footPivot.position.set(0, -0.42, 0.22);
      footPivot.userData = { region };
      hipPivot.add(footPivot);

      const footGeo = new THREE.SphereGeometry(0.34, 22, 18);
      footGeo.scale(0.96, 0.72, 1.28);
      const footMesh = new THREE.Mesh(footGeo, earFurMat);
      footMesh.castShadow = true;
      footMesh.userData = { region };
      footPivot.add(footMesh);
      interactiveMeshes.push(footMesh);

      const footPadGeo = new THREE.SphereGeometry(0.16, 14, 12);
      footPadGeo.scale(1.05, 0.78, 0.45);
      const footPad = new THREE.Mesh(footPadGeo, creamMat);
      footPad.position.set(0, -0.02, 0.39);
      footPad.userData = { region };
      footPivot.add(footPad);
      interactiveMeshes.push(footPad);

      [-0.11, 0, 0.11].forEach((xOff, idx) => {
        const toeGeo = new THREE.SphereGeometry(0.052, 10, 8);
        toeGeo.scale(1.0, 0.85, 0.4);
        const toe = new THREE.Mesh(toeGeo, creamMat);
        toe.position.set(xOff, 0.13 + (idx === 1 ? 0.02 : -0.01), 0.36);
        toe.userData = { region };
        footPivot.add(toe);
        interactiveMeshes.push(toe);
      });

      return { hipPivot, footPivot };
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    pelvis.add(leftLeg.hipPivot);
    pelvis.add(rightLeg.hipPivot);

    // 5. Load /models/cute_simple_bear_3d_model__rigging.glb and integrate into the 3D scene
    let gltfMixer: THREE.AnimationMixer | null = null;
    loadBearGlbOnce()
      .then((gltf) => {
        if (isDisposed) return;

        let firstMesh: THREE.Mesh | null = null;
        gltf.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh && !firstMesh) {
            firstMesh = obj as THREE.Mesh;
          }
        });

        if (gltf.animations && gltf.animations.length > 0) {
          gltfMixer = new THREE.AnimationMixer(gltf.scene);
          const idleClip = gltf.animations[0];
          const action = gltfMixer.clipAction(idleClip);
          action.play();
        }

        // Integrate the loaded GLB mesh ("Quad Sphere", radius 1.284..1.513) into the bear's Head group
        if (firstMesh) {
          const glbMesh = (firstMesh as THREE.Mesh).clone();
          glbMesh.name = 'GLB_QuadSphere_Head';
          glbMesh.material = furMat;
          glbMesh.castShadow = true;
          glbMesh.receiveShadow = true;
          // Orient so the smooth sculpted hemisphere faces +Z and fits cleanly within the head contour
          glbMesh.rotation.set(0, Math.PI, 0);
          glbMesh.scale.set(0.62, 0.6, 0.58);
          glbMesh.userData = { region: 'head' };

          headGroup.add(glbMesh);
          interactiveMeshes.push(glbMesh);
        }

        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (isDisposed) return;
        const msg = err instanceof Error ? err.message : 'Failed to load GLB model';
        console.warn('[AG-Debug] GLB load warning:', msg);
        setLoadError(msg);
        setIsLoading(false);
      });

    // 6. Pointer & Touch Raycasting Event Listeners
    const onCanvasPointerDown = (e: MouseEvent) => {
      handlePointerDown(e, renderer, camera, interactiveMeshes);
    };

    const onCanvasTouchStart = (e: TouchEvent) => {
      handlePointerDown(e, renderer, camera, interactiveMeshes);
    };

    const onCanvasPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onCanvasPointerDown);
    domElement.addEventListener('touchstart', onCanvasTouchStart, { passive: true });
    domElement.addEventListener('mousemove', onCanvasPointerMove);

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 420;
      const newH = container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 8. 60 FPS Articulated Animation Loop
    let reqId = 0;
    const clock = new THREE.Clock();
    let animStartTime = 0;
    let lastAnimState: AnimationState = 'idle';

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (gltfMixer) {
        gltfMixer.update(delta);
      }

      const currentAnim = animationStateRef.current;
      const isSpeakingVal = isSpeakingRef.current;
      const mouthVal = mouthShapeRef.current;

      if (currentAnim !== lastAnimState) {
        lastAnimState = currentAnim;
        animStartTime = time;
      }
      const animTime = time - animStartTime;

      const motionScale = prefersReducedMotion ? 0.25 : 1.0;

      // Default Idle Pose Values
      const targetTorsoScaleY = 1.0 + Math.sin(time * 2.2) * 0.016 * motionScale;
      const targetTorsoScaleXZ = 1.0 - Math.sin(time * 2.2) * 0.008 * motionScale;
      let targetHeadPosY = Math.sin(time * 2.2 - 0.3) * 0.015 * motionScale;
      let targetHeadRotX = 0;
      let targetHeadRotY = 0;
      let targetHeadRotZ = 0;
      let targetHeadPosZ = 0;

      // Arms angle outward: negative rotZ for left arm, positive rotZ for right arm
      let targetLeftArmRotZ = -0.42 - Math.sin(time * 2.2) * 0.03 * motionScale;
      let targetLeftArmRotX = -0.15;
      let targetLeftArmRotY = 0;

      let targetRightArmRotZ = 0.42 + Math.sin(time * 2.2) * 0.03 * motionScale;
      let targetRightArmRotX = -0.15;
      let targetRightArmRotY = 0;

      let targetLeftLegRotX = 0;
      let targetLeftLegPosY = -0.92;
      let targetLeftFootRotX = 0;

      let targetRightLegRotX = 0;
      let targetRightLegPosY = -0.92;
      let targetRightFootRotX = 0;

      let targetPelvisRotZ = 0;
      let targetPelvisPosY = -0.36;

      let targetLeftEarRotZ = Math.sin(time * 1.5) * 0.03 * motionScale;
      let targetRightEarRotZ = -Math.sin(time * 1.5) * 0.03 * motionScale;
      let targetLeftEarPosY = 0.72;
      let targetRightEarPosY = 0.72;

      let targetLeftBrowPosY = 0.48;
      let targetRightBrowPosY = 0.48;
      let targetLeftBrowRotZ = 0.1;
      let targetRightBrowRotZ = -0.1;

      // Eyelids: -PI/2 is fully open (tucked in back), +PI/2 is fully closed (covering front of eye)
      let targetLeftBlink = -Math.PI / 2;
      let targetRightBlink = -Math.PI / 2;

      let targetBellyScale = 1.0;
      let targetCheekScale = 1.0;
      let targetNosePosX = 0;

      let targetMouthScaleY = 0.32;
      let targetMouthScaleX = 1.0;
      let targetSmileScaleY = 1.0;

      // Natural Idle Blink (~every 4.0s)
      if (!prefersReducedMotion && currentAnim === 'idle') {
        const blinkCycle = time % 4.0;
        if (blinkCycle > 3.6 && blinkCycle < 3.78) {
          targetLeftBlink = Math.PI / 2;
          targetRightBlink = Math.PI / 2;
        }
      }

      // 9. Body-Part Reaction State Machine
      switch (currentAnim) {
        case 'leftHandWave':
        case 'wave-left':
        case 'waveLeft':
        case 'wave':
          // Negative rotZ raises left arm high outward on the left side
          targetLeftArmRotZ = -2.38 + Math.sin(animTime * 11) * 0.34 * motionScale;
          targetLeftArmRotX = -0.25;
          targetLeftArmRotY = 0.2;
          targetHeadRotY = -0.22 * motionScale;
          targetHeadRotZ = 0.1 * motionScale;
          targetMouthScaleY = 0.85;
          targetCheekScale = 1.25;
          break;

        case 'rightHandWave':
        case 'wave-right':
        case 'waveRight':
          // Positive rotZ raises right arm high outward on the right side
          targetRightArmRotZ = 2.38 - Math.sin(animTime * 11) * 0.34 * motionScale;
          targetRightArmRotX = -0.25;
          targetRightArmRotY = -0.2;
          targetHeadRotY = 0.22 * motionScale;
          targetHeadRotZ = -0.1 * motionScale;
          targetMouthScaleY = 0.85;
          targetCheekScale = 1.25;
          break;

        case 'leftFootTap':
        case 'foot-tap-left':
        case 'tapFeet': {
          const tapWave = Math.abs(Math.sin(animTime * 8.5));
          targetLeftLegRotX = (-0.52 - tapWave * 0.25) * motionScale;
          targetLeftLegPosY = -0.74 + tapWave * 0.2 * motionScale;
          targetLeftFootRotX = (0.35 - tapWave * 0.5) * motionScale;
          targetPelvisRotZ = -0.07 * motionScale;
          targetPelvisPosY = -0.36 + tapWave * 0.05 * motionScale;
          targetHeadRotX = 0.14 * motionScale;
          targetMouthScaleY = 0.78;
          break;
        }

        case 'rightFootTap':
        case 'foot-tap-right': {
          const tapWave = Math.abs(Math.sin(animTime * 8.5));
          targetRightLegRotX = (-0.52 - tapWave * 0.25) * motionScale;
          targetRightLegPosY = -0.74 + tapWave * 0.2 * motionScale;
          targetRightFootRotX = (0.35 - tapWave * 0.5) * motionScale;
          targetPelvisRotZ = 0.07 * motionScale;
          targetPelvisPosY = -0.36 + tapWave * 0.05 * motionScale;
          targetHeadRotX = 0.14 * motionScale;
          targetMouthScaleY = 0.78;
          break;
        }

        case 'tummyHappy':
        case 'tummy-love':
        case 'tummy-giggle':
        case 'tummy-laugh':
        case 'happy':
          targetHeadRotX = 0.16 * motionScale;
          targetHeadPosY = -0.04 + Math.abs(Math.sin(animTime * 7)) * 0.06 * motionScale;
          targetLeftArmRotZ = -0.85 - Math.sin(animTime * 7) * 0.12 * motionScale;
          targetLeftArmRotX = -0.35;
          targetRightArmRotZ = 0.85 + Math.sin(animTime * 7) * 0.12 * motionScale;
          targetRightArmRotX = -0.35;
          targetBellyScale = 1.12 + Math.sin(animTime * 7) * 0.07 * motionScale;
          targetPelvisRotZ = Math.sin(animTime * 4.5) * 0.07 * motionScale;
          targetPelvisPosY = -0.36 + Math.abs(Math.sin(animTime * 7)) * 0.05 * motionScale;
          targetCheekScale = 1.38;
          targetMouthScaleY = 0.95;
          targetLeftBrowPosY = 0.52;
          targetRightBrowPosY = 0.52;
          break;

        case 'leftCheekSmile':
        case 'cheek-smile-left':
          targetHeadRotZ = 0.2 * motionScale;
          targetHeadRotY = -0.18 * motionScale;
          targetCheekScale = 1.45;
          targetMouthScaleY = 0.95;
          targetSmileScaleY = 1.25;
          targetLeftBrowPosY = 0.52;
          targetRightBrowPosY = 0.52;
          break;

        case 'rightCheekSmile':
        case 'cheek-smile-right':
        case 'cheek-gentle':
          targetHeadRotZ = -0.2 * motionScale;
          targetHeadRotY = 0.18 * motionScale;
          targetCheekScale = 1.45;
          targetMouthScaleY = 0.95;
          targetSmileScaleY = 1.25;
          targetLeftBrowPosY = 0.52;
          targetRightBrowPosY = 0.52;
          break;

        case 'leftEyeReaction':
        case 'eye-blink-left':
        case 'blinkLeft':
        case 'eye-hurt':
          // Close left eyelid completely (+PI/2) and tilt eyebrows gently
          targetLeftBlink = Math.PI / 2;
          targetHeadPosZ = -0.16 * motionScale;
          targetHeadRotY = 0.14 * motionScale;
          targetHeadRotZ = -0.08 * motionScale;
          targetLeftBrowPosY = 0.44;
          targetRightBrowPosY = 0.51;
          targetLeftBrowRotZ = -0.26;
          targetRightBrowRotZ = 0.22;
          targetMouthScaleX = 0.78;
          targetMouthScaleY = 0.95;
          break;

        case 'rightEyeReaction':
        case 'eye-blink-right':
        case 'blinkRight':
          // Close right eyelid completely (+PI/2) and tilt eyebrows gently
          targetRightBlink = Math.PI / 2;
          targetHeadPosZ = -0.16 * motionScale;
          targetHeadRotY = -0.14 * motionScale;
          targetHeadRotZ = 0.08 * motionScale;
          targetLeftBrowPosY = 0.51;
          targetRightBrowPosY = 0.44;
          targetLeftBrowRotZ = -0.22;
          targetRightBrowRotZ = 0.26;
          targetMouthScaleX = 0.78;
          targetMouthScaleY = 0.95;
          break;

        case 'leftEarGloomy':
        case 'ear-surprise-left':
        case 'ear-sensitive':
          // Droop left ear outward/downward and show cautious expression
          targetLeftEarRotZ = 0.82 * motionScale;
          targetLeftEarPosY = 0.56;
          targetHeadRotZ = -0.18 * motionScale;
          targetHeadRotY = 0.14 * motionScale;
          targetLeftBrowPosY = 0.45;
          targetRightBrowPosY = 0.45;
          targetLeftBrowRotZ = -0.25;
          targetRightBrowRotZ = 0.25;
          targetMouthScaleY = 0.4;
          break;

        case 'rightEarGloomy':
        case 'ear-surprise-right':
          // Droop right ear outward/downward and show cautious expression
          targetRightEarRotZ = -0.82 * motionScale;
          targetRightEarPosY = 0.56;
          targetHeadRotZ = 0.18 * motionScale;
          targetHeadRotY = -0.14 * motionScale;
          targetLeftBrowPosY = 0.45;
          targetRightBrowPosY = 0.45;
          targetLeftBrowRotZ = -0.25;
          targetRightBrowRotZ = 0.25;
          targetMouthScaleY = 0.4;
          break;

        case 'closedEyes':
        case 'calm-breath':
          targetLeftBlink = Math.PI / 2;
          targetRightBlink = Math.PI / 2;
          targetHeadRotX = 0.08 * motionScale;
          targetMouthScaleY = 0.35;
          break;

        case 'mouthShock':
        case 'mouth-surprise':
        case 'shocked':
          // Surprised open-mouth "O" expression
          targetMouthScaleX = 0.82;
          targetMouthScaleY = 1.65;
          targetSmileScaleY = 0.35;
          targetHeadPosZ = -0.16 * motionScale;
          targetHeadRotX = -0.1 * motionScale;
          targetLeftBrowPosY = 0.56;
          targetRightBrowPosY = 0.56;
          targetLeftBrowRotZ = 0.04;
          targetRightBrowRotZ = -0.04;
          break;

        case 'nose-boop':
        case 'nose-wiggle':
          // Playful head recoil and nose wiggle
          targetNosePosX = Math.sin(animTime * 28) * 0.06 * motionScale;
          targetHeadPosZ = -0.26 * motionScale;
          targetHeadRotX = -0.2 * motionScale;
          targetHeadPosY = 0.06 * motionScale;
          targetMouthScaleY = 0.88;
          targetLeftBrowPosY = 0.54;
          targetRightBrowPosY = 0.54;
          if (animTime < 0.25) {
            targetLeftBlink = Math.PI / 2;
            targetRightBlink = Math.PI / 2;
          }
          break;

        case 'head-tilt':
          targetHeadRotZ = 0.24 * motionScale;
          targetHeadRotY = -0.12 * motionScale;
          targetLeftEarRotZ = 0.14 * motionScale;
          targetRightEarRotZ = -0.1 * motionScale;
          targetMouthScaleY = 0.85;
          break;

        default:
          break;
      }

      // 10. Real-time Lip Sync while speaking
      if (isSpeakingVal) {
        const speechViseme = Math.abs(Math.sin(time * 15)) * 0.65 + 0.35;
        targetMouthScaleY = Math.max(targetMouthScaleY, speechViseme * 1.25);
      } else if (mouthVal === 'surprise-o') {
        targetMouthScaleX = 0.82;
        targetMouthScaleY = 1.55;
      } else if (mouthVal === 'smile') {
        targetMouthScaleY = 0.85;
      }

      // 11. Smooth Spring-Like Interpolation Between Idle and Reactions
      const lerpSpeed = Math.min(delta * 10.0, 0.42);

      torsoMesh.scale.y = THREE.MathUtils.lerp(torsoMesh.scale.y, targetTorsoScaleY, lerpSpeed);
      torsoMesh.scale.x = THREE.MathUtils.lerp(torsoMesh.scale.x, targetTorsoScaleXZ, lerpSpeed);
      torsoMesh.scale.z = THREE.MathUtils.lerp(torsoMesh.scale.z, targetTorsoScaleXZ, lerpSpeed);

      headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, targetHeadPosY, lerpSpeed);
      headGroup.position.z = THREE.MathUtils.lerp(headGroup.position.z, targetHeadPosZ, lerpSpeed);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, lerpSpeed);
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, lerpSpeed);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, targetHeadRotZ, lerpSpeed);

      leftArm.shoulderPivot.rotation.z = THREE.MathUtils.lerp(
        leftArm.shoulderPivot.rotation.z,
        targetLeftArmRotZ,
        lerpSpeed
      );
      leftArm.shoulderPivot.rotation.x = THREE.MathUtils.lerp(
        leftArm.shoulderPivot.rotation.x,
        targetLeftArmRotX,
        lerpSpeed
      );
      leftArm.shoulderPivot.rotation.y = THREE.MathUtils.lerp(
        leftArm.shoulderPivot.rotation.y,
        targetLeftArmRotY,
        lerpSpeed
      );

      rightArm.shoulderPivot.rotation.z = THREE.MathUtils.lerp(
        rightArm.shoulderPivot.rotation.z,
        targetRightArmRotZ,
        lerpSpeed
      );
      rightArm.shoulderPivot.rotation.x = THREE.MathUtils.lerp(
        rightArm.shoulderPivot.rotation.x,
        targetRightArmRotX,
        lerpSpeed
      );
      rightArm.shoulderPivot.rotation.y = THREE.MathUtils.lerp(
        rightArm.shoulderPivot.rotation.y,
        targetRightArmRotY,
        lerpSpeed
      );

      leftLeg.hipPivot.rotation.x = THREE.MathUtils.lerp(
        leftLeg.hipPivot.rotation.x,
        targetLeftLegRotX,
        lerpSpeed
      );
      leftLeg.hipPivot.position.y = THREE.MathUtils.lerp(
        leftLeg.hipPivot.position.y,
        targetLeftLegPosY,
        lerpSpeed
      );
      leftLeg.footPivot.rotation.x = THREE.MathUtils.lerp(
        leftLeg.footPivot.rotation.x,
        targetLeftFootRotX,
        lerpSpeed
      );

      rightLeg.hipPivot.rotation.x = THREE.MathUtils.lerp(
        rightLeg.hipPivot.rotation.x,
        targetRightLegRotX,
        lerpSpeed
      );
      rightLeg.hipPivot.position.y = THREE.MathUtils.lerp(
        rightLeg.hipPivot.position.y,
        targetRightLegPosY,
        lerpSpeed
      );
      rightLeg.footPivot.rotation.x = THREE.MathUtils.lerp(
        rightLeg.footPivot.rotation.x,
        targetRightFootRotX,
        lerpSpeed
      );

      pelvis.rotation.z = THREE.MathUtils.lerp(pelvis.rotation.z, targetPelvisRotZ, lerpSpeed);
      pelvis.position.y = THREE.MathUtils.lerp(pelvis.position.y, targetPelvisPosY, lerpSpeed);

      leftEar.rotation.z = THREE.MathUtils.lerp(leftEar.rotation.z, targetLeftEarRotZ, lerpSpeed);
      leftEar.position.y = THREE.MathUtils.lerp(leftEar.position.y, targetLeftEarPosY, lerpSpeed);
      rightEar.rotation.z = THREE.MathUtils.lerp(
        rightEar.rotation.z,
        targetRightEarRotZ,
        lerpSpeed
      );
      rightEar.position.y = THREE.MathUtils.lerp(
        rightEar.position.y,
        targetRightEarPosY,
        lerpSpeed
      );

      leftEyebrow.position.y = THREE.MathUtils.lerp(
        leftEyebrow.position.y,
        targetLeftBrowPosY,
        lerpSpeed
      );
      rightEyebrow.position.y = THREE.MathUtils.lerp(
        rightEyebrow.position.y,
        targetRightBrowPosY,
        lerpSpeed
      );
      leftEyebrow.rotation.z = THREE.MathUtils.lerp(
        leftEyebrow.rotation.z,
        targetLeftBrowRotZ,
        lerpSpeed
      );
      rightEyebrow.rotation.z = THREE.MathUtils.lerp(
        rightEyebrow.rotation.z,
        targetRightBrowRotZ,
        lerpSpeed
      );

      leftEye.eyelid.rotation.x = THREE.MathUtils.lerp(
        leftEye.eyelid.rotation.x,
        targetLeftBlink,
        lerpSpeed * 2.0
      );
      rightEye.eyelid.rotation.x = THREE.MathUtils.lerp(
        rightEye.eyelid.rotation.x,
        targetRightBlink,
        lerpSpeed * 2.0
      );

      stomachGroup.scale.set(targetBellyScale, targetBellyScale, targetBellyScale);
      leftCheek.cheekGroup.scale.set(targetCheekScale, targetCheekScale, targetCheekScale);
      rightCheek.cheekGroup.scale.set(targetCheekScale, targetCheekScale, targetCheekScale);

      noseMesh.position.x = THREE.MathUtils.lerp(
        noseMesh.position.x,
        targetNosePosX,
        lerpSpeed * 2.2
      );

      mouthCavityMesh.scale.x = THREE.MathUtils.lerp(
        mouthCavityMesh.scale.x,
        targetMouthScaleX,
        lerpSpeed * 1.5
      );
      mouthCavityMesh.scale.y = THREE.MathUtils.lerp(
        mouthCavityMesh.scale.y,
        targetMouthScaleY,
        lerpSpeed * 1.5
      );
      smileMesh.scale.y = THREE.MathUtils.lerp(
        smileMesh.scale.y,
        targetSmileScaleY,
        lerpSpeed * 1.5
      );

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onCanvasPointerDown);
      domElement.removeEventListener('touchstart', onCanvasTouchStart);
      domElement.removeEventListener('mousemove', onCanvasPointerMove);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [handlePointerDown]);

  return (
    <div className="w-full h-full relative touch-none select-none flex items-center justify-center">
      <div
        ref={mountRef}
        className="w-full h-full relative touch-none select-none flex items-center justify-center"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading Indicator while the GLB model loads */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-amber-50/40 backdrop-blur-[2px] pointer-events-none"
        >
          <div className="w-10 h-10 rounded-full border-4 border-[#E9B44C] border-t-transparent animate-spin mb-2" />
          <span className="text-xs sm:text-sm font-extrabold text-[#593A2A] bg-white/90 px-3 py-1 rounded-full shadow-xs">
            Loading 3D Bear...
          </span>
        </div>
      )}

      {/* Non-intrusive warning badge if GLB fetch ever fails */}
      {loadError && (
        <div
          role="alert"
          className="
            absolute top-2 right-2 z-30 text-[11px] font-bold
            text-amber-900 bg-amber-100/90 border border-amber-300
            px-2.5 py-0.5 rounded-full pointer-events-none
          "
        >
          Using built-in 3D rig
        </div>
      )}
    </div>
  );
};
