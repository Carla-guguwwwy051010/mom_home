import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createTea} from './tea.js';
const materials=new Map();
function material(color,roughness=.7){const key=`${color}:${roughness}`;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness}));return materials.get(key)}
function add(parent,g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(p,w,h,d,c,x=0,y=0,z=0,r=.045){return add(p,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),material(c),x,y,z)}
function ball(p,r,c,x,y,z){return add(p,new THREE.SphereGeometry(r,20,14),material(c,.45),x,y,z)}
function cylinder(p,top,bottom,h,c,x,y,z){return add(p,new THREE.CylinderGeometry(top,bottom,h,32),material(c),x,y,z)}
function label(text,w=512,h=160,color='#8b6870',bg='#fff3e4'){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.floor(h*.35)}px 'Microsoft YaHei',sans-serif`;ctx.fillText(text,w/2,h/2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t})}
function plant(p,x,y,z,s=1){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);p.add(g);cylinder(g,.25,.19,.42,0xc99383,0,.21,0);for(let i=0;i<5;i++){const a=i*2.4;const stem=box(g,.025,.6,.025,0x708269,Math.cos(a)*.1,.64,Math.sin(a)*.1,.01);stem.rotation.z=Math.sin(a)*.3;const leaf=ball(g,.18,0x8fa28b,Math.cos(a)*.18,.72+Math.sin(a)*.12,Math.sin(a)*.17);leaf.scale.set(.65,1.8,.25);leaf.rotation.z=a}return g}
function bench(p,x,z){for(const a of [-1,1])box(p,.10,.6,.75,0x998371,x+a*.6,.30,z);for(let i=0;i<4;i++)box(p,1.5,.09,.17,0xc8aa91,x,.62,z-.3+i*.2);box(p,1.5,.60,.1,0xc8aa91,x,1.01,z-.40)}
export function createOutside(night){const group=new THREE.Group();
box(group,30,.18,24,0xd9cec0,0,-.10,-2);box(group,9,.18,3,0xc8b5a4,-.5,.01,-3.5);
// The doorway is an opening, not a door placed in front of an unbroken wall.
box(group,2.2,6,.35,0xe4cdc1,-4.05,3,-4.4);box(group,5.1,6,.35,0xe4cdc1,2.45,3,-4.4);box(group,2.5,1.85,.35,0xe4cdc1,-1.7,5.08,-4.4);
box(group,2.55,4.15,.25,0xe9bfa0,-1.7,2.1,-4.65);box(group,2.36,4.03,.1,0xffdfb4,-1.7,2.06,-4.47);
const door=new THREE.Group();door.position.set(-2.94,0,-4.12);group.add(door);box(door,2.45,4.1,.15,0xaf8974,1.23,2.08,0);for(const y of [1.05,2.82]){box(door,1.97,1.35,.06,0xc69e88,1.23,y,.10);box(door,1.70,1.10,.025,0xba907b,1.23,y,.145)}ball(door,.065,0xcfa66d,2.16,1.9,.19);
for(const x of [-3.82,2.22]){box(group,1.43,1.91,.18,0xf7eadd,x,3.27,-4.12);box(group,1.22,1.65,.10,night?0xffd8a0:0xc5d4cd,x,3.27,-4.00);box(group,.045,1.7,.10,0xf7eadd,x,3.27,-3.91);box(group,1.22,.05,.10,0xf7eadd,x,3.27,-3.91);box(group,1.65,.12,.40,0xc7aa94,x,2.29,-3.91);plant(group,x,2.35,-3.9,.6)}
box(group,10,.4,1.35,0xa4817b,-.45,6.05,-4.35);for(let i=0;i<14;i++)box(group,.67,.14,1.45,i%2?0xb4948a:0xc1a096,-4.8+i*.67,6.3,-4.4,.08);
const sign=add(group,new THREE.PlaneGeometry(1.4,.34),label('妈妈的小屋'),-1.7,4.65,-4.09);box(group,1.55,.43,.10,0xae8b74,-1.7,4.65,-4.2);
for(let i=0;i<12;i++)box(group,1.7,.035,.42,i%2?0xccbcaa:0xe1cfbb,-1.7+(i%2)*.08,.015,3.25-i*.54,.08);
for(const x of [-4,1.05])plant(group,x,.08,-3.1,1.65);bench(group,3.7,-3.20);plant(group,5.0,.02,-2.5,1.4);
const porch=new THREE.PointLight(0xffcc96,night?35:12,11);porch.position.set(-1.7,4.1,-3.65);group.add(porch);box(group,.2,.36,.23,0x9c8064,-.20,3.65,-3.95);ball(group,.13,0xffd89e,-.2,3.65,-3.80);
return {group,door};}
export function createRoom(night){const group=new THREE.Group();group.visible=false;
box(group,12.8,.2,12,0xc7a98f,0,-.12,-1.5);for(let i=0;i<26;i++)box(group,.009,.003,12,0xa78b76,-6.1+i*.48,.003,-1.5,0);
box(group,12.8,6,.2,0xe9d9cd,0,3,-6.55);box(group,.2,6,12,0xdfcabc,-6.4,3,-.55);box(group,.2,6,12,0xe9d6c9,6.4,3,-.55);
box(group,12.6,.20,.10,0xf3e7d9,0,.13,-6.40);for(let i=0;i<9;i++){box(group,.045,2.0,.06,0xd9c1b1,-5.6+i*1.4,1.25,-6.39)}box(group,12.6,.055,.055,0xd5bba9,0,2.23,-6.38);
const rug=add(group,new THREE.CircleGeometry(2.7,80),material(0xe6d5c5),-1.0,.012,-2.4);rug.rotation.x=-Math.PI/2;rug.scale.y=.74;
for(let r=2.42;r<2.70;r+=.07){const ring=add(group,new THREE.TorusGeometry(r,.007,4,80),material(0xcab49e),-1,.017,-2.4);ring.rotation.x=-Math.PI/2;ring.scale.y=.74}
const sofa=new THREE.Group();sofa.position.set(-3.20,0,-4);group.add(sofa);for(const x of [-1.6,1.6])for(const z of [-.4,.55])cylinder(sofa,.06,.045,.35,0x96795f,x,.18,z);
box(sofa,3.8,.40,1.6,0xc99f94,0,.6,0,.17);box(sofa,3.8,1.35,.4,0xd7b4a8,0,1.40,-.64,.16);for(const x of [-1.76,1.76])box(sofa,.35,.95,1.60,0xd7b4a8,x,1.03,0,.15);for(const x of [-1.07,0,1.07])box(sofa,1.04,.31,1.25,0xe6cabe,x,.93,.04,.14);
for(const x of [-1.08,1.07]){const pillow=box(sofa,.67,.60,.23,x<0?0xcba7b5:0xeee0c7,x,1.47,-.30,.13);pillow.rotation.z=x*.18;pillow.rotation.x=-.15}
const throwCloth=box(sofa,.64,.06,1.16,0xd8b9c0,1.05,1.12,.14,.02);throwCloth.rotation.y=.10;
// Brass standing lamp with a soft shade.
cylinder(group,.35,.35,.06,0xb29373,-5.4,.06,-4.8);cylinder(group,.028,.028,3.25,0xb29373,-5.4,1.67,-4.8);cylinder(group,.31,.54,.63,0xf5e4c5,-5.4,3.28,-4.8);const lamp=new THREE.PointLight(0xffd0a0,28,10);lamp.position.set(-5.4,2.96,-4.5);group.add(lamp);
// Large window and a curved fabric curtain.
box(group,3.1,2.65,.15,0xf8eadb,3.22,3.7,-6.35);box(group,2.83,2.39,.06,night?0x748098:0xc7d6d0,3.22,3.7,-6.25);box(group,.055,2.45,.07,0xf2e3d3,3.22,3.7,-6.18);box(group,2.86,.055,.07,0xf2e3d3,3.22,3.7,-6.18);box(group,3.45,.12,.45,0xc5aa91,3.22,2.36,-6.13);
for(const side of [-1,1])for(let j=0;j<5;j++){const fabric=cylinder(group,.09,.11,2.75,0xe5c3c6,3.22+side*1.62+j*.07*side,3.65,-6.0);fabric.scale.z=.85}plant(group,4.18,2.44,-6,.75);
const table=new THREE.Group();table.position.set(.15,0,-1.45);group.add(table);box(table,3.7,.17,1.75,0xcba587,0,1,0,.17);for(const x of [-1.4,1.4])for(const z of [-.58,.58]){const leg=box(table,.12,.98,.12,0xac8569,x,.49,z);leg.rotation.z=-x*.05}
const machine=new THREE.Group();machine.position.set(-.50,1.10,-1.6);group.add(machine);box(machine,1.32,1.12,.80,0xdbabb7,0,.56,0,.13);box(machine,1.39,.14,.86,0xf8eadd,0,1.13,0,.04);const machineLabel=add(machine,new THREE.PlaneGeometry(1.05,.27),label('给妈妈的小礼物',512,140),0,.9,.409);
box(machine,1.08,.12,.03,0x835964,0,.64,.41,.035);box(machine,1.08,.055,.18,0xb48692,0,.58,.48,.02);const knob=cylinder(machine,.12,.12,.055,0xd7b174,.38,.29,.43);knob.rotation.x=Math.PI/2;const light=ball(machine,.035,0xffeed6,-.37,.29,.43);
const paper=box(machine,.75,.028,.50,0xfff5e5,0,.64,.43,.006);paper.visible=false;
const tea=createTea();tea.group.position.set(1.20,1.09,-1.45);group.add(tea.group);
const frames=[];for(let i=0;i<3;i++){const x=-2.3+i*1.16;box(group,.97,1.04,.07,0xbda085,x,3.48,-6.32);box(group,.86,.93,.08,0xfff3e3,x,3.48,-6.26);frames.push(add(group,new THREE.PlaneGeometry(.76,.76),new THREE.MeshBasicMaterial({color:0xf4e6da}),x,3.48,-6.20))}
box(group,2.8,.14,.42,0xbfa083,-1.12,2.65,-6.1);plant(group,.1,2.74,-6.06,.5);
plant(group,5.3,0,-4,2);bench(group,4.6,-2.65);
return {group,machine,paper,knob,tea,sofa,frames};
}
