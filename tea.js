import * as THREE from 'three';
export function createTea(){
 const group=new THREE.Group(),rose=new THREE.MeshStandardMaterial({color:0xe7bec5,roughness:.25}),ceramic=new THREE.MeshStandardMaterial({color:0xfff2df,roughness:.23}),gold=new THREE.MeshStandardMaterial({color:0xbe965f,metalness:.65,roughness:.32}),tea=new THREE.MeshStandardMaterial({color:0x99633c,roughness:.2});
 const add=(g,m,p,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
 const pot=new THREE.Group();group.add(pot);pot.position.set(.45,.10,0);
 add(new THREE.SphereGeometry(.30,32,24),ceramic,pot,0,.29,0).scale.y=.9;
 add(new THREE.CylinderGeometry(.23,.24,.08,32),rose,pot,0,.51,0);add(new THREE.SphereGeometry(.06,20,12),gold,pot,0,.59,0);
 const handle=add(new THREE.TorusGeometry(.23,.035,10,32),rose,pot,.30,.31,0);handle.scale.x=.8;
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.23,.28,0),new THREE.Vector3(-.40,.37,0),new THREE.Vector3(-.49,.52,0)]);add(new THREE.TubeGeometry(curve,12,.072,10,false),ceramic,pot);
 const cup=new THREE.Group();cup.position.set(-.38,.04,.14);group.add(cup);
 add(new THREE.CylinderGeometry(.28,.28,.035,40),rose,cup,0,0,0);
 const cupPoints=[new THREE.Vector2(.105,.04),new THREE.Vector2(.16,.10),new THREE.Vector2(.20,.29),new THREE.Vector2(.18,.30),new THREE.Vector2(.14,.10),new THREE.Vector2(.105,.07)];
 const shell=add(new THREE.LatheGeometry(cupPoints,40),ceramic,cup);shell.material.side=THREE.DoubleSide;
 add(new THREE.TorusGeometry(.19,.012,8,40),gold,cup,0,.30,0).rotation.x=Math.PI/2;
 add(new THREE.TorusGeometry(.09,.024,10,24),rose,cup,.22,.20,0);
 const liquid=add(new THREE.CylinderGeometry(.16,.16,.01,32),tea,cup,0,.09,0);
 const stream=add(new THREE.CylinderGeometry(.014,.022,1,10),new THREE.MeshBasicMaterial({color:0xcc9b63,transparent:true,opacity:.65}),group);stream.visible=false;
 const steam=new THREE.Group();cup.add(steam);
 for(let i=0;i<4;i++){const material=new THREE.MeshBasicMaterial({color:0xfff6ee,transparent:true,opacity:0,depthWrite:false});const cloud=add(new THREE.SphereGeometry(.085,12,8),material,steam,(i-1.5)*.055,.4,0);cloud.scale.set(.4,1.8,.4)}
 let progress=-1,elapsed=0,filled=false,sipping=-1;
 const base=new THREE.Vector3(-.38,.04,.14);
 return {group,pot,cup,liquid,stream,get busy(){return progress>=0||sipping>=0},get sipping(){return sipping>=0},pour(){if(progress>=0||sipping>=0)return false;progress=0;filled=false;liquid.position.y=.09;return true},sip(){if(!filled||sipping>=0||progress>=0)return false;sipping=0;return true},reset(){progress=-1;sipping=-1;pot.position.set(.45,.10,0);pot.rotation.z=0;cup.position.copy(base);cup.rotation.set(0,0,0);stream.visible=false},update(dt){elapsed+=dt;if(progress>=0){progress+=dt;const lift=Math.min(progress/.8,1),hold=progress>=.8&&progress<2.5,returning=progress>=2.5;const k=returning?Math.max(0,1-(progress-2.5)/.8):lift;pot.position.y=.10+k*.55;pot.rotation.z=.70*k;stream.visible=hold;if(hold){group.updateMatrixWorld(true);const a=pot.localToWorld(new THREE.Vector3(-.49,.52,0));const b=cup.localToWorld(new THREE.Vector3(0,.15,0));group.worldToLocal(a);group.worldToLocal(b);stream.position.copy(a).add(b).multiplyScalar(.5);stream.scale.y=a.distanceTo(b);stream.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());liquid.position.y=.09+Math.min(1,(progress-.8)/1.7)*.13}if(progress>3.3){progress=-1;filled=true;liquid.position.y=.22;stream.visible=false}}
 if(sipping>=0){sipping+=dt;const k=Math.sin(Math.min(1,sipping/3)*Math.PI);cup.position.set(base.x,base.y+k*.70,base.z+k*.70);cup.rotation.x=.38*k;if(sipping>3){sipping=-1;liquid.position.y=Math.max(.1,liquid.position.y-.025)}}
 steam.children.forEach((o,i)=>{const p=(elapsed*.45+i*.24)%1;o.position.y=.37+p*.7;o.position.x=Math.sin(elapsed+i)*.06;o.material.opacity=filled?Math.sin(p*Math.PI)*.16:0;o.scale.x=.4+p*.8;o.scale.z=.4+p*.8});}};
}
