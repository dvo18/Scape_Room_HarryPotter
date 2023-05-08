import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'
 
class Decoracion extends THREE.Object3D {
  constructor() {
    super();
    
    // Creamos las variables para cargar los materiales y objetos:
    var materialLoader = new MTLLoader();
    var objetoLoader = new OBJLoader();

    this.createEstanteria(0.8);
    this.createMesa(materialLoader, objetoLoader);
    this.createTaburete(objetoLoader);
    this.createGatoNegro(materialLoader, objetoLoader);
    this.createFrasco();
  }

  createEstanteria(largo){
    // Primero voy a declarar el material de la estantería:
    var material = new THREE.MeshMatcapMaterial({color: 0x68512A});

    // Ahora creo la geometría de lo que van a ser las tablas de madera:
    var geometriaHorizontal = new THREE.BoxGeometry(0.04, 0.8, 0.25);
    var tablaIZQ = new THREE.Mesh(geometriaHorizontal, material);
    tablaIZQ.position.y = 0.4;

    var tablaDER = tablaIZQ.clone();
    tablaDER.position.x = largo/2;
    tablaIZQ.position.x = -largo/2;

    var geometriaVertical = new THREE.BoxGeometry(largo, 0.03, 0.25);
    var tabla1 = new THREE.Mesh(geometriaVertical, material);
    tabla1.position.y = 0.05;

    var tabla2 = tabla1.clone();
    var tabla3 = tabla1.clone();

    tabla2.position.y = 0.25;
    tabla3.position.y = 0.55;

    this.estanteria = new THREE.Object3D();
    this.estanteria.add(tablaDER);
    this.estanteria.add(tablaIZQ);
    this.estanteria.add(tabla1);
    this.estanteria.add(tabla2);
    this.estanteria.add(tabla3)

    //this.add(this.estanteria)
  }
  
  createMesa(materialLoader, objetoLoader){
    // Creamos un objeto 3D para el taburete.
    this.mesa = new THREE.Object3D();

    materialLoader.load('../modelos/mesa/table.mtl',
    (materiales) => {
      objetoLoader.setMaterials(materiales);
      objetoLoader.load('../modelos/mesa/table.obj',
        (m) => {
            this.mesa.add(m); // Finalmente añadimos la mesa como hijo de Object3D.
        }, null, null);
    });

    this.mesa.scale.x = 0.002;
    this.mesa.scale.y = 0.002;
    this.mesa.scale.z = 0.002;

    //this.add(this.mesa);
  }

  createTaburete(objetoLoader){
    // Creamos un objeto 3D para el taburete.
    this.taburete = new THREE.Object3D();

    // Cargamos la figura OBJ:
    objetoLoader.load('../modelos/taburete/tab.obj',
    (tab) => {
        this.taburete.add(tab); // Lo añadimos al taburete.
    }, null, null);

    this.taburete.scale.x = 0.0008;
    this.taburete.scale.y = 0.0008;
    this.taburete.scale.z = 0.0008;

    //this.add(this.taburete);
  }

  createGatoNegro(materialLoader, objetoLoader){
    // Creamos un objeto 3D para el taburete.
    this.gatoNegro = new THREE.Object3D();

    materialLoader.load('../modelos/Gato2/12222_Cat_v1_l3.mtl',
    (materiales) => {
      objetoLoader.setMaterials(materiales);
      objetoLoader.load('../modelos/Gato2/12222_Cat_v1_l3.obj',
        (gato) => {
            this.gatoNegro.add(gato); // Finalmente añadimos la mesa como hijo de Object3D.
        }, null, null);
    });

    this.gatoNegro.scale.x = 0.01;
    this.gatoNegro.scale.y = 0.01;
    this.gatoNegro.scale.z = 0.01;

    this.gatoNegro.rotateX(-Math.PI/2)

    //this.add(this.gatoNegro);
  }

  createCaldero(){
    // Primero voy a declarar el material del caldero:
    var material = new THREE.MeshMatcapMaterial({color: 0x494949});


  }

  createFrasco(){
    // Para crear una geometría por revolución tenemos que crear un array de puntos:
    this.puntos = [];
    var shape = new THREE.Shape();

    // Definimos el cuerpo de la probeta.
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0, 0.2, 0.25, 0.065, 0.25);
    shape.quadraticCurveTo(0.01, 0.25, 0.020, 0.34)
    shape.bezierCurveTo(0.03, 0.36, 0.06, 0.36, 0.015, 0.38);
    this.puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    this.geometria = new THREE.LatheGeometry(this.puntos, 12, 0, Math.PI*2);
    var material = new THREE.MeshNormalMaterial();
    
    this.probeta = new THREE.Mesh(this.geometria, material);
    this.add(this.probeta);
  }
}

export { Decoracion };