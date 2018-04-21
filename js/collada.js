
import THREE from 'three';
import '../lib/ColladaLoader';

const loadedColladas = new Map();

export class Collada {
  constructor(url) {
    this.url = url;
    this.loader = new THREE.ColladaLoader();
  }

  load(cb) {
    const data = loadedColladas.get(this.url);
    let clone;

    if (data !== undefined) {
      clone = this.clone(data.children);
      cb(clone);
      // setTimeout(()=>{cb(clone)}, 1000);
      return;
    }

    this.loader.load(this.url, (collada) => {
      loadedColladas.set(this.url, {
        collada,
        children: collada.scene.children,
      });
      this.children = collada.scene.children;
      this.skin = collada.skins[0];
      // setTimeout(()=>{cb(collada.scene)}, 1000);
      cb(collada.scene);
    });
  }

  static clone(children) {
    const mesh = new THREE.Object3D();
    // let mesh = new THREE.Group();

    children.forEach((child) => {
      const childMesh = new THREE.Mesh(child.geometry, child.material);
      // let childMesh = new THREE.Object3D(child.geometry, child.material);
      childMesh.geometry.dynamic = false;
      childMesh.castShadow = false;
      childMesh.receiveShadow = false;
      childMesh.scale.x = child.scale.x;
      childMesh.scale.y = child.scale.y;
      childMesh.scale.z = child.scale.z;
      childMesh.position.x = child.position.x;
      childMesh.position.y = child.position.y;
      childMesh.position.z = child.position.z;
      childMesh.rotation.x = child.rotation.x;
      childMesh.rotation.y = child.rotation.y;
      childMesh.rotation.z = child.rotation.z;
      mesh.add(childMesh);
    });

    return mesh;
  }
}

export function createCollada(url) {
  const collada = new Collada(url);
  return new Promise(((resolve) => {
    collada.load((data) => {
      resolve(data);
    });
  }));
}
