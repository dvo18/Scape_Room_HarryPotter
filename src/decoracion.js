import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import * as TWEEN from '../libs/tween.esm.js'
import { CSG } from '../libs/CSG-v2.js' 
 
class Decoracion extends THREE.Object3D {
  constructor() {
    super();
    
    // Creamos las variables para cargar los materiales y objetos:
    this.materialLoader = new MTLLoader();
    this.objetoLoader = new OBJLoader();
    this.texturaLoader = new THREE.TextureLoader();
  }

  // ---------------------------------------------------------------

  createEstanteria(largo, tipo){
    // --------- TEXTURAS ---------
    var textura_madera = this.texturaLoader.load ('../imgs/textura_madera1.jpg');

    // Primero voy a declarar el material de la estantería:
    var material = new THREE.MeshLambertMaterial({color: 0x745E45, map: textura_madera});

    // Ahora creo la geometría de lo que van a ser las tablas de madera:
    var geometriaHorizontal = new THREE.BoxGeometry(0.04, 0.8, 0.3);
    var tablaIZQ = new THREE.Mesh(geometriaHorizontal, material);
    tablaIZQ.position.y = 0.4;

    var tablaDER = tablaIZQ.clone();
    tablaDER.position.x = largo/2 - 0.02;
    tablaIZQ.position.x = -largo/2 + 0.02;

    var geometriaVertical = new THREE.BoxGeometry(largo, 0.03, 0.3);
    var tabla1 = new THREE.Mesh(geometriaVertical, material);
    tabla1.position.y = 0.05;

    var tabla2 = tabla1.clone();
    var tabla3 = tabla1.clone();

    tabla2.position.y = 0.25;
    tabla3.position.y = 0.55;

    this.estanteria = new THREE.Object3D();
    this.estanteria.add(tablaDER, tablaIZQ, tabla1, tabla2, tabla3);

    this.estanteria.scale.y = 1.5;

    if(tipo == 1){

    }

    return this.estanteria;
  }

  // ---------------------------------------------------------------

  createLibro(){
    // Creamos un objeto 3D para el taburete.
    var libro = new THREE.Object3D();

    this.materialLoader.load('../modelos/libro/book.mtl',
    (materiales) => {
      this.objetoLoader.setMaterials(materiales);
      this.objetoLoader.load('../modelos/libro/book.obj',
        (lib) => {
            libro.add(lib); // Finalmente añadimos la mesa como hijo de Object3D.
        }, null, null);
    });

    // libro.scale.x = 0.01;
    // libro.scale.y = 0.01;
    // libro.scale.z = 0.01;

    return this.libro; 
  }

  // ---------------------------------------------------------------
  
  createMesa(){
    // --------- TEXTURAS ---------
    var textura_madera = this.texturaLoader.load ('../imgs/textura_madera.jpg');

    // Creamos un objeto 3D para el taburete.
    this.mesa = new THREE.Object3D();

    this.objetoLoader.load('../modelos/mesa/table.obj',
    (m) => {
        // Creamos un nuevo material básico con la textura de caldero.
        var material = new THREE.MeshLambertMaterial({
            color: 0xB0915E,
            map: textura_madera
        });

        // Asignamos el material al objeto OBJ.
        m.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });

        // Añadimos la mesa como hijo de Object3D.
        this.mesa.add(m);
    }, null, null);

    this.mesa.scale.x = 0.002;
    this.mesa.scale.y = 0.002;
    this.mesa.scale.z = 0.002;

    this.add(this.mesa);

    return this.mesa;
  }

  // ---------------------------------------------------------------

  createTaburete(){
    // Creamos un objeto 3D para el taburete.
    this.taburete = new THREE.Object3D();

    // Cargamos la figura OBJ:
    this.objetoLoader.load('../modelos/taburete/tab.obj',
    (tab) => {
        this.taburete.add(tab); // Lo añadimos al taburete.
    }, null, null);

    this.taburete.scale.x = 0.0008;
    this.taburete.scale.y = 0.0008;
    this.taburete.scale.z = 0.0008;

    return this.taburete;
  }

  // ---------------------------------------------------------------

  createGato(){
    // Creamos un objeto 3D para el taburete.
    this.gato = new THREE.Object3D();

    this.materialLoader.load('../modelos/Gato2/12222_Cat_v1_l3.mtl',
    (materiales) => {
      this.objetoLoader.setMaterials(materiales);
      this.objetoLoader.load('../modelos/Gato2/12222_Cat_v1_l3.obj',
        (gato) => {
            this.gato.add(gato); // Finalmente añadimos la mesa como hijo de Object3D.
        }, null, null);
    });

    this.gato.scale.x = 0.01;
    this.gato.scale.y = 0.01;
    this.gato.scale.z = 0.01;

    this.gato.rotateX(-Math.PI/2)

    return this.gato; 
  }

  // ---------------------------------------------------------------

  createCaldero(){
    // --------- TEXTURAS ---------
    var textura_caldero = this.texturaLoader.load ('../imgs/textura_caldero_2.jpg');
    var textura_liquido = this.texturaLoader.load('../imgs/textura_liquido.jpg');
    var textura_metal = this.texturaLoader.load('../imgs/textura_metal.jpg');

    // Primero voy a hacer el cuerpo del caldero:
    var shape = new THREE.Shape();
    var puntos = [];

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0, 0.2, 0.25, 0.13, 0.25);
    shape.quadraticCurveTo(0.17, 0.30, 0.11, 0.25);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución : geometría y material
    var geometria1 = new THREE.LatheGeometry(puntos, 20, 0, Math.PI*2);
    var material1 = new THREE.MeshPhongMaterial({map: textura_caldero});

    var cuerpo = new THREE.Mesh(geometria1, material1);

    // ------------ CONTENIDO  ------------
    var liquido_geom = new THREE.CircleGeometry(0.12, 20);
    var burbujas_geom = new THREE.SphereGeometry(0.01, 20, 20);
    var material2 = new THREE.MeshPhongMaterial({color: 0x8FC269, map: textura_liquido});

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

    // ------------------------------------
    // Vamos a animar las burbujas para que suban y bajen, para simular que el líquido está hirviendo.
    var splineBurbuja1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0.11, 0.02),
      new THREE.Vector3(0.08, 0.22, 0.02),
      new THREE.Vector3(0.08, 0.32, 0.02),
      new THREE.Vector3(0.08, 0.42, 0.02),
      new THREE.Vector3(0.08, 0.52, 0.02)
    ]);

    var splineBurbuja2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.25, -0.05),
      new THREE.Vector3(-0.02, 0.22, -0.05),
      new THREE.Vector3(-0.02, 0.15, -0.05),
      new THREE.Vector3(-0.02, 0.08, -0.05),
      new THREE.Vector3(-0.02, -0.10, -0.05)
    ]);

    var splineBurbuja3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.25, 0.0),
      new THREE.Vector3(-0.06, 0.22, 0.0),
      new THREE.Vector3(-0.06, 0.15, 0.0),
      new THREE.Vector3(-0.06, 0.08, 0.0),
      new THREE.Vector3(-0.06, -0.10, 0.0)
    ]);

    var splineBurbuja4 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.03, 0.25, 0.05),
      new THREE.Vector3(0.03, 0.22, 0.05),
      new THREE.Vector3(0.03, 0.15, 0.05),
      new THREE.Vector3(0.03, 0.08, 0.05),
      new THREE.Vector3(0.03, -0.10, 0.05)
    ]);

    // -----------
    var origen = { p : 0 } ; // 0 representa el principio.
    var destino = { p : 1 } ; // representa el final.

    var animacion1 = new TWEEN.Tween(origen).to(destino, 4000)
    .onUpdate(() => {
      burbuja.position.copy(splineBurbuja1.getPoint(animacion1._object.p));
    })
    .repeat(Infinity)
    .onComplete(function(){
      origen.p = 0;
    })
    .delay(Math.random() * 3000)
    .start();
/*
    var animacion2 = new TWEEN.Tween(origen).to(destino, 3000)
    .onUpdate(() => {
      var position = splineBurbuja2.getPoint(animacion2._object.t);
      burbuja2.position.copy(position);
    })
    .repeat(Infinity)
    .onComplete(function(){
      origen.p = 0; 
    });

    var animacion3 = new TWEEN.Tween(origen).to(destino, 3000)
    .onUpdate(() => {
      var position = splineBurbuja3.getPoint(animacion3._object.t);
      burbuja3.position.copy(position);
    })
    .repeat(Infinity)
    .onComplete(function(){
      origen.p = 0; 
    });

    var animacion4 = new TWEEN.Tween(origen).to(destino, 3000)
    .onUpdate(() => {
      var position = splineBurbuja4.getPoint(animacion4._object.t);
      burbuja4.position.copy(position);
    })
    .repeat(Infinity)
    .onComplete(function(){
      origen.p = 0; 
    });*/

    // Agrega un retardo aleatorio a cada animación para que las burbujas no suban y bajen al mismo tiempo.
    /*animacion2.delay(Math.random() * 3000);
    animacion3.delay(Math.random() * 3000);
    animacion4.delay(Math.random() * 3000);*/

    // Comienza la animación.
    /*animacion1.chain(animacion2);
    animacion2.chain(animacion3);
    animacion3.chain(animacion4);
    animacion4.chain(animacion1);*/

    // ----------------

    var contenido = new THREE.Object3D();
    contenido.add(liquido);
    contenido.add(burbuja, burbuja2, burbuja3, burbuja4);

    // ------------ LAS ASAS ------------
    var asas_geom = new THREE.TorusGeometry(0.025, 0.007, 16, 100);
    var sujeccion_geom = new THREE.SphereGeometry(0.015, 20, 20);
    var material3 = new THREE.MeshLambertMaterial({color: 0xE3E3E3, map: textura_metal});

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
    asas.add(asa, asa2, sujeccion, sujeccion2);

    // ------------ BASE ------------
    var base = new THREE.Object3D();

    this.materialLoader.load('../modelos/baseCaldero/Blank.mtl',
    (materiales) => {
      this.objetoLoader.setMaterials(materiales);
      this.objetoLoader.load('../modelos/baseCaldero/20841_Copper_Fire_Pit_v1.obj',
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

    var caldero = new THREE.Object3D();
    caldero.add(cuerpo, contenido, asas, base);

    caldero.scale.x = 1.5;
    caldero.scale.z = 1.5;
    caldero.rotateY(Math.PI);
    caldero.position.y = 0.045;

    var caldero_resultado = new THREE.Object3D();
    caldero_resultado.add(caldero);

    return caldero_resultado;
  }

  // ---------------------------------------------------------------

  createFrasco(colorFrasco, colorLiquido){
    // --------- TEXTURAS ---------
    var textura_frasco = this.texturaLoader.load ('../imgs/textura_frasco.jpg');
    var textura_corcho = this.texturaLoader.load ('../imgs/textura_corcho.jpg');

    // ------------ CUERPO ------------
    // Para crear una geometría por revolución tenemos que crear un array de puntos:
    var puntos = [];
    var shape = new THREE.Shape();

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0, 0.2, 0.25, 0.065, 0.25);
    shape.quadraticCurveTo(0.01, 0.25, 0.020, 0.34)
    shape.bezierCurveTo(0.04, 0.35, 0.04, 0.37, 0.015, 0.38);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var geometria = new THREE.LatheGeometry(puntos, 12, 0, Math.PI*2);
    var material = new THREE.MeshLambertMaterial({color: colorFrasco, map: textura_frasco, transparent: true, opacity: 0.8, side: THREE.DoubleSide});
    
    var frasco_base = new THREE.Mesh(geometria, material);

    // ------------ CONTENIDO ------------
    var cubo_CSG = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,0.25), material);
    var esfera_CSG = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshLambertMaterial({color: colorLiquido}));
    esfera_CSG.position.y = 0.14;
    cubo_CSG.position.y = 0.29;

    var liquido = new CSG().subtract([esfera_CSG, cubo_CSG]).toMesh();
    liquido.scale.x = 1.1;
    liquido.scale.z = 1.1;

    // ------------ TAPÓN ------------
    var material2 = new THREE.MeshLambertMaterial({color: 0xC2A36D, map: textura_corcho});
    var tapon = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.025), material2);
    tapon.position.y = 0.38;

    // --------------
    this.frasco = new THREE.Object3D;
    this.frasco.add(frasco_base, liquido, tapon);

    return this.frasco;
  }

  // ---------------------------------------------------------------

  createPocion(colorFrasco, colorLiquido, altura){
    // --------- TEXTURAS ---------
    var textura_cristal = this.texturaLoader.load ('../imgs/textura_cristal.jpg');
    var textura_corcho = this.texturaLoader.load ('../imgs/textura_corcho.jpg');

    // ------------ CUERPO ------------
    // Para crear una geometría por revolución tenemos que crear un array de puntos:
    var puntos = [];
    var shape = new THREE.Shape();

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0.1, 0);
    shape.lineTo(0.1, altura);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var geometria = new THREE.LatheGeometry(puntos, 12, 0, Math.PI*2);
    var material = new THREE.MeshLambertMaterial({color: colorFrasco, map: textura_cristal, transparent: true, opacity: 0.8, side: THREE.DoubleSide});
    
    var pocion_base = new THREE.Mesh(geometria, material);

    // ------------ CONTENIDO ------------
    var liquido_geom = new THREE.CylinderGeometry(0.09, 0.09, 0.2, 20);
    var material2 = new THREE.MeshLambertMaterial({color: colorLiquido});

    var liquido = new THREE.Mesh(liquido_geom, material2);
    liquido.position.y = 0.12;

    // ------------ TAPÓN ------------
    var material3 = new THREE.MeshLambertMaterial({color: 0xC2A36D, map: textura_corcho});
    var tapon = new THREE.Mesh(new THREE.CylinderGeometry(0.096,0.096,0.03, 20), material3);
    tapon.position.y = altura;

    // --------------
    var pocion = new THREE.Object3D();
    pocion.add(pocion_base, liquido, tapon);
    pocion.rotateY(Math.PI);

    return pocion;
  }

  // ---------------------------------------------------------------

  createCuadro(imagen, ancho, largo) {
    
  
    // Dimensiones del marco
    var marco_ancho = ancho + 0.1; // Ancho del marco (mayor que la imagen)
    var marcho_alto = largo + 0.1; // Alto del marco (mayor que la imagen)
    var profundidad = 0.05; // Profundidad del marco

    // --------------------------------------
    // Crear geometría del marco
    var marcoGeom = new THREE.BoxGeometry(marco_ancho, marcho_alto, profundidad);
    var marcoTexture = this.texturaLoader.load('../imgs/cuadros/textura_marco_cuadro.png');
    var marcoMaterial = new THREE.MeshLambertMaterial({ color: 0xD3BC64, map: marcoTexture });
    var marco = new THREE.Mesh(marcoGeom, marcoMaterial);
    
    // --------------------------------------
    // Crear geometría de la imagen
    var imagenGeom = new THREE.PlaneGeometry(ancho, largo);
    var textura_imagen = this.texturaLoader.load(imagen);

    var material_imagen = new THREE.MeshLambertMaterial({ map: textura_imagen });
    var imagen_cuadro = new THREE.Mesh(imagenGeom, material_imagen);
  
    // Asegurarse de que la imagen esté delante del marco
    imagen_cuadro.position.z = profundidad / 2 + 0.001;
    
    // --------------------------------------
    var cuadro_aux = new THREE.Object3D();
    cuadro_aux.add(marco, imagen_cuadro);
    cuadro_aux.position.y = marcho_alto / 2;
    cuadro_aux.position.z = 0.025;

    cuadro_aux.position.x = -ancho/2;

    var cuadro_aux2 = new THREE.Object3D().add(cuadro_aux);
    // esto se hace para poder aplicar la rotación sin que los valores de posición cambien
    var cuadro_aux3 = new THREE.Object3D().add(cuadro_aux2);
    cuadro_aux3.position.x = ancho/2;

    var luz = new THREE.SpotLight(0xffffff, 1, 25, Math.PI/12, 0.325, 2);
    luz.position.set(0,largo+largo*0.5,3);
    var target = new THREE.Object3D();
    target.position.set(0,largo*0.625,0);

    luz.target = target;

    luz.visible = false;

    var cuadro = new THREE.Object3D().add(cuadro_aux3,luz,target);

    marco.userData = cuadro;
    imagen_cuadro.userData = cuadro;
    
    cuadro.name = 'cuadro';
  
    return cuadro;
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
    var material1 = new THREE.MeshLambertMaterial({color: 0xD6C359});
    
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
    var material2 = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
    
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
    this.snitch.add(ala1, ala2, cuerpo);

    return this.snitch;
  }

  createPensadero(texturaLoader){
    // --------- TEXTURAS ---------
    var textura_piedra = this.texturaLoader.load ('../imgs/textura_caliza.jpg');
    var textura_liquido = this.texturaLoader.load('../imgs/textura_liquido.jpg')

    // ---------- CUERPO ----------
    var cuerpo_geom = new THREE.CapsuleGeometry(0.5, 0.6, 9, 7);
    var cubo_geom = new THREE.BoxGeometry(1.1,1.1,1.1);
    var cilindro_geom = new THREE.CylinderGeometry(0.43, 0.3, 0.6, 20);
    var circulo_geom = new THREE.CircleGeometry(0.4, 20);
    var torus_geom = new THREE.TorusGeometry(0.49, 0.036, 20, 20);

    var piedra = new THREE.MeshLambertMaterial({color: 0xF1ECDA, map: textura_piedra});
    var agua = new THREE.MeshPhongMaterial({color: 0x6CC5DE, map: textura_liquido});
    
    var cilindro_CSG = new THREE.Mesh(cilindro_geom, piedra);
    var cubo_CSG = new THREE.Mesh(cubo_geom, piedra);
    var anillo_CSG = new THREE.Mesh(torus_geom, piedra);

    cubo_CSG.position.y = 0.55;
    cilindro_CSG.position.y = 0.5;

    anillo_CSG.rotateX(Math.PI/2);
    anillo_CSG.position.y = 0.4;

    var liquido = new THREE.Mesh(circulo_geom, agua);
    liquido.rotateX(-Math.PI/2);
    liquido.position.y = 0.6;

    // Creamos el objeto CSG y oepramos con él:
    var cuerpo_base = new THREE.Mesh(cuerpo_geom, piedra);
    cuerpo_base = new CSG().subtract([cuerpo_base, cubo_CSG]).toMesh();
    cuerpo_base.position.y = 0.7;

    cuerpo_base = new CSG().subtract([cuerpo_base, cilindro_CSG]).toMesh();
    cuerpo_base = new CSG().union([cuerpo_base, anillo_CSG]).toMesh();

    var cuerpo = new THREE.Object3D();
    cuerpo.add(cuerpo_base, liquido);

    cuerpo.position.y = 0.6;

    // ---------- BASE ----------
    var shape = new THREE.Shape();
    var puntos = [];

    shape.moveTo(0.5, 0);
    shape.lineTo(0.5, 0.1);
    shape.quadraticCurveTo(0.1, 0.2, 0.16, 0.6);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var base_geom = new THREE.LatheGeometry(puntos, 7, 0, Math.PI*2);
    var base = new THREE.Mesh(base_geom, piedra);

    // ------------------
    this.pensadero = new THREE.Object3D();
    this.pensadero.add(cuerpo, base);

    return this.pensadero;
  }

  createAntorcha(especial,color_llama,color_luz,intensity,distance,decay){
    var antorcha_OBJ = new THREE.Object3D();

    var T_metal = this.texturaLoader.load('../imgs/textura_pomo.png');
    var T_madera = this.texturaLoader.load('../imgs/textura_madera_vieja.jpg');

    var antorcha = new THREE.Shape();
    antorcha.moveTo(0, 0);
    antorcha.quadraticCurveTo( 0.025, 0, /**/ 0.025, 0.05 );
    antorcha.lineTo(0.04, 0.6);
    antorcha.lineTo(0, 0.6);

    var points = antorcha.extractPoints(5).shape;
    antorcha = new THREE.Mesh( new THREE.LatheGeometry(points, 6), new THREE.MeshLambertMaterial({color: '#B5B5B5', map: T_madera}) );


    var metal = new THREE.Mesh( new THREE.CylinderGeometry(0.08,0.08,0.1,8), new THREE.MeshLambertMaterial({color: '#FFFFFF', map: T_metal}) );
    metal.position.y = 0.65;

    var cil_interno = metal.clone();
    cil_interno.scale.y = 1 - 0.005/0.1;
    cil_interno.scale.x = 1 - 0.005/0.08;
    cil_interno.scale.z = 1 - 0.005/0.08;
    cil_interno.position.y += 0.005;

    var csg = new CSG();

    csg.subtract([metal, cil_interno]);

    var cilindro = new THREE.Mesh( new THREE.CylinderGeometry(0.06, 0.05, 0.06, 6), new THREE.MeshLambertMaterial({color: '#FFFFFF', map: T_metal}) );
    var base = cilindro.clone();
    cilindro.position.y = 0.57;

    csg.union([cilindro]);

    var cubo = new THREE.Mesh( new THREE.BoxGeometry(0.5, 0.1, 0.04) );
    cubo.position.y = 0.69;
    cubo.rotation.y = 22.5 * Math.PI/180;

    for (let i=0; i<4; i++) {
      cubo.rotation.y += 45 * Math.PI/180;
      csg.subtract([cubo]);
    }

    metal = csg.toMesh();

    var llama = new THREE.Shape();
    llama.moveTo(0.001, 0);
    llama.bezierCurveTo( 0.07, 0, /**/ 0.07, 0.06, /**/ 0.055, 0.08 );
    llama.quadraticCurveTo( 0.02, 0.12, /**/ 0.001, 0.2 );

    points = llama.extractPoints(8).shape;

    var fuego = this.texturaLoader.load('../imgs/textura_fuego_gris.jpg');
    llama = new THREE.Mesh( new THREE.LatheGeometry(points, 16), new THREE.MeshLambertMaterial({emissive: color_llama, emissiveMap: fuego, emissiveIntensity: 2}) );

    var llama1 = llama.clone();
    llama1.scale.x = 0.5;
    llama1.scale.z = 0.5;
    llama1.scale.y = 0.7;
    llama1.position.y += 0.05;
    llama1.position.x -= 0.02;

    var llama2 = llama1.clone();
    llama2.position.x += 0.04;
    llama2.position.z += 0.03;
    llama2.position.y -= 0.025;

    var llama3 = llama2.clone();
    llama3.rotation.z = -15 * Math.PI/180;
    llama3.position.z = -0.03;
    llama3.position.y += 0.005;
    llama3.position.x = 0.005;

    llama = new CSG().union([llama,llama1,llama2,llama3]).toMesh();

    llama.rotation.y = Math.PI;

    cilindro.position.y = 0.425;
    cilindro.scale.x = 0.75;
    cilindro.scale.z = 0.75;

    llama.rotation.z = -20 * Math.PI/180;

    llama.position.y = 0.6;

    llama.position.x = (20 * 0.025) / 20;


    var luzFuego = new THREE.PointLight(color_luz, intensity, distance, decay);
    luzFuego.position.set(0,0.7,0);

    antorcha_OBJ.add(antorcha,metal,llama,cilindro,luzFuego);

    antorcha_OBJ.position.y -= 0.425


    var obj_aux = new THREE.Object3D();
    obj_aux.add(antorcha_OBJ);

    obj_aux.rotation.z = -20 * Math.PI/180;
    obj_aux.position.x = 0.02;
    obj_aux.position.x += Math.sin(20*Math.PI/180)*0.425;


    var cil = new THREE.Mesh( new THREE.CylinderGeometry(0.025, 0.025, Math.sin(20*Math.PI/180)*0.425, 8), new THREE.MeshLambertMaterial({color: '#FFFFFF', map: T_metal}) );
    cil.rotation.z = Math.PI/2;
    cil.position.x = Math.sin(20*Math.PI/180)*0.425/2;

    base.scale.x = 0.7;
    base.scale.z = 0.7;
    base.scale.y = 1.2;
    base.rotation.z = Math.PI/2;

    cil = new CSG().union([cil,base]).toMesh();


    var antorcha_final = new THREE.Object3D();
    antorcha_final.add(obj_aux, cil);

    return antorcha_final;
  }
}

export { Decoracion };