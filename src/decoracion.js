import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import * as TWEEN from '../libs/tween.esm.js'
import { CSG } from '../libs/CSG-v2.js'
 
class Decoracion extends THREE.Object3D {
  constructor() {
    super();
    
    // Creamos las variables para cargar los materiales y objetos:
    var materialLoader = new MTLLoader();
    var objetoLoader = new OBJLoader();

    this.createEstanteria(0.8);
    this.createMesa(materialLoader, objetoLoader);
    this.createTaburete(objetoLoader);
    this.createGato(materialLoader, objetoLoader);

    this.createFrasco();
    this.createCaldero(materialLoader, objetoLoader);
    this.createSnitch();
    this.createPensadero();
  }

  // ---------------------------------------------------------------

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

  // ---------------------------------------------------------------
  
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

  // ---------------------------------------------------------------

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

  // ---------------------------------------------------------------

  createGato(materialLoader, objetoLoader){
    // Creamos un objeto 3D para el taburete.
    this.gato = new THREE.Object3D();

    materialLoader.load('../modelos/Gato2/12222_Cat_v1_l3.mtl',
    (materiales) => {
      objetoLoader.setMaterials(materiales);
      objetoLoader.load('../modelos/Gato2/12222_Cat_v1_l3.obj',
        (gato) => {
            this.gato.add(gato); // Finalmente añadimos la mesa como hijo de Object3D.
        }, null, null);
    });

    this.gato.scale.x = 0.01;
    this.gato.scale.y = 0.01;
    this.gato.scale.z = 0.01;

    this.gato.rotateX(-Math.PI/2)

    //this.add(this.gato); 
  }

  // ---------------------------------------------------------------

  createCaldero(materialLoader, objetoLoader){
    // Primero voy a hacer el cuerpo del caldero:
    var shape = new THREE.Shape();
    this.puntos = [];

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0, 0.2, 0.25, 0.13, 0.25);
    shape.quadraticCurveTo(0.17, 0.30, 0.11, 0.25);
    this.puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución : geometría y material
    var geometria1 = new THREE.LatheGeometry(this.puntos, 20, 0, Math.PI*2);
    var material1 = new THREE.MeshMatcapMaterial({color: 0x494949});

    var cuerpo = new THREE.Mesh(geometria1, material1);

    // ------------ CONTENIDO  ------------
    var liquido_geom = new THREE.CircleGeometry(0.12, 20);
    var burbujas_geom = new THREE.SphereGeometry(0.01, 20, 20);
    var material2 = new THREE.MeshMatcapMaterial({color: 0x64874A});

    var liquido = new THREE.Mesh(liquido_geom, material2);
    liquido.rotateX(-Math.PI/2);
    liquido.position.y = 0.25;

    var burbuja = new THREE.Mesh(burbujas_geom, material2);
    burbuja.position.y = 0.25;

    var burbuja2 = burbuja.clone();
    var burbuja3 = burbuja.clone();
    var burbuja4 = burbuja.clone();

    // Posiciones de las burbujas.

    burbuja.position.x = 0.08;
    burbuja.position.z = 0.02;

    burbuja2.scale.set(1.4, 1.4, 1.4);
    burbuja2.position.x = -0.02;
    burbuja2.position.z = -0.05;

    burbuja3.position.x = -0.06;

    burbuja4.scale.set(1.4, 1.4, 1.4);
    burbuja4.position.x = 0.03;
    burbuja4.position.z = 0.05;

    // Vamos a animar las burbujas para que suban y bajen, para simular que el líquido está hirviendo.
    // Primero tenemos que declarar las variables de inicio/fin.
    var altura = -0.10; // altura a la que se bajarán las burbujas.
    
    var burbuja_I = { y: 0 };
    var burbuja_F = { y: altura };

    var burbuja2_I = { y: 0 };
    var burbuja2_F = { y: altura };

    var burbuja3_I = { y: 0 };
    var burbuja3_F = { y: altura };
    
    var burbuja4_I = { y: 0 };
    var burbuja4_F = { y: altura };
    
    // Crear los tweens para cada burbuja:
    var animacion_B1 = new TWEEN.Tween(burbuja.position)
    .to(burbuja_F, 1000)
    .onComplete(function () {
        new TWEEN.Tween(burbuja.position.y)
            .to(burbuja_I, 1000)
            .start();
    });
    var animacion_B2 = new TWEEN.Tween(burbuja2.position)
    .to(burbuja2_F, 1000)
    .onComplete(function () {
        new TWEEN.Tween(burbuja2.position)
            .to(burbuja2_I, 1000)
            .start();
    });
    var animacion_B3 = new TWEEN.Tween(burbuja3.position)
    .to(burbuja3_F, 1000)
    .onComplete(function () {
        new TWEEN.Tween(burbuja3.position)
            .to(burbuja3_I, 1000)
            .start();
    });
    var animacion_B4 = new TWEEN.Tween(burbuja4.position)
    .to(burbuja4_F, 1000)
    .onComplete(function () {
        new TWEEN.Tween(burbuja.position)
            .to(burbuja4_I, 1000)
            .start();
    });

    // Anidamos las animaciones y comenzamos:
    animacion_B1.chain(animacion_B2);
    animacion_B2.chain(animacion_B3);
    animacion_B3.chain(animacion_B4);
    animacion_B4.chain(animacion_B1);

    animacion_B1.start();

    // ----------------

    var contenido = new THREE.Object3D();
    contenido.add(liquido);
    contenido.add(burbuja);
    contenido.add(burbuja2);
    contenido.add(burbuja3);
    contenido.add(burbuja4);

    // ------------ LAS ASAS ------------

    var asas_geom = new THREE.TorusGeometry(0.025, 0.007, 16, 100);
    var sujeccion_geom = new THREE.SphereGeometry(0.015, 20, 20);
    var material3 = new THREE.MeshMatcapMaterial({color: 0xE3E3E3});

    var asa = new THREE.Mesh(asas_geom, material1);
    asa.rotateY(Math.PI/2);
    asa.position.y = 0.15;

    var asa2 = asa.clone();
    asa2.position.x = -0.18;
    asa.position.x = 0.18;

    var sujeccion = new THREE.Mesh(sujeccion_geom, material3);
    sujeccion.position.y = 0.175;

    var sujeccion2 = sujeccion.clone();
    sujeccion2.position.x = -0.18;
    sujeccion.position.x = 0.18;

    var asas = new THREE.Object3D();
    asas.add(asa);
    asas.add(asa2);
    asas.add(sujeccion);
    asas.add(sujeccion2);

    // ------------ BASE ------------
    var base = new THREE.Object3D();

    materialLoader.load('../modelos/baseCaldero/Blank.mtl',
    (materiales) => {
      objetoLoader.setMaterials(materiales);
      objetoLoader.load('../modelos/baseCaldero/20841_Copper_Fire_Pit_v1.obj',
        (aux) => {
            base.add(aux); // Añadimos la base del caldero.
        }, null, null);
    });

    base.scale.x = 0.04;
    base.scale.y = 0.04;
    base.scale.z = 0.04;

    base.rotateX(-Math.PI/2);
    base.position.y = -0.05;

    // ------------ CALDERO FINAL ------------

    this.caldero = new THREE.Object3D();
    this.caldero.add(cuerpo);
    this.caldero.add(contenido);
    this.caldero.add(asas);
    this.caldero.add(base);
    //this.add(this.caldero);
  }

  // ---------------------------------------------------------------

  createFrasco(){
    // Para crear una geometría por revolución tenemos que crear un array de puntos:
    this.puntos = [];
    var shape = new THREE.Shape();

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0, 0.2, 0.25, 0.065, 0.25);
    shape.quadraticCurveTo(0.01, 0.25, 0.020, 0.34)
    shape.bezierCurveTo(0.04, 0.35, 0.04, 0.37, 0.015, 0.38);
    this.puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var geometria = new THREE.LatheGeometry(this.puntos, 12, 0, Math.PI*2);
    var material = new THREE.MeshNormalMaterial();
    
    this.frasco = new THREE.Mesh(geometria, material);
    //this.add(this.frasco);
  }

  // ---------------------------------------------------------------

  createSnitch(){
    // --------------- EL CUERPO ---------------
    // Primero creo la forma que quiero con un objeto Shape para después crear la extrusión.
    var shape1 = new THREE.Shape();

    // Definimos el cuerpo de la snitch mediante barrido de una forma:
    const radio = 0.05;
    const segmentos = 10;

    // Crear un círculo con el shape.
    for (let i = 0; i <= 12; i++) {
        const angulo = (i / segmentos) * Math.PI*2;
        shape1.lineTo(Math.cos(angulo)*radio, Math.sin(angulo)*radio);
    }

    // Crear la trayectoria del barrido del contorno para hacer una esfera:
    const circulo = new THREE.CatmullRomCurve3();

    for (let i = 0; i <= segmentos; i++) {
        const angulo = (Math.PI / segmentos-1);
        const x = Math.cos(angulo*i - (Math.PI/2)) * radio;
        const y = Math.sin(angulo*i - (Math.PI/2)) * radio;

        circulo.points.push(new THREE.Vector3(x, y, 0));
    }
    
    var opciones = {steps: 25, bevelEnabled: false, extrudePath: circulo};

    // Creamos la geometría con el shape y las opciones. Después creamos el material.
    var geometria1 = new THREE.ExtrudeGeometry(shape1, opciones);
    var material1 = new THREE.MeshMatcapMaterial({color: 0xD6C359});
    
    // Finalmente construimos el shape y lo añadimos como hijo de Object3D.
    var cuerpo = new THREE.Mesh(geometria1, material1);
    
    // --------------- LAS ALAS ---------------

    // Primero creo la forma que quiero con un objeto Shape para después crear la extrusión.
    var shape = new THREE.Shape();

    // Definimos el cuerpo de la ala.
    shape.moveTo(0, 0);
    shape.lineTo(2, 1.2);
    shape.lineTo(4, 1.5);
    shape.lineTo(6, 1.5);
    shape.lineTo(6.5, 1.7);
    shape.lineTo(6.7, 2);
    shape.lineTo(7, 2.3);
    shape.lineTo(7.3, 2.6);
    shape.lineTo(8, 6);
    shape.lineTo(7, 5);
    shape.lineTo(6, 4);
    shape.lineTo(5, 4);
    shape.lineTo(3.5, 3.5);
    shape.lineTo(0, 0);

    var opciones = {depth: 0.5, steps: 1, curveSegments: 2, bevelThickness: 1, bevelSize: 1, bevelSegments: 4};

    //Creamos la geometría con el shape y las opciones. Después creamos el material.
    var geometria2 = new THREE.ExtrudeGeometry(shape, opciones);
    var material2 = new THREE.MeshMatcapMaterial({color: 0xFFFFFF});
    
    // Finalmente construimos el shape y lo añadimos como hijo de Object3D.
    var ala1 = new THREE.Mesh(geometria2, material2);
    
    ala1.scale.x = 0.03;
    ala1.scale.y = 0.03;
    ala1.scale.z = 0.03;

    var ala2 = ala1.clone();
    ala2.rotateY(Math.PI);

    ala1.position.x = 0.09;
    ala1.position.y = 0.05;
    ala2.position.x = -0.09;
    ala2.position.y = 0.05;

    this.snitch = new THREE.Object3D();
    this.snitch.add(ala1);
    this.snitch.add(ala2);
    this.snitch.add(cuerpo);

    //this.add(this.snitch);
  }

  createPensadero(){
    // ---------- CUERPO ----------
    var cuerpo_geom = new THREE.CapsuleGeometry(0.5, 0.6, 9, 7);
    var cubo_geom = new THREE.BoxGeometry(1.1,1.1,1.1);
    var cilindro_geom = new THREE.CylinderGeometry(0.4, 0.3, 0.6, 10);
    var circulo_geom = new THREE.CircleGeometry(0.4, 20);
    var torus_geom = new THREE.TorusGeometry(0.49, 0.04, 20, 20);

    var material = new THREE.MeshMatcapMaterial({color: 0xF1ECDA});
    var material2 = new THREE.MeshMatcapMaterial({color: 0x6CC5DE});
    
    var cilindro_CSG = new THREE.Mesh(cilindro_geom, material);
    var cubo_CSG = new THREE.Mesh(cubo_geom, material);
    var anillo_CSG = new THREE.Mesh(torus_geom, material);

    cubo_CSG.position.y = 0.55;
    cilindro_CSG.position.y = 0.5;

    anillo_CSG.rotateX(Math.PI/2);
    anillo_CSG.position.y = 0.4;

    var liquido = new THREE.Mesh(circulo_geom, material2);
    liquido.rotateX(-Math.PI/2);
    liquido.position.y = 0.6;

    // Creamos el objeto CSG y oepramos con él:
    var cuerpo_base = new THREE.Mesh(cuerpo_geom, material);
    cuerpo_base = new CSG().subtract([cuerpo_base, cubo_CSG]).toMesh();
    cuerpo_base.position.y = 0.7;

    cuerpo_base = new CSG().subtract([cuerpo_base, cilindro_CSG]).toMesh();
    cuerpo_base = new CSG().union([cuerpo_base, anillo_CSG]).toMesh();

    var cuerpo = new THREE.Object3D();
    cuerpo.add(cuerpo_base);
    cuerpo.add(liquido);

    cuerpo.position.y = 0.6;

    // ---------- BASE ----------
    var shape = new THREE.Shape();
    var puntos = [];

    shape.moveTo(0.5, 0);
    shape.quadraticCurveTo(0.1, 0.2, 0.16, 0.6);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var base_geom = new THREE.LatheGeometry(puntos, 7, 0, Math.PI*2);
    var base = new THREE.Mesh(base_geom, material);

    // ------------------
    this.pensadero = new THREE.Object3D();
    this.pensadero.add(cuerpo);
    this.pensadero.add(base);

    this.add(this.pensadero);
  }
}

export { Decoracion };