import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// A fully three-dimensional doll. All surfaces, strands and clothes are meshes.
// Faces +Z; the feet rest at Y=0. Arm/leg arrays are ordered [-X, +X].
export function createGirl() {
  const root = new THREE.Group();
  root.name = 'Daughter doll';
  const body = new THREE.Group(); root.add(body);
  const skirt = new THREE.Group(); body.add(skirt);
  const head = new THREE.Group(); head.position.set(0, 2.82, .045); body.add(head);
  const arms = [], elbows = [], hands = [], legs = [], knees = [], eyeGroups = [], eyelids = [];
  const P = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: .58, ...extra });
  const skin = P(0xf8d9c9, { roughness: .68, clearcoat: .035, clearcoatRoughness: .9, sheen: .12, sheenColor: new THREE.Color(0xffebe1) });
  const innerEar = P(0xe8b6a5, { roughness: .79 });
  const lips = P(0xc98184, { roughness: .75 });
  const hair = P(0x49332c, { roughness: .51, sheen: .31, sheenColor: new THREE.Color(0x92705f), sheenRoughness: .74 });
  const hairLight = P(0x61453b, { roughness: .48, sheen: .40, sheenColor: new THREE.Color(0xa9816d) });
  const hairDark = P(0x3c2b28, { roughness: .53 });
  const satin = P(0xf4d2d4, { roughness: .53, sheen: .46, sheenColor: new THREE.Color(0xfff2ec), sheenRoughness: .6 });
  const satinLight = P(0xf9e4e1, { roughness: .57, sheen: .45, sheenColor: new THREE.Color(0xfff8ed) });
  const lace = P(0xfff7ee, { roughness: .91 });
  const pearl = P(0xfff4e4, { roughness: .24, metalness: .08, clearcoat: .7 });
  const shoeMat = P(0xf6e4df, { roughness: .27, clearcoat: .85, clearcoatRoughness: .28 });
  const soleMat = P(0xcdb8af, { roughness: .85 });
  const metal = P(0xc6a576, { roughness: .24, metalness: .72 });
  const sclera = P(0xfff2eb, { roughness: .28, clearcoat: .48, clearcoatRoughness: .18 });
  const black = P(0x211715, { roughness: .2, clearcoat: .92, clearcoatRoughness: .08 });
  const sphereGeometry = new THREE.SphereGeometry(1, 28, 20);
  const detailSphereGeometry = new THREE.SphereGeometry(1, 12, 8);
  function add(geometry, material, parent, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  }
  function oval(parent, material, position, scale) {
    const mesh = add(sphereGeometry, material, parent, ...position); mesh.scale.set(...scale); return mesh;
  }
  function curveGeometry(points, radius = .01, segments = 32, radial = 7) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, segments, radius, radial, false);
  }
  function line(parent, material, points, radius = .01, segments = 32) {
    return add(curveGeometry(points, radius, segments), material, parent);
  }
  function cluster(parent, material, items, geometry = detailSphereGeometry) {
    const geometries = items.map(({ p, s, r = [0, 0, 0] }) => {
      const g = geometry.clone();
      const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
      return g.applyMatrix4(matrix);
    });
    const merged = mergeGeometries(geometries, false); geometries.forEach(g => g.dispose());
    return add(merged, material, parent);
  }
  function combineCurves(parent, material, paths, radius = .008) {
    const parts = paths.map(p => curveGeometry(p, radius, 24, 6));
    const g = mergeGeometries(parts, false); parts.forEach(p => p.dispose());
    return add(g, material, parent);
  }

  // Sculpt features into one surface so the cheeks, eye sockets and tiny nose
  // catch light continuously instead of resembling shapes glued onto a ball.
  const gaussian=(x,y,cx,cy,sx,sy)=>Math.exp(-Math.pow((x-cx)/sx,2)-Math.pow((y-cy)/sy,2));
  const faceRelief=(x,y)=>
    .017*(gaussian(x,y,-.35,-.20,.17,.14)+gaussian(x,y,.35,-.20,.17,.14))
    -.014*(gaussian(x,y,-.23,-.035,.16,.15)+gaussian(x,y,.23,-.035,.16,.15))
    +.034*gaussian(x,y,0,-.17,.066,.075)
    +.009*gaussian(x,y,0,-.40,.16,.10);
  const faceGeo = new THREE.SphereGeometry(1, 96, 72);
  const fp = faceGeo.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i), y = fp.getY(i), z = fp.getZ(i);
    const jaw = y < -.22 ? 1 - Math.pow((-y - .22) / .78, 1.25) * .105 : 1;
    const cheeks = 1 + .075 * Math.exp(-Math.pow((y + .25) * 4, 2));
    const px=x*.592*jaw*cheeks,py=y*.590;
    fp.setXYZ(i,px,py,z*.48+(z>0?.030*Math.exp(-Math.pow((y+.24)*3.5,2))+faceRelief(px,py)*z:0));
  }
  const faceColors=[],baseColor=new THREE.Color(0xf8d9c9),pinkCheek=new THREE.Color(0xf2aaa8),tempColor=new THREE.Color();
  for(let i=0;i<fp.count;i++){
    const x=fp.getX(i),y=fp.getY(i),z=fp.getZ(i);
    const left=Math.exp(-Math.pow((x+.345)/.155,2)-Math.pow((y+.185)/.13,2));
    const right=Math.exp(-Math.pow((x-.345)/.155,2)-Math.pow((y+.185)/.13,2));
    const warm=Math.max(left,right)*Math.max(0,Math.min(1,(z-.16)/.23));
    tempColor.copy(baseColor).lerp(pinkCheek,warm*.34);faceColors.push(tempColor.r,tempColor.g,tempColor.b);
  }
  faceGeo.setAttribute('color',new THREE.Float32BufferAttribute(faceColors,3));
  faceGeo.computeVertexNormals(); add(faceGeo,P(0xffffff,{vertexColors:true,roughness:.67,clearcoat:.035,sheen:.12,sheenColor:new THREE.Color(0xffebe1)}),head);
  const faceFront=(x,y)=>{
    const normalizedY=y/.590;
    const jaw=normalizedY<-.22?1-Math.pow((-normalizedY-.22)/.78,1.25)*.105:1;
    const cheeks=1+.075*Math.exp(-Math.pow((normalizedY+.25)*4,2));
    const normalizedX=x/(.592*jaw*cheeks);
    const front=Math.sqrt(Math.max(.03,1-normalizedX*normalizedX-normalizedY*normalizedY));
    return .48*front+.030*Math.exp(-Math.pow((normalizedY+.24)*3.5,2))+faceRelief(x,y)*front;
  };
  oval(body, skin, [0, 2.242, 0], [.123, .18, .116]);
  for (const side of [-1, 1]) {
    oval(head, skin, [side * .56, -.075, -.025], [.107, .144, .073]);
    oval(head, innerEar, [side * .608, -.076, .016], [.040, .080, .018]);
  }
  // The nose is formed by the face mesh itself; only the smile needs a line.
  // Keep the smile in front of the sculpted cheeks. Its old coordinates placed
  // most of it *inside* the face, leaving an uncanny, broken-looking mouth.
  const smile=[[-.072,-.288],[-.040,-.306],[0,-.312],[.040,-.306],[.072,-.288]];
  const smileMesh=line(head,lips,smile.map(([x,y])=>[x,y,faceFront(x,y)+.006]),.0046,28);
  oval(head,P(0xe6a8a5,{roughness:.82}),[0,-.325,faceFront(0,-.325)+.003],[.027,.004,.002]);

  // Radial fibers are a procedural iris texture on rounded eye surfaces.
  const irisTexture = (() => {
    const size = 128, data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = (x + .5 - size / 2) / (size / 2), dy = (y + .5 - size / 2) / (size / 2);
      const radius = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      const fibers = Math.sin(a * 63 + Math.sin(a * 29) * 2 + radius * 11) * .5 + Math.sin(a * 113 - radius * 19) * .24;
      const ring = Math.max(0, 1 - Math.abs(radius - .69) * 2.3);
      const outer = 1 - Math.min(1, Math.max(0, (radius - .76) / .24));
      const lowerGlow = Math.max(0, -dy) * .19;
      const light = (ring * .56 + fibers * .10 + lowerGlow) * outer;
      const i = (y * size + x) * 4;
      data[i] = Math.max(0, 29 + light * 105); data[i + 1] = Math.max(0, 18 + light * 72); data[i + 2] = Math.max(0, 16 + light * 51); data[i + 3] = 255;
    }
    const t = new THREE.DataTexture(data, size, size); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t;
  })();
  // The eye surfaces follow the cheeks, so they read as part of her face.
  const irisMat = P(0xffffff, { map: irisTexture, roughness: .18, clearcoat: 1, clearcoatRoughness: .08 });
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xfff9ef });
  function fittedEyePatch(parent,cx,cy,width,height,offset,material,bulge=0,almond=0){
    const g=new THREE.CircleGeometry(1,48),p=g.attributes.position,origin=faceFront(cx,cy);
    for(let i=0;i<p.count;i++){
      const u=p.getX(i),v=p.getY(i),x=u*width,y=v*height*(1-almond*Math.pow(Math.abs(u),2));
      p.setXYZ(i,x,y,faceFront(cx+x,cy+y)-origin+offset+bulge*Math.max(0,1-u*u-v*v));
    }
    g.computeVertexNormals();return add(g,material,parent);
  }
  // A curved upper lid sweeps over the eye. Blinking no longer scales the
  // entire eyeball into a thin line, which made the expression look mechanical.
  function fittedEyelid(parent,cx,cy){
    const columns=24,rows=4,position=new Float32Array((columns+1)*(rows+1)*3),indices=[];
    for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
      const a=row*(columns+1)+col,b=a+columns+1;
      indices.push(a,b,a+1,a+1,b,b+1);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(position,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setIndex(indices);
    const mesh=add(geometry,skin,parent);mesh.castShadow=false;mesh.receiveShadow=false;mesh.visible=false;
    const origin=faceFront(cx,cy);
    return closure=>{
      mesh.visible=closure>.015;
      if(!mesh.visible)return;
      for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
        const u=col/columns*2-1,v=row/rows;
        const x=u*.143,tip=Math.pow(Math.abs(u),1.8);
        const top=.141*(1-tip)+.013*tip,bottom=-.143*(1-tip)-.010*tip;
        const y=top+(bottom-top)*closure*v;
        const i=(row*(columns+1)+col)*3;
        position[i]=x;position[i+1]=y;
        position[i+2]=faceFront(cx+x,cy+y)-origin+.029;
      }
      geometry.attributes.position.needsUpdate=true;
      geometry.computeVertexNormals();
    };
  }
  for (const side of [-1, 1]) {
    const cx=side*.230,cy=-.045,origin=faceFront(cx,cy);
    const eyes = new THREE.Group(); eyes.position.set(cx,cy,origin);
    head.add(eyes); eyeGroups.push(eyes);
    fittedEyePatch(eyes,cx,cy,.140,.147,.004,sclera,.003,.55);
    fittedEyePatch(eyes,cx,cy,.108,.114,.010,irisMat,.006);
    fittedEyePatch(eyes,cx,cy,.047,.053,.018,black,.004);
    const sparkle=oval(eyes,highlightMat,[-.032,.044,faceFront(cx-.032,cy+.044)-origin+.026],[.016,.021,.003]);sparkle.castShadow=false;
    const sparkle2=oval(eyes,highlightMat,[.035,-.043,faceFront(cx+.035,cy-.043)-origin+.024],[.005,.007,.002]);sparkle2.castShadow=false;
    eyelids.push(fittedEyelid(eyes,cx,cy));
    const fit=(points,height=.011)=>points.map(([x,y])=>[x,y,faceFront(cx+x,cy+y)-origin+height]);
    line(eyes,hairDark,fit([[-.136,.013],[-.110,.064],[-.053,.121],[.044,.123],[.110,.064],[.137,.013]]),.0064,32);
    line(eyes,innerEar,fit([[-.133,-.010],[-.097,-.102],[0,-.143],[.102,-.100],[.133,-.008]],.006),.0028,28);
    const lashPaths=[0,1].map(i=>fit([[side*(.112+i*.010),.079-i*.027],[side*(.147+i*.012),.093-i*.027],[side*(.161+i*.011),.112-i*.022]],.013));
    combineCurves(eyes,hairDark,lashPaths,.0043);
    line(head, hairLight, [[side * .108, .207, .430], [side * .194, .234, .433], [side * .277, .234, .409], [side * .323, .217, .379]], .008, 24);
  }

  // Continuous hair cap, trimmed along the forehead and lower around the back.
  const hairPositions = [], hairUVs = [], hairIndices = [];
  const rings = 22, slices = 80;
  for (let j = 0; j <= rings; j++) for (let i = 0; i <= slices; i++) {
    const theta = i / slices * Math.PI * 2;
    const front = Math.pow(Math.max(0, Math.sin(theta)), 3);
    const boundary = 1.93 - front * .84 + Math.cos(theta) * .06;
    const phi = j / rings * boundary;
    hairPositions.push(.599 * Math.sin(phi) * Math.cos(theta), .63 * Math.cos(phi) + .04, .513 * Math.sin(phi) * Math.sin(theta) - .038);
    hairUVs.push(i / slices, j / rings);
    if (j < rings && i < slices) { const a = j * (slices + 1) + i, b = a + slices + 1; hairIndices.push(a, a + 1, b, b, a + 1, b + 1); }
  }
  const capGeo = new THREE.BufferGeometry(); capGeo.setAttribute('position', new THREE.Float32BufferAttribute(hairPositions, 3));
  capGeo.setAttribute('uv', new THREE.Float32BufferAttribute(hairUVs, 2)); capGeo.setIndex(hairIndices); capGeo.computeVertexNormals();
  add(capGeo, hair, head);
  // A tapered, flattened lock follows a curved path; its cross section is real volume.
  function lock(points, width, material, thickness = .025) {
    const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const vertices = [], indices = [], steps = 28, radial = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, p = path.getPoint(t), tangent = path.getTangent(t);
      const across = new THREE.Vector3(tangent.y, -tangent.x, 0).normalize();
      const normal = new THREE.Vector3().crossVectors(across, tangent).normalize();
      const taper = Math.pow(Math.sin(Math.PI * t), .67) * .98 + .005;
      for (let j = 0; j <= radial; j++) {
        const angle = j / radial * Math.PI * 2;
        const v = p.clone().addScaledVector(across, Math.cos(angle) * width * taper).addScaledVector(normal, Math.sin(angle) * thickness * taper);
        vertices.push(v.x, v.y, v.z);
        if (i < steps && j < radial) { const a = i * (radial + 1) + j, b = a + radial + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); g.setIndex(indices); g.computeVertexNormals(); return add(g, material, head);
  }
  const locks = [
    [[.18, .615, .14], [-.08, .551, .337], [-.33, .375, .423], [-.47, .16, .340]],
    [[.16, .605, .17], [-.00, .494, .413], [-.20, .308, .480], [-.355, .154, .415]],
    [[.13, .59, .22], [.021, .428, .482], [-.084, .27, .502], [-.16, .179, .492]],
    [[.18, .60, .18], [.318, .495, .37], [.416, .332, .395], [.489, .117, .307]],
    [[.225, .561, .215], [.351, .428, .385], [.410, .235, .435], [.421, .083, .401]],
    [[-.446, .334, .288], [-.541, .142, .195], [-.525, -.105, .124], [-.473, -.306, .23]],
    [[.484, .343, .251], [.559, .143, .171], [.525, -.095, .149], [.556, -.281, .18]],
    [[-.407, .306, .349], [-.476, .164, .331], [-.498, -.011, .293], [-.469, -.168, .301]],
    [[.416, .295, .345], [.486, .141, .316], [.491, -.026, .285], [.466, -.177, .297]],
  ];
  locks.forEach((p, i) => lock(p, i < 5 ? .050 : i < 7 ? .029 : .017, i % 3 === 0 ? hairLight : hair, i < 5 ? .017 : .013));
  const strandPaths = [];
  for (let n = 0; n < 15; n++) {
    const p = locks[n % 5], shift = ((n % 3) - 1) * .019;
    strandPaths.push(p.map((v, i) => [v[0] + shift * Math.sin(i / 3 * Math.PI), v[1] + .002, v[2] + .024]));
  }
  combineCurves(head, hairLight, strandPaths, .0034);
  for (const side of [-1, 1]) {
    oval(head, hair, [side * .484, -.093, -.346], [.226, .218, .224]);
    const bunPaths = [];
    for (let j = 0; j < 5; j++) {
      const path = [];
      for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 1.6 - .7; path.push([side * .484 + Math.cos(a) * (.175 + j * .005), -.093 + Math.sin(a) * .196, -.346 + (j - 2) * .042]); }
      bunPaths.push(path);
    }
    combineCurves(head, hairLight, bunPaths, .009);
    line(head, hair, [[side * .506, .07, .168], [side * .598, -.084, .179], [side * .559, -.308, .209], [side * .612, -.355, .253], [side * .625, -.284, .245]], .017, 40);
  }
  // Ivory daisy barrette on the right temple, with slender layered petals.
  const clip = new THREE.Group(); clip.position.set(.510, .267, .295); clip.rotation.set(.15, .55, -.28); head.add(clip);
  cluster(clip, pearl, Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return { p: [Math.sin(a) * .068, Math.cos(a) * .068, 0], s: [.021, .074, .013], r: [0, 0, -a] }; }));
  oval(clip, metal, [0, 0, .019], [.033, .033, .018]);

  // Sculpted bodice, satin straps, pleated skirt and an ivory petticoat.
  oval(body, skin, [0, 2.073, .012], [.288, .253, .207]);
  const bodiceGeo = new THREE.CylinderGeometry(.282, .246, .535, 48, 6, false);
  bodiceGeo.scale(1, 1, .76); add(bodiceGeo, satin, body, 0, 1.861, .013);
  for (const side of [-1, 1]) {
    line(body, satinLight, [[side * .222, 1.998, .174], [side * .235, 2.177, .144], [side * .211, 2.251, .019], [side * .211, 2.171, -.139], [side * .218, 2.009, -.173]], .035, 32);
  }
  line(body, lace, [[-.270, 2.108, .059], [-.219, 2.105, .171], [0, 2.067, .226], [.219, 2.105, .171], [.27, 2.108, .059]], .019, 32);
  function dressSurface(topY, bottomY, topR, bottomR, amplitude, material) {
    const vertices = [], indices = [], uvs = [], vertical = 22, around = 120;
    for (let j = 0; j <= vertical; j++) for (let i = 0; i <= around; i++) {
      const t = j / vertical, a = i / around * Math.PI * 2;
      const flare = Math.pow(t, .67), r = topR + (bottomR - topR) * flare + Math.sin(a * 16 + t * .6) * amplitude * Math.pow(t, .7);
      vertices.push(Math.cos(a) * r, topY + (bottomY - topY) * t + Math.sin(a * 16) * .012 * t, Math.sin(a) * r * .91);
      uvs.push(i / around, t);
      if (j < vertical && i < around) { const a0 = j * (around + 1) + i, b = a0 + around + 1; indices.push(a0, a0 + 1, b, b, a0 + 1, b + 1); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(indices); g.computeVertexNormals();
    const m = material.clone(); m.side = THREE.DoubleSide; return add(g, m, skirt);
  }
  dressSurface(1.631, .760, .25, .642, .035, satin);
  dressSurface(1.34, .703, .31, .623, .043, lace);
  // Lace scallops and stitched hem are merged, keeping draw calls modest.
  const scallops = [], hem = [], stitch = [];
  for (let i = 0; i <= 160; i++) {
    const a = i / 160 * Math.PI * 2, r = .642 + Math.sin(a * 16 + .6) * .035;
    hem.push([Math.cos(a) * r, .769 + Math.sin(a * 16) * .012, Math.sin(a) * r * .91]);
    stitch.push([Math.cos(a) * (r - .008), .807 + Math.sin(a * 16) * .010, Math.sin(a) * (r - .008) * .91]);
  }
  line(skirt, satinLight, hem, .013, 160); line(skirt, lace, stitch, .0045, 160);
  for (let i = 0; i < 38; i++) {
    const a = i / 38 * Math.PI * 2, path = [];
    for (let j = 0; j <= 6; j++) { const v = j / 6, theta = a + (v - .5) * .158; path.push([Math.cos(theta) * .631, .716 - Math.sin(v * Math.PI) * .028, Math.sin(theta) * .575]); }
    scallops.push(path);
  }
  combineCurves(skirt, lace, scallops, .007);
  const sash = add(new THREE.CylinderGeometry(.260, .263, .085, 48), satinLight, body, 0, 1.666, .012); sash.scale.z = .8;
  function bow(parent, x, y, z, size = 1, back = false) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(size); if (back) g.rotation.y = Math.PI; parent.add(g);
    for (const side of [-1, 1]) {
      const loop = oval(g, satinLight, [side * .100, .004, 0], [.119, .074, .028]); loop.rotation.z = side * .27;
      line(g, satin, [[side * .027, -.01, .023], [side * .106, -.011, .032], [side * .182, .013, .016]], .005, 18);
      const tail = oval(g, satinLight, [side * .055, -.087, -.001], [.034, .106, .015]); tail.rotation.z = side * .30;
    }
    oval(g, satin, [0, 0, .012], [.033, .046, .031]); return g;
  }
  bow(body, 0, 1.989, .234, .72); bow(body, 0, 1.67, -.212, 1.18, true);
  const beads = [];
  for (let i = 0; i < 27; i++) { const a = i / 27 * Math.PI * 2; beads.push({ p: [Math.cos(a) * .128, 2.233 - Math.max(0, Math.sin(a)) * .023, Math.sin(a) * .127], s: [.018, .018, .018] }); }
  cluster(body, pearl, beads);

  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(side * .295, 2.128, .006); body.add(arm); arms.push(arm);
    oval(arm, skin, [side * .023, -.072, 0], [.111, .137, .11]);
    const upper = oval(arm, skin, [side * .045, -.233, .006], [.089, .185, .091]); upper.rotation.z = side * .105;
    const elbow = new THREE.Group(); elbow.position.set(side * .065, -.395, .008); arm.add(elbow); elbows.push(elbow);
    oval(elbow, skin, [0, -.108, .005], [.075, .15, .079]);
    const hand = new THREE.Group(); hand.position.set(side * .007, -.267, .014); elbow.add(hand); hands.push(hand);
    oval(hand, skin, [0, -.032, .007], [.075, .088, .036]);
    const fingerParts = [];
    for (let f = 0; f < 4; f++) fingerParts.push({ p: [(-1.5 + f) * .030, -.116 + Math.abs(f - 1.5) * .014, .008], s: [.016, .047 - Math.abs(f - 1.5) * .005, .019], r: [0, 0, (f - 1.5) * .055] });
    fingerParts.push({ p: [side * .071, -.039, .025], s: [.025, .048, .024], r: [.12, 0, side * -.61] });
    cluster(hand, skin, fingerParts);

    const leg = new THREE.Group(); leg.position.set(side * .193, 1.085, .014); body.add(leg); legs.push(leg);
    oval(leg, skin, [0, -.22, 0], [.118, .274, .123]);
    const knee = new THREE.Group(); knee.position.set(0, -.431, 0); leg.add(knee); knees.push(knee);
    oval(knee, skin, [0, -.129, 0], [.091, .190, .097]);
    oval(knee, lace, [0, -.311, .012], [.101, .177, .110]);
    const cuff = add(new THREE.CylinderGeometry(.112, .106, .057, 28), lace, knee, 0, -.196, .014);
    const shoe = new THREE.Group(); shoe.position.set(0, -.506, .06); knee.add(shoe);
    oval(shoe, soleMat, [0, -.102, .042], [.151, .047, .233]);
    oval(shoe, shoeMat, [0, -.047, .052], [.149, .087, .228]);
    oval(shoe, shoeMat, [0, .015, -.034], [.119, .105, .126]);
    line(shoe, satinLight, [[-.132, -.016, .08], [-.10, .03, .113], [0, .052, .13], [.10, .03, .113], [.132, -.016, .08]], .023, 24);
    const buckle = add(new THREE.TorusGeometry(.029, .007, 6, 16), metal, shoe, side * .106, .027, .121); buckle.rotation.y = side * .5;
    const toeStitches = [];
    for (let j = 0; j < 8; j++) { const a = -.95 + j / 7 * 1.9; toeStitches.push({ p: [Math.sin(a) * .126, -.085, .052 + Math.cos(a) * .210], s: [.004, .004, .004] }); }
    cluster(shoe, lace, toeStitches);
    const cuffScallops = [];
    for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2; cuffScallops.push({ p: [Math.cos(a) * .106, -.169, .014 + Math.sin(a) * .109], s: [.020, .018, .019] }); }
    cluster(knee, lace, cuffScallops);
  }

  // Animation helpers are optional. Existing root animation can keep rotating
  // the shoulder and hip groups directly; elbows and knees add a second joint.
  function blink(elapsedSeconds) {
    const phase = ((elapsedSeconds % 4.9) + 4.9) % 4.9;
    const closure = phase < .17 ? Math.sin(phase / .17 * Math.PI) : 0;
    eyelids.forEach(update=>update(closure));
  }
  root.userData = { body, skirt, head, smile:smileMesh, arms, elbows, hands, legs, knees, eyeGroups, blink };
  root.updateMatrixWorld(true);
  return root;
}
