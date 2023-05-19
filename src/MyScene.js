
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { FirstPersonControls } from '../libs/FirstPersonControls.js'
import { PointerLockControls } from '../libs/PointerLockControls.js'

import * as KeyCode from '../libs/keycode.esm.js'

import { H_estructura } from './H_estructura.js'
import { Decoracion  } from './decoracion.js'

import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'


const PI = Math.PI;

class MyScene extends THREE.Scene {
  constructor (myCanvas) {
    super();
    // ------------------ COLISIONES ------------------
    /*this.rayo = new THREE.Raycaster();
    this.direccion = new THREE.Vector3();
    this.intersectados = [];*/
    
    // ------------------------------
    //this.colorFondo = new THREE.Color(0xEEEEEE);
    this.colorFondo = new THREE.Color(0x000000);
    this.impactados = [];
    this.origen = new THREE.Vector3(0,0,0);

    // ------------------ CONTROLES ------------------

    // 0: adelante, 1: atrás, 2: izquierda, 3: derecha
    this.movimiento = [false, false, false, false];

    this.velocidad = 0.075;

    this.altura = 2;
    this.agachado = false;

    // ------------------ LUZ ------------------

    this.colorFondo = new THREE.Color(0xEEEEEE);
    //this.colorFondo = new THREE.Color(0x000000);

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

    this.renderer.shadowMap.enable = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights ();

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper (5);
    //this.add (this.axis);

    //this.axis.visible.value = false;

    this.h_estructura = new H_estructura( {grosor: 0.1, alto: 3, largo: 20, profundidad: 16, techo_visible: true, radio_mayor: 3, radio_menor: 3.5, porcentaje_pared: 3.5/20});
    this.add(this.h_estructura);

    this.dim = this.h_estructura.getDimensiones();


    // Tendremos una cámara con un control de movimiento con el ratónVector2( arrayAux[i][0], arrayAux[i][1] );
    this.createCamera ();


    this.decoracion = new Decoracion();


    // ------------------- ANTORCHAS -------------------

    // primera varible por ahora nada, 1º color: color llama, 2º color: color de luz proyectada
    var antorcha_roja = this.decoracion.createAntorcha(false,'#9E4F27','#EAC77F');

    for (let i in this.dim.posV2xz_columnas_array) {
      let t = antorcha_roja.clone();
      t.position.x = this.dim.posV2xz_columnas_array[i].x + this.dim.rad_pilar;
      t.position.z = this.dim.posV2xz_columnas_array[i].y;
      t.position.y = 2*this.dim.alto/3;

      this.add(t);
    }

    var antorcha_azul = this.decoracion.createAntorcha(false,'#1B4F72','#AED6F1');
    var t = antorcha_azul.clone();
    t.position.x = -this.dim.largo/2 + this.dim.rad_pilar;
    t.position.z = -this.dim.profundidad/2;
    t.position.y = 2*this.dim.alto/3;
    this.add(t);

    t = t.clone();
    t.rotation.y = -PI;
    t.position.x += 2*this.dim.radio_lateral - 2*this.dim.rad_pilar;
    this.add(t);


    // ------------------- ESTANTERÍAS -------------------

    var estanteria = this.decoracion.createEstanteria(this.dim.dist_anchoArcos_estanteria/2);

    for (let i in this.dim.posX_centroArcos_array) {
      var estanteriaIzq = estanteria.clone();
      var estanteriaDer = estanteria.clone();
      estanteriaIzq.position.x = this.dim.posX_centroArcos_array[i] + this.dim.dist_anchoArcos_estanteria/4;
      estanteriaDer.position.x = this.dim.posX_centroArcos_array[i] - this.dim.dist_anchoArcos_estanteria/4;

      estanteriaIzq.position.z = -this.dim.posZ_centroArcos_positiva + 0.3/2;
      estanteriaDer.position.z = -this.dim.posZ_centroArcos_positiva + 0.3/2;
    
      this.add(estanteriaDer, estanteriaIzq);
    }

    for (let i in this.dim.posX_centroArcos_array) {
      var estanteriaIzq = estanteria.clone();
      var estanteriaDer = estanteria.clone();
      estanteriaIzq.position.x = this.dim.posX_centroArcos_array[i] + this.dim.dist_anchoArcos_estanteria/4;
      estanteriaDer.position.x = this.dim.posX_centroArcos_array[i] - this.dim.dist_anchoArcos_estanteria/4;

      estanteriaIzq.position.z = this.dim.posZ_centroArcos_positiva - 0.3/2;
      estanteriaDer.position.z = this.dim.posZ_centroArcos_positiva - 0.3/2;

      this.add(estanteriaIzq, estanteriaDer);
    }
    
    var estanteria = this.decoracion.createEstanteria(this.dim.dist_anchoColumnas/2);

    estanteria.rotation.y = PI/2;
    estanteria.position.x = this.dim.largo/2 - 0.3/2;

    var estanteriaIzq1 = estanteria.clone();
    var estanteriaIzq2 = estanteria.clone();
    var estanteriaDer1 = estanteria.clone();
    var estanteriaDer2 = estanteria.clone();

    /*estanteriaIzq1.position.z = - dim.;
    estanteriaIzq2.position.z = - (dim.rad_central + 2*dim.radio_base_pilarPrisma + dim.dist_anchoColumnas/4);
    estanteriaDer1.position.z = dim.rad_central + 2*dim.radio_base_pilarPrisma + 3*dim.dist_anchoColumnas/4;
    estanteriaDer2.position.z = dim.rad_central + 2*dim.radio_base_pilarPrisma + dim.dist_anchoColumnas/4;

    this.add(estanteriaIzq1, estanteriaIzq2, estanteriaDer1, estanteriaDer2);*/


    // ------------------- MESAS Y TABURETES -------------------
    // var mesa = this.decoracion.createMesa();
    // this.add(mesa);


    // ------------------- CALDERO -------------------
    var caldero = this.decoracion.createCaldero();
    caldero.position.x = this.dim.posV2xz_centro_HabCircular_Lateral.x;
    caldero.position.z = -this.dim.posV2xz_centro_HabCircular_Lateral.y;
    
    caldero.scale.set(4.5, 4.5, 4.5);
    this.add(caldero);


    // ------------------- PENSADERO -------------------
    var pensadero = this.decoracion.createPensadero();
    pensadero.position.x = this.dim.posV2xz_centro_HabCircular_Principal.x - this.dim.rad_HabCircular_Principal/3;
    pensadero.position.z = this.dim.posV2xz_centro_HabCircular_Principal.y;

    this.add(pensadero);


    // ------------------- FRASCOS -------------------
    var colorFrasco = 0xD6DCDE;
    var colorLiquido = 0x871B1B;
    // var frasco = this.decoracion.createFrasco(colorFrasco, colorLiquido);
    // this.add(frasco);

    // var pocion = this.decoracion.createPocion(colorFrasco, colorLiquido, 0.3);
    // this.add(pocion);

    // var libro = this.decoracion.createLibro();
    // this.add(libro);

    // ------------------
    var cuadro = this.decoracion.createCuadro('', 0.1, 0.2);
    //this.add(cuadro);
  }
  
  createCamera () {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.camera.position.set (/*0,this.altura,0*/ 0,0,0);

    this.camera.lookAt(new THREE.Vector3 (/*10,this.altura,0*/this.dim.largo/2,2,0));

    this.add (this.camera);
    
    
    this.cameraControl = new PointerLockControls(this.camera, this.renderer.domElement);
    /*this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    this.cameraControl.target = new THREE.Vector3 (0,0,0);*/
  }
  
  createLights () {
    var luzAmbiente = new THREE.AmbientLight(/*'#828282'*/'#646464', 0.65);
    this.add(luzAmbiente);

    /*var luzPrueba = new THREE.PointLight('#FFFFFF', 1, 10, 1);
    luzPrueba.position.set(0,2,0);
    this.add(luzPrueba);*/

    /*luzPrueba.castShadow = true;
    luzPrueba.shadow.mapSize.width = 512;
    luzPrueba.shadow.mapSize.height = 512;
    luzPrueba.shadow.camera.near = 0.5;
    luzPrueba.shadow.camera.far = 500;*/

  }
  
  setLightIntensity (valor) {
    this.spotLight.intensity = valor;
  }
  
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(this.colorFondo, 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    return renderer;  
  }
  
  getCamera () {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }
  
  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  update () {
    //this.cameraControl.update();

    var alto_cam, velocidad_cam;

    if (this.agachado) {
      alto_cam = this.altura * 0.7;
      velocidad_cam = this.velocidad * 0.5;
    }
    else {
      alto_cam = this.altura;
      velocidad_cam = this.velocidad;
    }

    this.camera.position.y = alto_cam;

    
    // Se actualiza el resto del modelo
    // this.model.update();
    
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());

    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())


    // ------------------ MOVIMIENTO ------------------

    if ( this.movimiento.some((valor) => valor === true) ) {

      var donde_estoy = new THREE.Vector3();
      var a_donde_miro = new THREE.Vector3();

      donde_estoy.copy(this.camera.position);
      this.cameraControl.getDirection(a_donde_miro);

      a_donde_miro.y = 0;
      a_donde_miro.normalize();

      if (this.movimiento[0])
        if (!this.testColisiona(donde_estoy,a_donde_miro))
          this.cameraControl.moveForward(velocidad_cam);

      if (this.movimiento[1])
        if (!this.testColisiona(donde_estoy,new THREE.Vector3().copy(a_donde_miro).negate().normalize()))
          this.cameraControl.moveForward(-velocidad_cam);

      if (this.movimiento[2])
        if (!this.testColisiona(donde_estoy, new THREE.Vector3(0,1,0).cross(new THREE.Vector3().copy(a_donde_miro)).normalize()))
          this.cameraControl.moveRight(-velocidad_cam);

      if (this.movimiento[3])
        if (!this.testColisiona(donde_estoy, new THREE.Vector3().copy(a_donde_miro).cross(new THREE.Vector3(0,1,0)).normalize()))
          this.cameraControl.moveRight(velocidad_cam);

    }

  }


  // ------------------ COLISIONES ------------------
  testColisiona(donde_estoy,a_donde_miro) {
    var porcentaje = 0.3;
    var altura = this.altura;
    if (this.agachado) altura *= 0.7;

    var colision_H = false, colision_V = false;

    var rayo_H = new THREE.Raycaster(donde_estoy,a_donde_miro);
    var intersectados_H = rayo_H.intersectObjects(this.children, true);
    
    // tener en cuenta que el vector a_donde_miro es horizontal (y = 0), lo que significa que se usará la altura
    // que da "donde_estoy" para saber desde donde sale el rayo (además de también la x y la z de donde_estoy),
    // también creo que no se usará el camara.getWorldPosition(), pero no estoy seguro, no se bien como van los rayos
    // ten en cuenta que se deberá comprobar si se "detecta colisión" con alguno de los dos rayos que se van a crear:

    if (intersectados_H.length > 0 && intersectados_H[0].distance < 0.8)
      colision_H = true;

    // se crea otro rayo desde las posición de la cámara + "pequeña distancia (decidir) (en la dirección a_donde_miro)",
    // pero este rayo parte desde la altura de la cámara y con posición x y z relacionadas al vector dirección a_donde_miro (decidir cantidad)
    // recordamos que este rayo tiene que estar un poco por delante en la dirección a la que apunta la cámara (a_donde_miro)
    a_donde_miro.multiplyScalar(porcentaje);
    var punto = donde_estoy.add(a_donde_miro);


    var rayo_V= new THREE.Raycaster(punto, new THREE.Vector3(0,-1,0));
    var intersectados_V = rayo_V.intersectObjects(this.children, true);

    if ((intersectados_V.length > 0 && intersectados_V[0].distance < altura-0.1) || intersectados_V.length == 0)
      colision_V = true;


    // el método devolverá un booleano según:
    // 1 - el la distancia del primer objeto del rayo 1 es menor que la altura (this.altura) de la cámara - 0.1 (para evitar posibles problemas)
    // Ó
    // 2 - el rayo 2 choca con un objeto que está a una distancia menor que la decidida

    // por defecto, devuelve false (no hay colisiones) --> quitar cuando hagas el método
    return colision_H || colision_V;
  }


  onKeyDown(event) {

    switch (event.which || event.key) {

      case KeyCode.KEY_CONTROL:
        if (this.cameraControl.isLocked) this.cameraControl.unlock();
        else this.cameraControl.lock();
        break;

      case KeyCode.KEY_SHIFT:
        this.agachado = true;
        break;
    }

    switch ( String.fromCharCode (event.which || event.key) ) {
      case 'W':
        this.movimiento[0] = true;
        break;
      case 'S':
        this.movimiento[1] = true;
        break;
      case 'A':
        this.movimiento[2] = true;
        break;
      case 'D':
        this.movimiento[3] = true;
        break;
    }
  }
  
  onKeyUp(event) {

    switch (event.which || event.key) {

      case KeyCode.KEY_SHIFT:
        this.agachado = false;
        break;
    }

    switch ( String.fromCharCode (event.which || event.key) ) {
      case 'W':
        this.movimiento[0] = false;
        break;
      case 'S':
        this.movimiento[1] = false;
        break;
      case 'A':
        this.movimiento[2] = false;
        break;
      case 'D':
        this.movimiento[3] = false;
        break;
    }
  }

  /*onKeyPress(event) {
    switch (event.key || event.which) {
      case KeyCode.KEY_ESCAPE:
        if (this.cameraControl.isLocked) {
          this.cameraControl.unlock();
        }
        else {
          this.cameraControl.lock();
        }
        break;
    }
  }*/

}

/// La función   main
$(function () {
  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());

  window.addEventListener ("keydown", (event) => scene.onKeyDown(event));
  window.addEventListener ("keyup", (event) => scene.onKeyUp(event));
  //window.addEventListener ("keypress", (event) => scene.onKeyPress(event));
  
  // Que no se nos olvide, la primera visualización.
  scene.update();
});
