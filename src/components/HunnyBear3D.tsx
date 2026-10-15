import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import type { BodyRegion, AnimationState, MouthShape } from '../types/game';

interface HunnyBear3DProps {
  animationState: AnimationState;
  mouthShape: MouthShape;
  isSpeaking: boolean;
  onTapRegion: (region: BodyRegion) => void;
}

export const HunnyBear3D: React.FC<HunnyBear3DProps> = ({
  animationState,
  mouthShape,
  isSpeaking,
  onTapRegion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const animationStateRef = useRef<AnimationState>(animationState);
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const mouthShapeRef = useRef<MouthShape>(mouthShape);
  const onTapRegionRef = useRef<(region: BodyRegion) => void>(onTapRegion);

  // Keep refs synchronized without recreating the 3D scene
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

  const handlePointerDown = useCallback((
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
    if (intersects.length > 0) {
      // Find the first intersected object with a region tag in userData
      for (const hit of intersects) {
        let currentObj: THREE.Object3D | null = hit.object;
        while (currentObj) {
          if (currentObj.userData && currentObj.userData.region) {
            const region = currentObj.userData.region as BodyRegion;
            onTapRegionRef.current(region);
            return;
          }
          currentObj = currentObj.parent;
        }
      }
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = null; // transparent background to blend seamlessly with theme

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    // 2. Beautiful Child-Friendly Lighting
    const ambientLight = new THREE.AmbientLight(0xFFF7EC, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFF2D6, 1.3);
    keyLight.position.set(3, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xCDE8F6, 0.6);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xFCE198, 1.1);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // 3. Materials
    // Soft honey-gold fur
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xE8AC3E,
      roughness: 0.76,
      metalness: 0.04,
    });

    // Warm cream muzzle, belly, inner ear, paw pads
    const creamMat = new THREE.MeshStandardMaterial({
      color: 0xFFF5E4,
      roughness: 0.68,
      metalness: 0.02,
    });

    // Dark chocolate glossy nose
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x3D2012,
      roughness: 0.28,
      metalness: 0.12,
    });

    // Eye Materials
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.18,
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x361E10,
      roughness: 0.25,
    });

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x110804 });
    const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    // Rosy cheek blush
    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xF69A8E,
      roughness: 0.85,
      transparent: true,
      opacity: 0.65,
    });

    // Soft mouth interior
    const mouthInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x8C2C28,
      roughness: 0.45,
    });

    // Eyebrows
    const eyebrowMat = new THREE.MeshStandardMaterial({
      color: 0x4A2C18,
      roughness: 0.6,
    });

    // 4. Build Rigged Articulated Hierarchy
    const interactiveMeshes: THREE.Object3D[] = [];

    // Root Group
    const bearRoot = new THREE.Group();
    bearRoot.position.set(0, -0.2, 0);
    scene.add(bearRoot);

    // Soft Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x593A2A,
      transparent: true,
      opacity: 0.18,
    });
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.set(0, -1.95, 0);
    scene.add(groundShadow);

    // Pelvis & Torso
    const pelvis = new THREE.Group();
    pelvis.position.set(0, -0.4, 0);
    bearRoot.add(pelvis);

    const torsoGroup = new THREE.Group();
    pelvis.add(torsoGroup);

    // Chubby cuddly egg-shaped torso
    const torsoGeo = new THREE.SphereGeometry(1.15, 32, 28);
    torsoGeo.scale(1.0, 1.25, 0.95);
    const torsoMesh = new THREE.Mesh(torsoGeo, furMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    // Stomach / Tummy Region (Interactive)
    const stomachGroup = new THREE.Group();
    stomachGroup.position.set(0, -0.05, 0.72);
    stomachGroup.userData = { region: 'stomach' };
    torsoGroup.add(stomachGroup);

    const bellyPatchGeo = new THREE.SphereGeometry(0.82, 32, 24);
    bellyPatchGeo.scale(0.96, 1.15, 0.42);
    const bellyPatchMesh = new THREE.Mesh(bellyPatchGeo, creamMat);
    bellyPatchMesh.userData = { region: 'stomach' };
    stomachGroup.add(bellyPatchMesh);
    interactiveMeshes.push(bellyPatchMesh);

    // Head Pivot Group
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.45, 0.05);
    torsoGroup.add(headPivot);

    const headGroup = new THREE.Group();
    headPivot.add(headGroup);

    // Round head mesh (Interactive: 'head')
    const headGeo = new THREE.SphereGeometry(1.18, 32, 32);
    headGeo.scale(1.08, 1.0, 1.04);
    const headMesh = new THREE.Mesh(headGeo, furMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headMesh.userData = { region: 'head' };
    headGroup.add(headMesh);
    interactiveMeshes.push(headMesh);

    // Cream Muzzle
    const muzzleGroup = new THREE.Group();
    muzzleGroup.position.set(0, -0.22, 0.88);
    headGroup.add(muzzleGroup);

    const muzzleGeo = new THREE.SphereGeometry(0.56, 32, 24);
    muzzleGeo.scale(1.18, 0.82, 0.88);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, creamMat);
    muzzleMesh.castShadow = true;
    muzzleGroup.add(muzzleMesh);

    // Nose (Interactive: 'nose')
    const noseGeo = new THREE.SphereGeometry(0.18, 24, 20);
    noseGeo.scale(1.2, 0.85, 1.0);
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, 0.18, 0.52);
    noseMesh.userData = { region: 'nose' };
    muzzleGroup.add(noseMesh);
    interactiveMeshes.push(noseMesh);

    // Mouth Structure (Interactive: 'mouth')
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.16, 0.52);
    mouthGroup.userData = { region: 'mouth' };
    muzzleGroup.add(mouthGroup);

    // Upper smile curve
    const smileCurve = new THREE.TorusGeometry(0.19, 0.032, 16, 32, Math.PI);
    smileCurve.rotateZ(Math.PI);
    const smileMesh = new THREE.Mesh(smileCurve, noseMat);
    mouthGroup.add(smileMesh);

    // Openable mouth cavity for speech visemes & surprises
    const mouthCavityGeo = new THREE.SphereGeometry(0.17, 24, 18);
    mouthCavityGeo.scale(1.0, 0.7, 0.6);
    const mouthCavityMesh = new THREE.Mesh(mouthCavityGeo, mouthInteriorMat);
    mouthCavityMesh.position.set(0, -0.06, -0.02);
    mouthCavityMesh.userData = { region: 'mouth' };
    mouthGroup.add(mouthCavityMesh);
    interactiveMeshes.push(mouthCavityMesh);

    // Helper to create an eye
    const createEye = (isLeft: boolean) => {
      const eyeRoot = new THREE.Group();
      eyeRoot.position.set(isLeft ? -0.46 : 0.46, 0.16, 0.95);
      const region: BodyRegion = isLeft ? 'left-eye' : 'right-eye';
      eyeRoot.userData = { region };

      // Sclera (White)
      const scleraGeo = new THREE.SphereGeometry(0.24, 24, 20);
      scleraGeo.scale(1.0, 1.12, 0.65);
      const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
      sclera.userData = { region };
      eyeRoot.add(sclera);
      interactiveMeshes.push(sclera);

      // Iris
      const irisGeo = new THREE.SphereGeometry(0.16, 24, 20);
      irisGeo.scale(1.0, 1.08, 0.3);
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(0, -0.02, 0.14);
      iris.userData = { region };
      eyeRoot.add(iris);
      interactiveMeshes.push(iris);

      // Pupil
      const pupilGeo = new THREE.SphereGeometry(0.1, 20, 16);
      pupilGeo.scale(1.0, 1.0, 0.2);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, -0.02, 0.18);
      eyeRoot.add(pupil);

      // Sparkle Highlights (Large & Small)
      const sparkleGeo = new THREE.SphereGeometry(0.045, 16, 12);
      const sparkle1 = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
      sparkle1.position.set(isLeft ? 0.05 : 0.04, 0.05, 0.22);
      eyeRoot.add(sparkle1);

      const sparkle2Geo = new THREE.SphereGeometry(0.022, 12, 10);
      const sparkle2 = new THREE.Mesh(sparkle2Geo, eyeSparkleMat);
      sparkle2.position.set(isLeft ? -0.04 : -0.03, -0.04, 0.22);
      eyeRoot.add(sparkle2);

      // Movable Eyelid for Blinking
      const lidGeo = new THREE.SphereGeometry(0.27, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      lidGeo.scale(1.02, 1.15, 0.7);
      const eyelid = new THREE.Mesh(lidGeo, furMat);
      eyelid.position.set(0, 0, 0.01);
      eyelid.rotation.x = -Math.PI / 2; // fully open by default
      eyeRoot.add(eyelid);

      return { eyeRoot, eyelid };
    };

    const leftEye = createEye(true);
    const rightEye = createEye(false);
    headGroup.add(leftEye.eyeRoot);
    headGroup.add(rightEye.eyeRoot);

    // Eyebrows
    const createEyebrow = (isLeft: boolean) => {
      const browGroup = new THREE.Group();
      browGroup.position.set(isLeft ? -0.46 : 0.46, 0.52, 0.98);

      const browGeo = new THREE.CapsuleGeometry(0.045, 0.22, 8, 16);
      browGeo.rotateZ(isLeft ? -0.2 : 0.2);
      const browMesh = new THREE.Mesh(browGeo, eyebrowMat);
      browGroup.add(browMesh);
      return browGroup;
    };

    const leftEyebrow = createEyebrow(true);
    const rightEyebrow = createEyebrow(false);
    headGroup.add(leftEyebrow);
    headGroup.add(rightEyebrow);

    // Rosy Cheeks (Interactive: 'left-cheek', 'right-cheek')
    const createCheek = (isLeft: boolean) => {
      const cheekGroup = new THREE.Group();
      cheekGroup.position.set(isLeft ? -0.74 : 0.74, -0.22, 0.74);
      const region: BodyRegion = isLeft ? 'left-cheek' : 'right-cheek';
      cheekGroup.userData = { region };

      const cheekGeo = new THREE.SphereGeometry(0.26, 24, 18);
      cheekGeo.scale(1.2, 0.75, 0.5);
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

    // Ears (Interactive: 'left-ear', 'right-ear')
    const createEar = (isLeft: boolean) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(isLeft ? -0.92 : 0.92, 0.96, 0.05);
      const region: BodyRegion = isLeft ? 'left-ear' : 'right-ear';
      earPivot.userData = { region };

      // Outer golden ear
      const outerGeo = new THREE.SphereGeometry(0.46, 28, 20);
      outerGeo.scale(1.0, 1.0, 0.55);
      const outerEar = new THREE.Mesh(outerGeo, furMat);
      outerEar.userData = { region };
      earPivot.add(outerEar);
      interactiveMeshes.push(outerEar);

      // Inner cream/pink ear
      const innerGeo = new THREE.SphereGeometry(0.3, 24, 18);
      innerGeo.scale(0.9, 0.9, 0.45);
      const innerEar = new THREE.Mesh(innerGeo, creamMat);
      innerEar.position.set(0, 0, 0.16);
      innerEar.userData = { region };
      earPivot.add(innerEar);
      interactiveMeshes.push(innerEar);

      return earPivot;
    };

    const leftEar = createEar(true);
    const rightEar = createEar(false);
    headGroup.add(leftEar);
    headGroup.add(rightEar);

    // Arms & Hands (Interactive: 'left-hand', 'right-hand')
    const createArm = (isLeft: boolean) => {
      const shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(isLeft ? -1.18 : 1.18, 0.72, 0.05);
      const region: BodyRegion = isLeft ? 'left-hand' : 'right-hand';

      // Upper arm
      const armGeo = new THREE.CapsuleGeometry(0.24, 0.55, 12, 20);
      const armMesh = new THREE.Mesh(armGeo, furMat);
      armMesh.position.set(0, -0.32, 0);
      armMesh.rotation.z = isLeft ? 0.25 : -0.25;
      armMesh.castShadow = true;
      shoulderPivot.add(armMesh);

      // Forearm & Hand Paw
      const handPivot = new THREE.Group();
      handPivot.position.set(isLeft ? -0.08 : 0.08, -0.68, 0.05);
      handPivot.userData = { region };
      shoulderPivot.add(handPivot);

      const pawGeo = new THREE.SphereGeometry(0.32, 24, 20);
      pawGeo.scale(1.0, 0.9, 0.95);
      const pawMesh = new THREE.Mesh(pawGeo, furMat);
      pawMesh.castShadow = true;
      pawMesh.userData = { region };
      handPivot.add(pawMesh);
      interactiveMeshes.push(pawMesh);

      // Heart / Main pad on palm
      const padGeo = new THREE.SphereGeometry(0.12, 16, 12);
      padGeo.scale(1.0, 0.8, 0.3);
      const mainPad = new THREE.Mesh(padGeo, creamMat);
      mainPad.position.set(0, -0.06, 0.28);
      mainPad.userData = { region };
      handPivot.add(mainPad);
      interactiveMeshes.push(mainPad);

      // Small toe pads
      [-0.1, 0, 0.1].forEach((xOff, idx) => {
        const toeGeo = new THREE.SphereGeometry(0.045, 12, 10);
        toeGeo.scale(1.0, 0.8, 0.3);
        const toe = new THREE.Mesh(toeGeo, creamMat);
        toe.position.set(xOff, 0.12 - (idx === 1 ? -0.02 : 0.02), 0.27);
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

    // Default arm resting angles
    leftArm.shoulderPivot.rotation.z = 0.32;
    rightArm.shoulderPivot.rotation.z = -0.32;

    // Legs & Feet (Interactive: 'left-foot', 'right-foot')
    const createLeg = (isLeft: boolean) => {
      const hipPivot = new THREE.Group();
      hipPivot.position.set(isLeft ? -0.68 : 0.68, -1.05, 0.1);
      const region: BodyRegion = isLeft ? 'left-foot' : 'right-foot';

      // Leg
      const legGeo = new THREE.CapsuleGeometry(0.28, 0.42, 12, 20);
      const legMesh = new THREE.Mesh(legGeo, furMat);
      legMesh.position.set(0, -0.22, 0);
      legMesh.castShadow = true;
      hipPivot.add(legMesh);

      // Foot (cuddly oval angled forward)
      const footPivot = new THREE.Group();
      footPivot.position.set(0, -0.45, 0.24);
      footPivot.userData = { region };
      hipPivot.add(footPivot);

      const footGeo = new THREE.SphereGeometry(0.38, 24, 20);
      footGeo.scale(0.9, 0.68, 1.35);
      const footMesh = new THREE.Mesh(footGeo, furMat);
      footMesh.castShadow = true;
      footMesh.userData = { region };
      footPivot.add(footMesh);
      interactiveMeshes.push(footMesh);

      // Foot bottom paw pad
      const footPadGeo = new THREE.SphereGeometry(0.18, 16, 14);
      footPadGeo.scale(1.1, 0.4, 1.1);
      const footPad = new THREE.Mesh(footPadGeo, creamMat);
      footPad.position.set(0, 0.18, 0.05);
      footPad.userData = { region };
      footPivot.add(footPad);
      interactiveMeshes.push(footPad);

      return { hipPivot, footPivot };
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    pelvis.add(leftLeg.hipPivot);
    pelvis.add(rightLeg.hipPivot);

    // 5. Pointer and Touch Event Listeners for Raycasting
    const onCanvasPointerDown = (e: MouseEvent) => {
      handlePointerDown(e, renderer, camera, interactiveMeshes);
    };

    const onCanvasTouchStart = (e: TouchEvent) => {
      handlePointerDown(e, renderer, camera, interactiveMeshes);
    };

    // Soft cursor hover detection
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

    // 6. Window Resize Listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 360;
      const newH = container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 7. 60 FPS Animation Render Loop with Physics & Articulated Kinematics
    let reqId = 0;
    const clock = new THREE.Clock();
    let animStartTime = 0;
    let lastAnimState: AnimationState = 'idle';

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      const currentAnim = animationStateRef.current;
      const isSpeakingVal = isSpeakingRef.current;
      const mouthVal = mouthShapeRef.current;

      if (currentAnim !== lastAnimState) {
        lastAnimState = currentAnim;
        animStartTime = time;
      }
      const animTime = time - animStartTime;

      // Base Idle Values
      let targetTorsoScaleY = 1.0 + Math.sin(time * 2.2) * 0.02;
      let targetTorsoScaleXZ = 1.0 - Math.sin(time * 2.2) * 0.01;
      let targetHeadPosY = 1.45 + Math.sin(time * 2.2 - 0.3) * 0.015;
      let targetHeadRotX = 0;
      let targetHeadRotY = 0;
      let targetHeadRotZ = 0;
      let targetHeadPosZ = 0.05;

      let targetLeftArmRotZ = 0.35 + Math.sin(time * 2.2) * 0.03;
      let targetLeftArmRotX = 0;
      let targetLeftArmRotY = 0;

      let targetRightArmRotZ = -0.35 - Math.sin(time * 2.2) * 0.03;
      let targetRightArmRotX = 0;
      let targetRightArmRotY = 0;

      let targetLeftLegRotX = 0;
      let targetLeftLegPosY = -1.05;
      let targetRightLegRotX = 0;
      let targetRightLegPosY = -1.05;

      let targetPelvisRotZ = 0;
      let targetPelvisPosY = -0.4;

      let targetLeftEarRotZ = Math.sin(time * 1.5) * 0.04;
      let targetRightEarRotZ = -Math.sin(time * 1.5) * 0.04;

      let targetLeftBlink = -Math.PI / 2;
      let targetRightBlink = -Math.PI / 2;

      let targetBellyScale = 1.0;
      let targetCheekScale = 1.0;
      let targetNosePosX = 0;

      let targetMouthScaleY = 0.3;
      let targetMouthScaleX = 1.0;

      // Natural Idle Periodic Blink (~every 3.6 seconds)
      const blinkCycle = time % 3.6;
      if (blinkCycle < 0.16) {
        targetLeftBlink = 0;
        targetRightBlink = 0;
      }

      // 8. Coordinated Reaction State Machine
      switch (currentAnim) {
        case 'wave-left':
          // Hunny Bear raises and waves left hand playfully
          targetLeftArmRotZ = 2.3 + Math.sin(animTime * 10) * 0.35;
          targetLeftArmRotX = 0.35;
          targetLeftArmRotY = -0.2;
          targetHeadRotY = -0.28; // looks toward the waving hand
          targetHeadRotZ = -0.08;
          targetMouthScaleY = 0.8; // warm smile
          break;

        case 'wave-right':
          // Hunny Bear raises and waves right hand playfully
          targetRightArmRotZ = -2.3 - Math.sin(animTime * 10) * 0.35;
          targetRightArmRotX = 0.35;
          targetRightArmRotY = 0.2;
          targetHeadRotY = 0.28; // looks toward the waving hand
          targetHeadRotZ = 0.08;
          targetMouthScaleY = 0.8; // warm smile
          break;

        case 'foot-tap-left':
          // Lifts left foot and taps/stamps gently, body balances
          targetLeftLegRotX = -0.45;
          targetLeftLegPosY = -0.88 + Math.abs(Math.sin(animTime * 8)) * 0.16;
          targetPelvisRotZ = -0.06;
          targetPelvisPosY = -0.4 + Math.sin(animTime * 8) * 0.04;
          targetHeadRotX = 0.22; // looks down at feet
          targetMouthScaleY = 0.7;
          break;

        case 'foot-tap-right':
          // Lifts right foot and taps/stamps gently, body balances
          targetRightLegRotX = -0.45;
          targetRightLegPosY = -0.88 + Math.abs(Math.sin(animTime * 8)) * 0.16;
          targetPelvisRotZ = 0.06;
          targetPelvisPosY = -0.4 + Math.sin(animTime * 8) * 0.04;
          targetHeadRotX = 0.22; // looks down at feet
          targetMouthScaleY = 0.7;
          break;

        case 'tummy-love':
          // Vital: Looks down at tummy, folds both hands over belly, belly soft bounce, sweet sway
          targetHeadRotX = 0.28;
          targetHeadPosY = 1.38;
          // Both arms hug belly
          targetLeftArmRotZ = 1.25;
          targetLeftArmRotX = 0.65;
          targetLeftArmRotY = 0.45;
          targetRightArmRotZ = -1.25;
          targetRightArmRotX = 0.65;
          targetRightArmRotY = -0.45;
          // Belly bounce and gentle sway
          targetBellyScale = 1.15 + Math.sin(animTime * 5) * 0.08;
          targetPelvisRotZ = Math.sin(animTime * 3) * 0.09;
          targetCheekScale = 1.35; // rosy happy cheeks
          targetMouthScaleY = 0.9; // big affectionate smile
          targetLeftBlink = -Math.PI / 4; // soft warm eyes
          targetRightBlink = -Math.PI / 4;
          break;

        case 'tummy-giggle':
          // Laughing belly bounce
          targetHeadRotX = 0.2;
          targetLeftArmRotZ = 1.1;
          targetLeftArmRotX = 0.6;
          targetRightArmRotZ = -1.1;
          targetRightArmRotX = 0.6;
          targetBellyScale = 1.2 + Math.sin(animTime * 14) * 0.12;
          targetLeftEarRotZ = Math.sin(animTime * 14) * 0.2;
          targetRightEarRotZ = -Math.sin(animTime * 14) * 0.2;
          targetMouthScaleY = 1.2;
          break;

        case 'nose-boop':
          // Nose wiggles, head recoils back in funny cartoon reaction
          targetNosePosX = Math.sin(animTime * 28) * 0.07;
          targetHeadPosZ = -0.32;
          targetHeadRotX = -0.2;
          targetHeadPosY = 1.52;
          targetMouthScaleY = 0.9;
          if (animTime < 0.35) {
            targetLeftBlink = 0;
            targetRightBlink = 0;
          }
          break;

        case 'ear-surprise-left':
          // Touched left ear wiggles, head tilts away in gentle surprise
          targetLeftEarRotZ = Math.sin(animTime * 16) * 0.32;
          targetHeadRotZ = -0.24;
          targetHeadRotY = 0.15;
          targetMouthScaleX = 0.75;
          targetMouthScaleY = 1.3; // surprise 'O'
          break;

        case 'ear-surprise-right':
          // Touched right ear wiggles, head tilts away in gentle surprise
          targetRightEarRotZ = Math.sin(animTime * 16) * 0.32;
          targetHeadRotZ = 0.24;
          targetHeadRotY = -0.15;
          targetMouthScaleX = 0.75;
          targetMouthScaleY = 1.3; // surprise 'O'
          break;

        case 'eye-blink-left':
          // Protective fast blink on touched eye, head leans back, arm comes up protectively
          targetLeftBlink = 0; // shut
          targetHeadPosZ = -0.2;
          targetLeftArmRotZ = 1.3;
          targetLeftArmRotX = 0.9;
          targetMouthScaleY = 0.4;
          break;

        case 'eye-blink-right':
          // Protective fast blink on touched eye, head leans back, arm comes up protectively
          targetRightBlink = 0; // shut
          targetHeadPosZ = -0.2;
          targetRightArmRotZ = -1.3;
          targetRightArmRotX = 0.9;
          targetMouthScaleY = 0.4;
          break;

        case 'cheek-smile-left':
          // Head turns and tilts softly into touched cheek, cheeks glow rosy, broad sweet smile
          targetHeadRotZ = 0.2;
          targetHeadRotY = -0.22;
          targetCheekScale = 1.45;
          targetMouthScaleY = 0.95;
          targetLeftBlink = -Math.PI / 3.5;
          targetRightBlink = -Math.PI / 3.5;
          break;

        case 'cheek-smile-right':
          // Head turns and tilts softly into touched cheek, cheeks glow rosy, broad sweet smile
          targetHeadRotZ = -0.2;
          targetHeadRotY = 0.22;
          targetCheekScale = 1.45;
          targetMouthScaleY = 0.95;
          targetLeftBlink = -Math.PI / 3.5;
          targetRightBlink = -Math.PI / 3.5;
          break;

        case 'mouth-surprise':
          // Mouth forms round "O" shape, eyes widen, head leans back slightly
          targetMouthScaleX = 0.65;
          targetMouthScaleY = 1.5;
          targetHeadPosZ = -0.18;
          targetHeadRotX = -0.12;
          break;

        case 'head-tilt':
          // Friendly head tilt, ears bounce, warm smile
          targetHeadRotZ = 0.26;
          targetHeadRotY = -0.12;
          targetLeftEarRotZ = 0.18;
          targetRightEarRotZ = -0.12;
          targetMouthScaleY = 0.85;
          break;

        default:
          break;
      }

      // 9. Real-time Lip Sync while speaking
      if (isSpeakingVal) {
        const speechViseme = Math.abs(Math.sin(time * 15)) * 0.7 + 0.3;
        targetMouthScaleY = Math.max(targetMouthScaleY, speechViseme * 1.3);
      } else if (mouthVal === 'surprise-o') {
        targetMouthScaleX = 0.65;
        targetMouthScaleY = 1.4;
      } else if (mouthVal === 'smile') {
        targetMouthScaleY = 0.85;
      }

      // 10. Smooth Cartoon Lerping (Spring-like smoothness)
      const lerpSpeed = Math.min(delta * 9.5, 0.4);

      torsoMesh.scale.y = THREE.MathUtils.lerp(torsoMesh.scale.y, targetTorsoScaleY, lerpSpeed);
      torsoMesh.scale.x = THREE.MathUtils.lerp(torsoMesh.scale.x, targetTorsoScaleXZ, lerpSpeed);
      torsoMesh.scale.z = THREE.MathUtils.lerp(torsoMesh.scale.z, targetTorsoScaleXZ, lerpSpeed);

      headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, targetHeadPosY - 1.45, lerpSpeed);
      headGroup.position.z = THREE.MathUtils.lerp(headGroup.position.z, targetHeadPosZ, lerpSpeed);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, lerpSpeed);
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, lerpSpeed);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, targetHeadRotZ, lerpSpeed);

      leftArm.shoulderPivot.rotation.z = THREE.MathUtils.lerp(leftArm.shoulderPivot.rotation.z, targetLeftArmRotZ, lerpSpeed);
      leftArm.shoulderPivot.rotation.x = THREE.MathUtils.lerp(leftArm.shoulderPivot.rotation.x, targetLeftArmRotX, lerpSpeed);
      leftArm.shoulderPivot.rotation.y = THREE.MathUtils.lerp(leftArm.shoulderPivot.rotation.y, targetLeftArmRotY, lerpSpeed);

      rightArm.shoulderPivot.rotation.z = THREE.MathUtils.lerp(rightArm.shoulderPivot.rotation.z, targetRightArmRotZ, lerpSpeed);
      rightArm.shoulderPivot.rotation.x = THREE.MathUtils.lerp(rightArm.shoulderPivot.rotation.x, targetRightArmRotX, lerpSpeed);
      rightArm.shoulderPivot.rotation.y = THREE.MathUtils.lerp(rightArm.shoulderPivot.rotation.y, targetRightArmRotY, lerpSpeed);

      leftLeg.hipPivot.rotation.x = THREE.MathUtils.lerp(leftLeg.hipPivot.rotation.x, targetLeftLegRotX, lerpSpeed);
      leftLeg.hipPivot.position.y = THREE.MathUtils.lerp(leftLeg.hipPivot.position.y, targetLeftLegPosY, lerpSpeed);
      rightLeg.hipPivot.rotation.x = THREE.MathUtils.lerp(rightLeg.hipPivot.rotation.x, targetRightLegRotX, lerpSpeed);
      rightLeg.hipPivot.position.y = THREE.MathUtils.lerp(rightLeg.hipPivot.position.y, targetRightLegPosY, lerpSpeed);

      pelvis.rotation.z = THREE.MathUtils.lerp(pelvis.rotation.z, targetPelvisRotZ, lerpSpeed);
      pelvis.position.y = THREE.MathUtils.lerp(pelvis.position.y, targetPelvisPosY, lerpSpeed);

      leftEar.rotation.z = THREE.MathUtils.lerp(leftEar.rotation.z, targetLeftEarRotZ, lerpSpeed);
      rightEar.rotation.z = THREE.MathUtils.lerp(rightEar.rotation.z, targetRightEarRotZ, lerpSpeed);

      leftEye.eyelid.rotation.x = THREE.MathUtils.lerp(leftEye.eyelid.rotation.x, targetLeftBlink, lerpSpeed * 1.8);
      rightEye.eyelid.rotation.x = THREE.MathUtils.lerp(rightEye.eyelid.rotation.x, targetRightBlink, lerpSpeed * 1.8);

      stomachGroup.scale.set(targetBellyScale, targetBellyScale, targetBellyScale);
      leftCheek.cheekGroup.scale.set(targetCheekScale, targetCheekScale, targetCheekScale);
      rightCheek.cheekGroup.scale.set(targetCheekScale, targetCheekScale, targetCheekScale);

      noseMesh.position.x = THREE.MathUtils.lerp(noseMesh.position.x, targetNosePosX, lerpSpeed * 2.2);

      mouthCavityMesh.scale.x = THREE.MathUtils.lerp(mouthCavityMesh.scale.x, targetMouthScaleX, lerpSpeed * 1.5);
      mouthCavityMesh.scale.y = THREE.MathUtils.lerp(mouthCavityMesh.scale.y, targetMouthScaleY, lerpSpeed * 1.5);

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    // 11. Cleanup on Unmount
    return () => {
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
    <div
      ref={mountRef}
      className="w-full h-full max-w-md max-h-[520px] flex items-center justify-center relative touch-none select-none"
      style={{ minHeight: '360px', aspectRatio: '4/5' }}
    />
  );
};
