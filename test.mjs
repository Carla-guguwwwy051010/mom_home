import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStore,cleanState,STORAGE_KEY} from './state.js';
import {cards,artwork,CARD_COUNT} from './cards.js';
import {createSequence} from './motion.js';
import {createTea} from './tea.js';
import {createGarden} from './garden.js';
import {createGirl} from './character.js';
const storage={value:null,getItem(){return this.value},setItem(k,v){assert.equal(k,STORAGE_KEY);this.value=v}};
const store=createStore(storage);store.visit();store.plant();store.water();store.tea();assert.deepEqual([store.data.visits,store.data.flowers,store.data.waterings,store.data.teas],[1,2,1,1]);
assert.equal(CARD_COUNT,20);assert.equal(new Set(cards.map(card=>card.title)).size,CARD_COUNT);assert.equal(new Set(cards.map(card=>card.text)).size,CARD_COUNT);assert.ok(cards.every(card=>artwork.includes(card.image)));
for(let batch=0;batch<5;batch++){const last=store.data.lastCard,draws=Array.from({length:CARD_COUNT},()=>store.draw());assert.equal(new Set(draws).size,CARD_COUNT);assert.notEqual(draws[0],last)}
assert.equal(store.data.collected.length,CARD_COUNT);const restored=createStore(storage);assert.deepEqual(restored.data,store.data);
const corrupt=createStore({getItem(){return '{broken'},setItem(){throw Error()}});corrupt.visit();assert.equal(corrupt.data.visits,1);assert.equal(corrupt.persistent,false);
const unavailable=createStore(null);unavailable.draw();assert.equal(unavailable.persistent,false);assert.equal(unavailable.data.collected.length,1);
const cleaned=cleanState({visits:Infinity,waterings:-9,flowers:'abc',collected:[1,1,NaN,4,40,-1,'3'],photos:['javascript:alert(1)']});assert.deepEqual(cleaned.collected,[1,4]);assert.deepEqual(cleaned.photos,[]);assert.equal(cleaned.visits,0);
const legacy=cleanState({visits:7,collected:[0,3],bag:[1,2],lastCard:3});assert.deepEqual(legacy.collected,[0,3]);assert.deepEqual(legacy.bag,[]);assert.equal(legacy.deckSize,CARD_COUNT);
console.log('PASS: twenty unique notes, persistence, four-card migration, card bags and replay');
const calls=[],sequence=createSequence();sequence.play([{duration:.2,update:p=>calls.push(['first',p])},{duration:.4,update:p=>calls.push(['second',p])}],()=>calls.push(['done']));assert.equal(sequence.play([],()=>{}),false);sequence.update(.15);sequence.update(.15);assert.equal(calls.filter(c=>c[0]==='second').length,0);assert.equal(sequence.time,0);sequence.update(.1);assert.equal(calls.at(-1)[0],'second');assert.equal(calls.at(-1)[1],.25);for(let i=0;i<8;i++)sequence.update(.1);assert.equal(calls.filter(c=>c[0]==='done').length,1);assert.equal(sequence.busy,false);
const gentle=createSequence(()=>true);let reached=0;gentle.play([{duration:8,end:()=>reached++},{duration:8,end:()=>reached++}]);gentle.update(.15);assert.equal(reached,1);gentle.update(.15);assert.equal(reached,2);console.log('PASS: sequential actions cannot inherit elapsed time; reduced motion completes');
const tea=createTea();assert.equal(tea.sip(),false);assert.equal(tea.pour(),true);assert.equal(tea.pour(),false);for(let i=0;i<80;i++)tea.update(.02);assert.equal(tea.stream.visible,true);assert.ok(tea.liquid.position.y>.09);for(let i=0;i<100;i++)tea.update(.02);assert.equal(tea.busy,false);assert.equal(tea.stream.visible,false);assert.equal(tea.sip(),true);assert.equal(tea.pour(),false);for(let i=0;i<160;i++)tea.update(.02);assert.equal(tea.busy,false);assert.ok(tea.liquid.position.y<.22);tea.pour();tea.update(4);assert.equal(tea.liquid.position.y,.22);tea.reset();assert.equal(tea.stream.visible,false);console.log('PASS: visible tea pouring, mutual exclusion, sip and reset');
const garden=createGarden();garden.setGrowth(8,true);assert.equal(garden.plants.length,12);assert.equal(garden.water(),true);assert.equal(garden.water(),false);for(let i=0;i<100;i++)garden.update(.02,i*.02);assert.equal(garden.droplets.visible,true);for(let i=0;i<160;i++)garden.update(.02,2+i*.02);assert.equal(garden.busy,false);assert.equal(garden.droplets.visible,false);console.log('PASS: garden growth, watering droplets, repeat guard and completion');
const girl=createGirl();const box=new THREE.Box3().setFromObject(girl);assert.ok(box.max.y>3&&box.max.y<3.8);assert.ok(box.min.y>-.03);assert.equal(girl.userData.arms.length,2);
const face=girl.userData.head.children.find(o=>o.isMesh&&o.geometry.attributes.color);assert.ok(face,'Cheek color is part of the face mesh');
const faceColor=face.geometry.attributes.color.array;assert.ok(Math.max(...faceColor.filter((_,i)=>i%3===1))-Math.min(...faceColor.filter((_,i)=>i%3===1))>.015,'Cheek color is blended into the skin');
for(const eye of girl.userData.eyeGroups){const patches=eye.children.filter(o=>o.geometry?.type==='CircleGeometry');assert.equal(patches.length,3,'Eye white, iris and pupil are fitted surfaces');for(const patch of patches){patch.geometry.computeBoundingBox();assert.ok(patch.geometry.boundingBox.max.z<.07,'Eye surfaces do not bulge from the cheeks')}}
girl.userData.blink(.085);
for(const eye of girl.userData.eyeGroups){assert.equal(eye.scale.y,1,'Blinking does not squash the eye');assert.ok(eye.children.some(o=>o.isMesh&&o.geometry.type==='BufferGeometry'&&o.geometry.index?.count===24*4*6&&o.visible),'A curved eyelid covers the eye')}
girl.userData.blink(.3);
for(const eye of girl.userData.eyeGroups)assert.ok(!eye.children.some(o=>o.isMesh&&o.geometry.type==='BufferGeometry'&&o.geometry.index?.count===24*4*6&&o.visible),'Eyelid reopens after blinking');
let meshes=0;for(const model of [girl,garden.group,tea.group])model.traverse(o=>{if(o.isMesh){meshes++;const array=o.geometry.attributes.position.array;for(const n of array)assert.ok(Number.isFinite(n))}});for(let i=0;i<50;i++)girl.userData.blink(i*.2);console.log('PASS: face color, fitted eyes, 3D geometry and articulation ('+meshes+' meshes)');
// Build scene labels without a browser or a graphics context; validate scene construction.
globalThis.document={createElement(){return {width:0,height:0,getContext(){return {fillRect(){},fillText(){}}}}}};
const {createOutside,createRoom}=await import('./world.js');const outdoor=createOutside(true),room=createRoom(true);assert.ok(outdoor.door.children.length>0);assert.equal(room.frames.length,3);assert.equal(room.paper.visible,false);assert.ok(room.tea.group.children.length>0);console.log('PASS: exterior doorway, interior furniture, photo frames and card machine construction');
