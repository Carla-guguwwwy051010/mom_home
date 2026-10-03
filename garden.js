import * as THREE from 'three';

// A complete garden diorama. All coordinates and animation stay local to group.
export function createGarden() {
  const group = new THREE.Group();
  group.name = '妈妈的小花园';
  const material = (color, roughness = .76, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const materials = {
    ground: material(0xd9d6bc), lawn: material(0xb7c3a0), soil: material(0x8b7561),
    stone: material(0xe7dacb), rim: material(0xcbb8a4), cream: material(0xfff2df),
    wood: material(0xc09979), woodDark: material(0xa57e65), green: material(0x709268),
    leaf: material(0x8eab78), rose: material(0xe7b6c0, .37), brass: material(0xbb9c64, .35, .45),
    center: material(0xe5bc6e), petals: [0xe7a8b7, 0xf5d1d9, 0xffedcf, 0xc9b9d4].map(c => material(c, .62))
  };
  const geo = {
    sphere: new THREE.SphereGeometry(1, 16, 12), box: new THREE.BoxGeometry(1, 1, 1),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 48), stem: new THREE.CylinderGeometry(.023, .029, 1, 8),
    torus: new THREE.TorusGeometry(1, .036, 8, 48),
    petal: new THREE.SphereGeometry(1, 14, 10), leaf: new THREE.SphereGeometry(1, 12, 8)
  };
  const mesh = (geometry, mat, parent, position, scale) => {
    const object = new THREE.Mesh(geometry, mat);
    object.castShadow = true;
    object.receiveShadow = true;
    if (position) object.position.set(...position);
    if (scale) object.scale.set(...scale);
    parent.add(object);
    return object;
  };
  const box = (parent, mat, x, y, z, w, h, d) => mesh(geo.box, mat, parent, [x, y, z], [w, h, d]);
  const sphere = (parent, mat, x, y, z, w, h, d) => mesh(geo.sphere, mat, parent, [x, y, z], [w, h, d]);
  const cylinder = (parent, mat, x, y, z, radius, height, depth = radius) => mesh(geo.cylinder, mat, parent, [x, y, z], [radius, height, depth]);
  const pose = new THREE.Object3D();
  function instance(geometry, mat, count, parent, transform) {
    const object = new THREE.InstancedMesh(geometry, mat, count);
    object.castShadow = true;
    object.receiveShadow = true;
    for (let i = 0; i < count; i++) {
      pose.position.set(0, 0, 0); pose.rotation.set(0, 0, 0); pose.scale.set(1, 1, 1);
      transform(pose, i); pose.updateMatrix(); object.setMatrixAt(i, pose.matrix);
    }
    object.instanceMatrix.needsUpdate = true;
    parent.add(object);
    return object;
  }

  cylinder(group, materials.ground, 0, -.15, -.65, 6.45, .26, 5.15);
  cylinder(group, materials.lawn, 0, -.007, -.65, 6.23, .028, 4.94);
  // Rounded stepping stones invite the visitor into the centre of the garden.
  for (let i = 0; i < 7; i++) {
    const stone = cylinder(group, materials.stone, Math.sin(i * 1.05) * .16, .023, 3.2 - i * .89, .70, .065, .40);
    stone.rotation.y = Math.sin(i * .7) * .18;
  }
  const bedPositions = [[-3.04, -1.92], [2.98, -1.81]];
  bedPositions.forEach(([x, z]) => {
    cylinder(group, materials.rim, x, .20, z, 1.83, .39, 1.39);
    cylinder(group, materials.cream, x, .38, z, 1.88, .105, 1.43);
    cylinder(group, materials.soil, x, .435, z, 1.66, .015, 1.23);
  });
  // Low fence and a delicate arch leave the skyline open.
  for (let i = 0; i < 14; i++) {
    const x = -5.7 + i * .875;
    if (Math.abs(x) < 1.25) continue;
    box(group, materials.cream, x, .60, -4.25, .13, 1.17, .13);
    sphere(group, materials.cream, x, 1.2, -4.25, .095, .095, .095);
  }
  [-3.5, 3.5].forEach(x => {
    box(group, materials.cream, x, .36, -4.26, 4.4, .095, .10);
    box(group, materials.cream, x, .88, -4.26, 4.4, .095, .10);
  });
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.18, .03, -4.22), new THREE.Vector3(-1.18, 2.1, -4.22),
    new THREE.Vector3(-.81, 2.9, -4.22), new THREE.Vector3(0, 3.18, -4.22),
    new THREE.Vector3(.81, 2.9, -4.22), new THREE.Vector3(1.18, 2.1, -4.22),
    new THREE.Vector3(1.18, .03, -4.22)
  ]);
  mesh(new THREE.TubeGeometry(archCurve, 48, .043, 8, false), materials.wood, group);
  instance(geo.leaf, materials.green, 16, group, (p, i) => {
    const t = .18 + i / 15 * .58, v = archCurve.getPoint(t);
    p.position.copy(v); p.position.x += Math.sin(i * 2.4) * .11;
    p.rotation.z = i * .94; p.scale.set(.13, .235, .049);
  });
  instance(geo.sphere, materials.petals[1], 9, group, (p, i) => {
    p.position.copy(archCurve.getPoint(.22 + i / 8 * .52)); p.position.z += .055;
    p.scale.set(.145, .145, .105);
  });
  // Slatted bench with a softly curved pink cushion.
  const bench = new THREE.Group(); group.add(bench); bench.position.set(-3.05, 0, 1.35); bench.rotation.y = .18;
  for (const x of [-.96, .96]) for (const z of [-.32, .32]) box(bench, materials.woodDark, x, .30, z, .105, .59, .105);
  for (let i = 0; i < 4; i++) box(bench, materials.wood, 0, .65, -.35 + i * .23, 2.4, .105, .17);
  for (const x of [-1.0, 1.0]) box(bench, materials.woodDark, x, .92, -.36, .095, 1.10, .095);
  for (let i = 0; i < 3; i++) box(bench, materials.wood, 0, .93 + i * .20, -.38, 2.4, .14, .075);
  sphere(bench, materials.rose, -.66, .78, -.02, .37, .085, .29);
  // Two warm lanterns stand beside the path.
  const lamps = [];
  const glow = new THREE.MeshStandardMaterial({color:0xffe5b4,emissive:0xffcc7f,emissiveIntensity:.6,roughness:.45});
  for (const x of [-1.16, 1.16]) {
    cylinder(group, materials.brass, x, .36, 2.64, .035, .69);
    cylinder(group, materials.brass, x, .08, 2.64, .16, .045);
    const lamp = sphere(group, glow, x, .81, 2.64, .16, .22, .16); lamps.push(lamp);
    cylinder(group, materials.brass, x, 1.02, 2.64, .18, .04);
  }

  const plants = [];
  const positions = [[-.79,-.34],[0,-.57],[.77,-.31],[-.73,.36],[.07,.34],[.79,.34]];
  bedPositions.forEach(([bx, bz], bed) => {
    positions.forEach(([px, pz], index) => {
      const id = bed * 6 + index, plant = new THREE.Group(); group.add(plant);
      plant.position.set(bx + px * 1.30, .445, bz + pz * 1.29);
      const height = .78 + ((id * 3) % 5) * .12;
      mesh(geo.stem, materials.green, plant, [0, height / 2, 0], [1, height, 1]);
      instance(geo.leaf, materials.leaf, 3, plant, (p, i) => {
        const side = i % 2 ? -1 : 1;
        p.position.set(side * .11, height * (.25 + i * .16), .012);
        p.rotation.z = side * -.74; p.rotation.y = side * .25;
        p.scale.set(.086, .215, .035);
      });
      const blossom = new THREE.Group(); blossom.position.y = height; blossom.rotation.x = .30;
      plant.add(blossom);
      const isRose = id % 3 === 0, petalCount = isRose ? 14 : 8;
      instance(geo.petal, materials.petals[id % 4], petalCount, blossom, (p, i) => {
        const inner = isRose && i >= 8, count = inner ? 6 : 8;
        const a = (i - (inner ? 8 : 0)) / count * Math.PI * 2 + (inner ? .32 : 0);
        const radius = inner ? .092 : .172;
        p.position.set(Math.sin(a) * radius, inner ? .07 : 0, Math.cos(a) * radius);
        p.rotation.y = a; p.rotation.x = inner ? -.52 : -.1;
        p.scale.set(inner ? .105 : .125, inner ? .068 : .049, inner ? .14 : .206);
      });
      const centre = sphere(blossom, isRose ? materials.petals[1] : materials.center, 0, .045, 0, .093, .066, .093);
      if (!isRose) instance(geo.sphere, materials.center, 7, blossom, (p, i) => {
        const a = i / 7 * Math.PI * 2; p.position.set(Math.sin(a) * .067, .095, Math.cos(a) * .067); p.scale.setScalar(.018);
      });
      plants.push({group:plant, blossom, centre, height, scale:.6, target:.6, bloom:.3, targetBloom:.3, phase:id * 1.13});
    });
  });

  const wateringCan = new THREE.Group(); group.add(wateringCan); wateringCan.name = 'watering-can';
  const canHome = new THREE.Vector3(3.20, .03, 1.04), canRaised = new THREE.Vector3(3.52, 1.74, -1.39);
  wateringCan.position.copy(canHome);
  sphere(wateringCan, materials.rose, 0, .37, 0, .38, .40, .31);
  cylinder(wateringCan, materials.rose, 0, .08, 0, .30, .07, .25);
  const mouth = mesh(new THREE.TorusGeometry(.205, .035, 10, 32), materials.cream, wateringCan, [0,.73,0]); mouth.rotation.x = Math.PI / 2;
  cylinder(wateringCan, materials.soil, 0, .71, 0, .185, .012);
  const handle = mesh(new THREE.TorusGeometry(.265, .043, 10, 36), materials.cream, wateringCan, [.35,.44,0]); handle.scale.x = .82;
  const spoutCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.25,.29,0),new THREE.Vector3(-.61,.42,0),new THREE.Vector3(-.90,.61,0)]);
  mesh(new THREE.TubeGeometry(spoutCurve, 16, .058, 10, false), materials.rose, wateringCan);
  const nozzle = cylinder(wateringCan, materials.brass, -.92, .625, 0, .12, .055); nozzle.rotation.z = Math.PI/4;
  const nozzlePoint = new THREE.Vector3(-.945,.65,0);
  const wateringTarget = new THREE.Vector3(2.57, .46, -1.40);
  const dropMaterial = new THREE.MeshPhysicalMaterial({color:0xd3eaf4,transparent:true,opacity:.76,roughness:.2,metalness:0,depthWrite:false});
  const droplets = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), dropMaterial, 42);
  droplets.frustumCulled = false; droplets.visible = false; group.add(droplets);
  const dropsStart = new THREE.Vector3(), dropsEnd = new THREE.Vector3();
  const splash = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), dropMaterial, 12);
  splash.frustumCulled = false; splash.visible = false; group.add(splash);

  let elapsed = 0, waterTime = -1, waterDuration = 4.6, growthCount = 0;
  const clamp = THREE.MathUtils.clamp;
  const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
  function setGrowth(count, immediate = false) {
    growthCount = Math.max(0, Math.floor(Number(count) || 0));
    plants.forEach((plant, i) => {
      // Alternate the new flowers between the two beds.
      const order = (i % 6) * 2 + Math.floor(i / 6);
      const development = clamp((growthCount + 4 - order) / 2, 0, 1);
      plant.target = .44 + development * .56;
      plant.targetBloom = .14 + development * .86;
      if (immediate) { plant.scale = plant.target; plant.bloom = plant.targetBloom; plant.group.scale.setScalar(plant.scale); plant.blossom.scale.setScalar(plant.bloom); }
    });
    return growthCount;
  }
  setGrowth(0, true);

  return {
    group, plants, bench, wateringCan, wateringTarget, droplets, lamps,
    cameraPosition: new THREE.Vector3(0, 3.8, 10.8), cameraTarget: new THREE.Vector3(0, 1.1, -1.4),
    characterPosition: new THREE.Vector3(-.9, 0, 1),
    get busy() { return waterTime >= 0; },
    get growthCount() { return growthCount; },
    setGrowth,
    water(duration = 4.6) {
      if (waterTime >= 0) return false;
      waterDuration = Math.max(3.6, Number(duration) || 4.6); waterTime = 0; return true;
    },
    resetWatering() { waterTime = -1; wateringCan.position.copy(canHome); wateringCan.rotation.set(0,0,0); droplets.visible = splash.visible = false; },
    update(dt, time) {
      dt = clamp(Number(dt) || 0, 0, .15); elapsed = Number.isFinite(time) ? time : elapsed + dt;
      const watering = waterTime >= 0;
      plants.forEach(plant => {
        const lerp = 1 - Math.exp(-dt * 2.1);
        plant.scale += (plant.target - plant.scale) * lerp;
        plant.bloom += (plant.targetBloom - plant.bloom) * lerp;
        plant.group.scale.setScalar(plant.scale);
        plant.blossom.scale.setScalar(plant.bloom);
        plant.group.rotation.z = Math.sin(elapsed * 1.45 + plant.phase) * (watering ? .035 : .018);
        plant.group.rotation.x = Math.sin(elapsed * 1.1 + plant.phase * .7) * .015;
      });
      if (!watering) return;
      waterTime += dt;
      const lift = smooth(waterTime / 1.0), settle = smooth((waterTime - (waterDuration - 1.1)) / 1.1);
      const k = lift * (1 - settle);
      wateringCan.position.lerpVectors(canHome, canRaised, k);
      wateringCan.rotation.z = smooth((waterTime - .65) / .65) * (1 - settle) * .73;
      wateringCan.rotation.y = Math.sin(elapsed * 1.8) * .045 * k;
      const pouring = waterTime > 1.22 && waterTime < waterDuration - 1.08;
      droplets.visible = splash.visible = pouring;
      if (pouring) {
        group.updateMatrixWorld(true);
        dropsStart.copy(nozzlePoint); wateringCan.localToWorld(dropsStart); group.worldToLocal(dropsStart);
        dropsEnd.copy(wateringTarget);
        for (let i = 0; i < droplets.count; i++) {
          const p = (elapsed * 1.85 + i * .61803398875) % 1, spread = .025 + p * .17;
          pose.position.lerpVectors(dropsStart, dropsEnd, p * p);
          pose.position.x += Math.sin(i * 2.4) * spread;
          pose.position.z += Math.cos(i * 2.4) * spread;
          pose.rotation.set(0,0,0); pose.scale.set(.014,.032 + .035 * p,.014); pose.updateMatrix();
          droplets.setMatrixAt(i, pose.matrix);
        }
        droplets.instanceMatrix.needsUpdate = true;
        for (let i = 0; i < splash.count; i++) {
          const p = (elapsed * 2.3 + i / splash.count) % 1, a = i * 2.399;
          pose.position.copy(dropsEnd); pose.position.x += Math.cos(a) * p * .35;
          pose.position.z += Math.sin(a) * p * .35; pose.position.y += Math.sin(p * Math.PI) * .13;
          pose.scale.setScalar(.016 * (1 - p)); pose.updateMatrix(); splash.setMatrixAt(i, pose.matrix);
        }
        splash.instanceMatrix.needsUpdate = true;
      }
      if (waterTime >= waterDuration) {
        waterTime = -1; wateringCan.position.copy(canHome); wateringCan.rotation.set(0,0,0); droplets.visible = splash.visible = false;
      }
    }
  };
}
