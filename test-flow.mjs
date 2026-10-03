// Logic-only harness: real Three.js scenes, mocked DOM/renderer. No browser is opened.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createGirl} from './character.js';
import {createGarden} from './garden.js';
import {createOutside,createRoom} from './world.js';
import {createStore} from './state.js';
import {cards,artwork,CARD_COUNT} from './cards.js';
import {createSequence} from './motion.js';
let now=0,frame=null,lastScene=null;
class Element{
 constructor(tag='div'){this.tag=tag;this.children=[];this.style={};this.hidden=false;this.disabled=false;this.open=false;this.listeners={};this.attributes={};const names=new Set();this.classList={add:n=>names.add(n),remove:n=>names.delete(n),toggle:(n,v)=>v?names.add(n):names.delete(n),contains:n=>names.has(n)}}
 append(...a){this.children.push(...a)}appendChild(a){this.children.push(a);return a}replaceChildren(...a){this.children=a}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,f){(this.listeners[k]??=[]).push(f)}focus(){document.activeElement=this}click(){if(!this.disabled)this.onclick?.({target:this})}showModal(){this.open=true}close(){this.open=false;(this.listeners.close||[]).forEach(f=>f())}getContext(){return {fillRect(){},fillText(){},drawImage(){}}}setPointerCapture(){}
}
const html=fs.readFileSync(new URL('page.html',import.meta.url),'utf8');const elements=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
['error','roomPanel','teaPanel','gardenPanel','roomNav'].forEach(id=>elements.get(id).hidden=true);
globalThis.document={body:new Element(),activeElement:new Element(),hidden:false,getElementById:id=>{assert.ok(elements.has(id),'Element exists: '+id);return elements.get(id)},createElement:tag=>new Element(tag),createTextNode:text=>({text}),querySelectorAll:selector=>selector==='#roomNav button'?['navTea','navGarden','navPhotos','navAlbum','back'].map(id=>elements.get(id)):[],addEventListener(){}};
const records=new Map();globalThis.window={localStorage:{getItem:k=>records.get(k)||null,setItem:(k,v)=>records.set(k,v)},addEventListener(){}};
class FakeRenderer{constructor(){this.domElement=new Element('canvas');this.shadowMap={}}setPixelRatio(){}setSize(){}render(scene){lastScene=scene}}
class FakeTextureLoader{load(src,cb){cb(new THREE.Texture())}}
globalThis.requestAnimationFrame=cb=>frame=cb;
const code=fs.readFileSync(new URL('app-complete.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('new THREE.WebGLRenderer(','new FakeRenderer(').replace(/const pmrem=[^\n]+\n/,'').replaceAll('new THREE.TextureLoader()','new FakeTextureLoader()');
const execute=new Function('THREE','createGirl','createGarden','createOutside','createRoom','createStore','cards','artwork','CARD_COUNT','createSequence','FakeRenderer','FakeTextureLoader','matchMedia','innerWidth','innerHeight','devicePixelRatio','performance','setTimeout',code);
execute(THREE,createGirl,createGarden,createOutside,createRoom,createStore,cards,artwork,CARD_COUNT,createSequence,FakeRenderer,FakeTextureLoader,()=>({matches:false}),390,844,1,{now:()=>now},f=>f());
assert.equal(elements.get('error').hidden,true,'Application has no startup error');assert.equal(typeof frame,'function','Application bootstrapped');
const run=seconds=>{for(let i=0;i<Math.ceil(seconds/.02);i++){now+=20;frame(now)}};
const click=id=>elements.get(id).click();const data=()=>JSON.parse(records.get('mom-home-v3'));
run(4.9);assert.equal(elements.get('welcome').hidden,true,'Welcome sequence started automatically');run(15);assert.equal(elements.get('roomPanel').hidden,false,'Welcome reached room');assert.equal(elements.get('roomNav').hidden,false);const doll=lastScene.getObjectByName('Daughter doll');assert.ok(doll);assert.ok(Math.abs(doll.position.x+1.8)<.01);
console.log('PASS: automatic approach, hug, handhold, doorway and room sequence');
click('navTea');assert.equal(elements.get('teaPanel').hidden,false);run(.2);assert.equal(elements.get('sip').disabled,true);run(3.6);assert.equal(elements.get('sip').disabled,false);click('sip');run(3.5);assert.equal(data().teas,1);click('leaveTea');assert.equal(elements.get('roomPanel').hidden,false);
click('navGarden');run(1.5);assert.equal(elements.get('gardenPanel').hidden,false);click('water');run(.2);assert.equal(elements.get('water').disabled,true);run(5);assert.equal(elements.get('water').disabled,false);assert.equal(data().waterings,1);click('plant');assert.equal(data().flowers,2);
// Changing motion preference during an action must not leave it busy forever.
click('water');run(.5);click('motion');run(.2);assert.equal(elements.get('water').disabled,false);click('navTea');run(1);assert.equal(elements.get('teaPanel').hidden,false,'Garden to tea is one action');run(.2);assert.equal(elements.get('sip').disabled,false);click('leaveTea');
console.log('PASS: tea, garden growth, switching destinations, reduced motion mid-action');
const seen=new Set();for(let i=0;i<CARD_COUNT;i++){click('draw');run(.5);assert.equal(elements.get('cardDialog').open,true);seen.add(elements.get('cardText').textContent);click('keepCard')};assert.equal(seen.size,CARD_COUNT);assert.equal(data().collected.length,CARD_COUNT);click('navAlbum');assert.equal(elements.get('albumDialog').open,true);assert.equal(elements.get('albumGrid').children.length,CARD_COUNT);click('closeAlbum');click('navPhotos');assert.equal(elements.get('photoGrid').children.length,4);click('closePhotos');
click('hugInside');run(1);assert.equal(elements.get('roomPanel').hidden,false);assert.ok(Math.abs(doll.position.z+.1)<.01);click('back');run(1);assert.equal(elements.get('welcome').hidden,false);click('hugOutside');run(1);assert.equal(elements.get('welcome').hidden,false);assert.ok(Math.abs(doll.position.z+1.2)<.01);
console.log('PASS: twenty distinct saved cards, album, photo wall, replay hugs and return home');
