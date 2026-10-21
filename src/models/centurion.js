import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { BASE } from '../materials.js';
const cache = new Map();
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
export async function preloadPanels() {
  await Promise.all(['o110','o160','v21','v24','c112'].flatMap(id => ['ext','int'].map(async side => {
    const key=`${id}_${side}`;
    cache.set(key,(await loader.loadAsync(`${BASE}models/centurion/${key}.glb`)).scene);
  })));
}
export function panelMesh(key, width, height, sign, mats) {
  const template=cache.get(key);
  if (!template) throw new Error(`Panel not loaded: ${key}`);
  const group=template.clone(true);
  group.scale.set(sign*width,height/2,1);
  // The continuous steel leaf casts the door silhouette. Fine milling receives
  // architectural shadows but does not re-cast submillimetre shadow-map acne.
  group.traverse(o=>{ if(o.isMesh) { o.geometry=o.geometry.clone(); if(o.geometry.index && o.geometry.attributes.uv) o.geometry.computeTangents(); o.material=mats[o.material.name] || o.material; o.castShadow=false;o.receiveShadow=true; }});
  return group;
}
function hardware(id,inside) {
  const e=.065;
  if(id==='o110')return [{type:'lever',e,y:1.02},{type:'keyhole',e,y:.93}];
  return [
    {type:'peephole',e,y:1.47},
    {type:id==='c112'?'cylinder':'keyhole',e,y:1.24},
    ...(inside?[{type:'latch',e,y:1.13}]:[]),
    {type:'lever',e,y:1.025},{type:'cylinder',e,y:.94},
  ];
}
export const CENTURION_DESIGNS = Object.fromEntries(['o110','o160','v21','v24','c112'].flatMap(id=>['ext','int'].map(side=>[`${id}_${side}`,()=>({regions:[],hw:hardware(id,side==='int')})])));
