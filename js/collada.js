'use strict';

let loadedColladas = new Map();

export class Collada{

  constructor(url){
    this.url = url;
  }

  load(cb){
    let loader,
      clone,
      data = loadedColladas.get(this.url);

    if(data !== undefined) {
      clone = this.clone(data.children);
      cb(clone);
      //setTimeout(()=>{cb(clone)}, 1000);
      return;
    }

    loader = new THREE.ColladaLoader();
    loader.load(this.url, (collada) => {
      loadedColladas.set(this.url,{
        collada: collada,
        children: collada.scene.children
      });
      this.children = collada.scene.children;
      this.skin = collada.skins[0];
      //setTimeout(()=>{cb(collada.scene)}, 1000);
      cb(collada.scene);
    });
  }


  clone(children){
    let mesh = new THREE.Object3D();
    //let mesh = new THREE.Group();

    children.forEach(function (child) {
      let childMesh = new THREE.Mesh(child.geometry, child.material);
      //let childMesh = new THREE.Object3D(child.geometry, child.material);
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

export function createCollada(url){
  let collada = new Collada(url);
  return new Promise(function executor(resolve, reject){
    collada.load(function(data){
      resolve(data);
    });
  });
}