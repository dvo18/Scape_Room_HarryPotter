
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
    this.rayo = new THREE.Raycaster();
    this.direccion = new THREE.Vector3();
    this.intersectados = [];
    
    // ------------------------------
    //this.colorFondo = new THREE.Color(0xEEEEEE);
    this.colorFondo = new THREE.Color(0x000000);

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

    this.renderer.shadowMap.enable = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights ();

    // Tendremos una cámara con un control de movimiento con el ratónVector2( arrayAux[i][0], arrayAux[i][1] );
    this.createCamera ();

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper (5);
    this.add (this.axis);

    //this.axis.visible.value = false;

    this.h_estructura = new H_estructura( {grosor: 0.1, alto: 3, largo: 20, profundidad: 16, techo_visible: true, radio_mayor: 3, radio_menor: 3.5, porcentaje_pared: 3.5/20});
    this.add(this.h_estructura);

    var dim = this.h_estructura.getDimensiones();


    this.decoracion = new Decoracion();

    // ------------------- ESTANTERÍAS -------------------

    var estanteria = this.decoracion.createEstanteria(dim.dist_anchoArcos_estanteria/2);

    for (let i in dim.posX_centroArcos_array) {
      var estanteriaIzq = estanteria.clone();
      var estanteriaDer = estanteria.clone();
      estanteriaIzq.position.x = dim.posX_centroArcos_array[i] + dim.dist_anchoArcos_estanteria/4;
      estanteriaDer.position.x = dim.posX_centroArcos_array[i] - dim.dist_anchoArcos_estanteria/4;

      estanteriaIzq.position.z = -dim.posZ_centroArcos_positiva + 0.3/2;
      estanteriaDer.position.z = -dim.posZ_centroArcos_positiva + 0.3/2;
    
      this.add(estanteriaDer, estanteriaIzq);
    }

    for (let i in dim.posX_centroArcos_array) {
      var estanteriaIzq = estanteria.clone();
      var estanteriaDer = estanteria.clone();
      estanteriaIzq.position.x = dim.posX_centroArcos_array[i] + dim.dist_anchoArcos_estanteria/4;
      estanteriaDer.position.x = dim.posX_centroArcos_array[i] - dim.dist_anchoArcos_estanteria/4;

      estanteriaIzq.position.z = dim.posZ_centroArcos_positiva - 0.3/2;
      estanteriaDer.position.z = dim.posZ_centroArcos_positiva - 0.3/2;

      this.add(estanteriaIzq, estanteriaDer);
    }
    
    var estanteria = this.decoracion.createEstanteria(dim.dist_anchoColumnas/2);

    estanteria.rotation.y = PI/2;
    estanteria.position.x = dim.largo/2 - 0.3/2;

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
    caldero.position.x = dim.posV2xz_centro_HabCircular_Lateral.x;
    caldero.position.z = -dim.posV2xz_centro_HabCircular_Lateral.y;
    
    caldero.scale.set(4.5, 4.5, 4.5);
    this.add(caldero);

    // ------------------- PENSADERO -------------------
    var pensadero = this.decoracion.createPensadero();
    pensadero.position.x = dim.posV2xz_centro_HabCircular_Principal.x - dim.rad_HabCircular_Principal/3;
    pensadero.position.z = dim.posV2xz_centro_HabCircular_Principal.y;

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
    this.add(cuadro);
  }
  
  createCamera () {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano // 45 <--
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (0,1.75,0);//(20, 10, 20);
    // Y hacia dónde mira
    var look = new THREE.Vector3 (0,0,0); //(0,0,0); 
    this.camera.lookAt(look);
    this.add (this.camera);
    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new FirstPersonControls(this.camera, this.renderer.domElement);
    //this.cameraControl = new TrackballControls(this.camera, this.renderer.domElement);
    // Se configuran las velocidades de los movimientos
    /*this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;*/

    //this.cameraControl.lock();
  }
  
  createLights () {
    var luzAmbiente = new THREE.AmbientLight('#828282', 0.65);
    this.add(luzAmbiente);

    var luzPrueba = new THREE.PointLight('#FFFFFF', 1, 10, 1);
    luzPrueba.position.set(0,2,0);
    this.add(luzPrueba);

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

    // Se actualiza la posición de la cámara según su controlador
    //this.cameraControl.update();
    this.camera.position.y = 1.75;
    this.cameraControl.update(1.5);
    this.cameraControl.movementSpeed = 0.1;
    
    // Se actualiza el resto del modelo
    // this.model.update();
    
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());

    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())

    // ------------------ COLISIONES ------------------
    this.direccion.set(0, 0, -1);
    this.camera.getWorldPosition(this.direccion);
    this.rayo.set(this.camera.position, this.direccion.normalize());

    // Obtenemos los objetos con los que colisiona el rayo
    this.intersectados = this.rayo.intersectObjects(this.children, true);

    // Procesamos los objetos intersectados
    if (this.intersectados.length > 0) {
      var interseccionCercana = this.intersectados[0].distance;

      if(interseccionCercana < 2){
        this.cameraControl.moveForward = false;
      }

      
    }
  }


  onKeyDown(event) {
    //var x = event.which || event.key;


    /*switch (x) {
      case KeyCode.KEY_0:
        this.cameraControl.lock();
        break;
      case KeyCode.KEY_1:
        this.cameraControl.unlock();
        break;
    }*/
  }

}

/// La función   main
$(function () {
  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());

  window.addEventListener ("keydown", () => scene.onKeyDown());
  
  // Que no se nos olvide, la primera visualización.
  scene.update();
});
