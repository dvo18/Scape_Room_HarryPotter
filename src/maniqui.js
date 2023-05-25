import { OBJLoader } from '../libs/OBJLoader.js';
import { MTLLoader } from '../libs/MTLLoader.js'
import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'
 
class Maniqui extends THREE.Object3D {
    constructor() {
        super();
        
        this.texturaLoader = new THREE.TextureLoader();
        var textura_cuerpo = this.texturaLoader.load("../imgs/textura_madera1.jpg");
        var textura_cabeza = this.texturaLoader.load("../imgs/textura_cabeza.jpg")

        // --------------------------------------------------------

        // ----------- RUEDAS -----------
        var material_esferas = new THREE.MeshLambertMaterial({color: 0x3C3C3C, map: textura_cuerpo});
        var esfera_geom = new THREE.SphereGeometry(0.1);
        var ruedaIZQ = new THREE.Mesh(esfera_geom, material_esferas);

        var ruedaDER = ruedaIZQ.clone();

        ruedaIZQ.position.x = -0.2;
        ruedaDER.position.x = 0.2;

        // ----------- PIERNAS -----------
        var piernas_geom = new THREE.CylinderGeometry(0.2, 0.4, 0.8);

        var material_cilindros = new THREE.MeshLambertMaterial({color: 0x595959, map: textura_cuerpo});
        var piernas = new THREE.Mesh(piernas_geom, material_cilindros);

        piernas.position.y = 0.4;
        
        // ----------- PARTE INFERIOR ----------- 
        var parteInferior = new THREE.Object3D().add(piernas, ruedaIZQ, ruedaDER)
        parteInferior.position.y = 0.1;
        parteInferior.name = 'parteInferior';

        
        // ----------- HOMBROS ----------- 
        var hombroIZQ = new THREE.Mesh(esfera_geom, material_esferas);
        hombroIZQ.position.y = 0.1;
        var hombroDER = hombroIZQ.clone();

        hombroIZQ.position.y = 0.6;
        hombroDER.position.y = 0.6;

        // ----------- BRAZOS BASE ----------- 
        var material_brazos = new THREE.MeshLambertMaterial({color: 0x595959, map: textura_cuerpo});

        var brazos_geom = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        var brazo_baseIZQ = new THREE.Mesh(brazos_geom, material_brazos);
        brazo_baseIZQ.position.y = 0.35;
        var brazo_baseDER = brazo_baseIZQ.clone();

        // ----------- MANOS ----------- 
        var manoIZQ = new THREE.Mesh(esfera_geom, material_esferas);
        var manoDER = manoIZQ.clone()

        manoIZQ.scale.set(0.8, 0.8, 0.8);
        manoDER.scale.set(0.8, 0.8, 0.8);

        manoIZQ.position.y = 0.05;
        manoDER.position.y = 0.05;

        // ----------- VARITA ----------- 
        var varita = this.createVarita();

        // ----------- BRAZOS -----------
        var brazoIZQ = new THREE.Object3D().add(hombroIZQ, brazo_baseIZQ, manoIZQ);
        var brazoDER = new THREE.Object3D().add(hombroDER, brazo_baseDER, manoDER);

        brazoIZQ.rotation.z = -(20*Math.PI) / 180;
        brazoDER.rotation.z = (20*Math.PI) / 180;

        brazoIZQ.position.x = -0.6;
        brazoDER.position.x = 0.6;

        brazoIZQ.position.y = -0.15;
        brazoDER.position.y = -0.15;

        brazoIZQ.name = 'brazoIZQ';
        brazoDER.name = 'brazoDER';

        // ----------- TORSO_BASE ----------- 
        var torso_geom = new THREE.CylinderGeometry(0.4, 0.2, 0.5);
        var torso = new THREE.Mesh(torso_geom, material_cilindros);

        torso.position.y = 0.25;

        // ----------- CABEZA BASE + CUELLO----------- 
        var material_cabeza = new THREE.MeshLambertMaterial({color: 0x595959, map: textura_cabeza});
        var cabeza_base = new THREE.Mesh(esfera_geom, material_cabeza);
        cabeza_base.scale.x = 2;    // 0.20
        cabeza_base.scale.y = 2.5;  // 0.25
        cabeza_base.scale.z = 2;    // 0.20

        var cuello = new THREE.Mesh(brazos_geom, material_cilindros);
        cuello.scale.y = 0.2;       // 0.1
        cuello.position.y = 0.05;

        cabeza_base.position.y = 0.125 + 0.2;

        var cabeza = new THREE.Object3D().add(cabeza_base, cuello);
        cabeza.position.y = 0.5;
        cabeza.name = 'cabeza';

        // ----------- PARTE SUPERIOR ----------- 
        var parteSuperior = new THREE.Object3D().add(brazoIZQ, brazoDER, torso, cabeza);
        parteSuperior.position.y = 0.9;
        parteSuperior.name = 'parteSuperior'

        // ------------------------------------------------------
        var maniqui = new THREE.Object3D().add(parteInferior, parteSuperior);

        this.add(maniqui);
    }

    createVarita(){
        // Creamos las variables para cargar el material y el objeto:
        var materialLoader = new MTLLoader();
        var objetoLoader = new OBJLoader();

        // Creo un object3D para guardar la varita:
        var varita_base = new THREE.Object3D();

        materialLoader.load('../modelos/varita/varita.mtl',
        (materiales) => {
            objetoLoader.setMaterials(materiales);
            objetoLoader.load('../modelos/varita/varita.obj',
            (magic) => {
                varita_base.add(magic); // Finalmente añadimos la varita como hijo del Object3D.
            }, null, null);
        });

        // Escalo el objeto, lo translado al centro de los ejes y lo roto 180º en Z.
        varita_base.scale.set(3,3,3);
        varita_base.translateY(17);
        varita_base.rotateZ(Math.PI);

        var varita = new THREE.Object3D().add(varita_base);

        return varita;
    }

    update(){

    }
}



export { Maniqui };