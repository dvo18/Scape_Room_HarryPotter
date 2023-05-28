import { OBJLoader } from '../libs/OBJLoader.js';
import { MTLLoader } from '../libs/MTLLoader.js'
import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'
 
class Maniqui extends THREE.Object3D {
    constructor() {
        super();
        
        this.texturaLoader = new THREE.TextureLoader();
        var textura_cuerpo = this.texturaLoader.load("../imgs/maniqui/textura_cuerpo_2.jpg");
        var textura_esferas = this.texturaLoader.load("../imgs/maniqui/textura_cuerpo.jpg");
        var textura_cabeza = this.texturaLoader.load("../imgs/maniqui/textura_cuerpo.jpg")

        // --------------------------------------------------------

        // ----------- RUEDAS -----------
        this.radioRuedas = 0.1;

        var material_esferas = new THREE.MeshLambertMaterial({color: /*0x3C3C3C*/0xffffff, map: textura_esferas});
        var esfera_geom = new THREE.SphereGeometry(this.radioRuedas);
        this.ruedaIZQ = new THREE.Mesh(esfera_geom, material_esferas);

        this.ruedaDER = this.ruedaIZQ.clone();

        this.ruedaIZQ.position.x = -0.2;
        this.ruedaDER.position.x = 0.2;

        // ----------- PIERNAS -----------
        var piernas_geom = new THREE.CylinderGeometry(0.2, 0.4, 0.8, 20);

        var material_cilindros = new THREE.MeshLambertMaterial({color: /*0x595959*/0xEAEAEA, map: textura_cuerpo});
        var piernas = new THREE.Mesh(piernas_geom, material_cilindros);

        piernas.position.y = 0.4;
        
        // ----------- PARTE INFERIOR ----------- 
        this.parteInferior = new THREE.Object3D().add(piernas, this.ruedaIZQ, this.ruedaDER)
        this.parteInferior.position.y = 0.1;
        this.parteInferior.name = 'parteInferior';

        
        // ----------- HOMBROS ----------- 
        var hombroIZQ = new THREE.Mesh(esfera_geom, material_esferas);
        //hombroIZQ.position.y = 0.6;
        var hombroDER = hombroIZQ.clone();

        /*hombroIZQ.position.y = 0.6;
        hombroDER.position.y = 0.6;*/

        // ----------- BRAZOS BASE ----------- 
        var material_brazos = new THREE.MeshLambertMaterial({color: /*0x595959*/0xEAEAEA, map: textura_cuerpo});

        var brazos_geom = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        var brazo_baseIZQ = new THREE.Mesh(brazos_geom, material_brazos);
        //brazo_baseIZQ.position.y = 0.35;
        brazo_baseIZQ.position.y = -0.3;
        var brazo_baseDER = brazo_baseIZQ.clone();

        // ----------- MANOS ----------- 
        var manoIZQ = new THREE.Mesh(esfera_geom, material_esferas);
        manoIZQ.scale.set(0.8, 0.8, 0.8);
        manoIZQ.position.y = -0.6;
        var manoDER = manoIZQ.clone()

        //manoIZQ.scale.set(0.8, 0.8, 0.8);
        //manoDER.scale.set(0.8, 0.8, 0.8);

        /*manoIZQ.position.y = 0.05;
        manoDER.position.y = 0.05;*/

        // ----------- VARITA ----------- 
        var varita = this.createVarita();
        varita.scale.set(0.08, 0.08, 0.08);
        varita.rotation.y = Math.PI - Math.PI/4;
        varita.rotation.x = -(20*Math.PI) / 180;

        varita.position.x = 0.1;
        varita.position.y = -0.425;//0.25;
        varita.position.z = -0.2;

        // ----------- BRAZOS -----------
        this.brazoIZQ = new THREE.Object3D().add(hombroIZQ, brazo_baseIZQ, manoIZQ);
        this.brazoDER = new THREE.Object3D().add(hombroDER, brazo_baseDER, manoDER, varita);

        this.brazoIZQ.rotation.z = -(20*Math.PI) / 180;
        this.brazoDER.rotation.z = (20*Math.PI) / 180;

        this.brazoIZQ.position.x = -0.4;
        this.brazoDER.position.x = 0.4;

        this.brazoIZQ.position.y = 0.4;//-0.15;
        this.brazoDER.position.y = 0.4;//-0.15;

        this.brazoIZQ.name = 'brazoIZQ';
        this.brazoDER.name = 'brazoDER';

        // ----------- TORSO_BASE ----------- 
        var torso_geom = new THREE.CylinderGeometry(0.4, 0.2, 0.5, 20);
        var torso = new THREE.Mesh(torso_geom, material_cilindros);

        torso.position.y = 0.25;

        // ----------- CABEZA BASE + CUELLO----------- 
        var material_cabeza = new THREE.MeshLambertMaterial({color: /*0x595959*/0xffffff, map: textura_cabeza});
        var cabeza_base = new THREE.Mesh(esfera_geom, material_cabeza);
        cabeza_base.scale.x = 2;    // 0.20
        cabeza_base.scale.y = 2.5;  // 0.25
        cabeza_base.scale.z = 2;    // 0.20

        var cuello = new THREE.Mesh(brazos_geom, material_cilindros);
        cuello.scale.y = 0.3;       // 0.1
        cuello.position.y = 0.05;

        cabeza_base.position.y = 0.125 + 0.2;

        this.cabeza = new THREE.Object3D().add(cabeza_base, cuello);
        this.cabeza.position.y = 0.5;
        this.cabeza.name = 'cabeza';

        // ----------- PARTE SUPERIOR ----------- 
        this.parteSuperior = new THREE.Object3D().add(this.brazoIZQ, this.brazoDER, torso, this.cabeza);
        this.parteSuperior.position.y = 0.9;
        this.parteSuperior.name = 'parteSuperior'

        // ------------------------------------------------------
        this.maniqui = new THREE.Object3D().add(this.parteInferior, this.parteSuperior);

        this.add(this.maniqui);
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


        this.movManiqui = new TWEEN.Tween();
        this.rotManiqui = new TWEEN.Tween();
        this.balanceoBrazos = new TWEEN.Tween();
        this.movBrazos = new TWEEN.Tween();


        return varita;
    }

    movimientoManiqui(distancia){

        var origen = {p: 0.625*distancia};
        var destino = {p: -0.625*distancia};

        this.movManiqui = new TWEEN.Tween(origen)
            .to(destino, 4000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.ruedaIZQ.rotation.x = origen.p/this.radioRuedas;
                this.ruedaDER.rotation.x = origen.p/this.radioRuedas;
                this.maniqui.position.z = origen.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen.p = 0.625*distancia; })
            .start();
    }

    rotacionManiqui(){
        var origen = {p: -Math.PI/4};
        var destino = {p: Math.PI/4};

        this.rotManiqui = new TWEEN.Tween(origen)
            .to(destino, 4000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.parteSuperior.rotation.y = origen.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen.p = -Math.PI/4; })
            .start();
    }

    movimientoBrazos(){
        var origen = {p: this.brazoDER.rotation.z};
        var destino = {p: this.brazoDER.rotation.z + 0.2};

        this.balanceoBrazos = new TWEEN.Tween(origen)
            .to(destino, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.brazoIZQ.rotation.z = -origen.p;
                this.brazoDER.rotation.z = origen.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen.p = this.brazoDER.rotation; })
            .start();


        var origen2 = {p: -Math.PI/6};
        var destino2 = {p: Math.PI/6};

        this.movBrazos = new TWEEN.Tween(origen2)
            .to(destino2, 4000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => {
                this.brazoIZQ.rotation.x = -origen2.p;
                this.brazoDER.rotation.x = origen2.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen2.p = -Math.PI/6; })
            .start();
    }

    stopMovimientoManiqui(){
        this.movManiqui.stop();
        this.rotManiqui.stop();
        this.balanceoBrazos.stop();
        this.movBrazos.stop();

        var origen = {p: this.parteSuperior.rotation.y};
        var destino = {p: Math.PI/3};

        var animacion3 = new TWEEN.Tween({p: this.brazoDER.rotation.z, p2: this.brazoDER.rotation.x})
            .to({p: 0, p2: Math.PI/4}, 1500)
            .onUpdate(() => {
                this.brazoDER.rotation.z = animacion3._object.p;
                this.brazoDER.rotation.x = animacion3._object.p2;
            });

        var animacion2 = new TWEEN.Tween({p: 0, p1: this.brazoDER.rotation.z, p2: this.brazoDER.rotation.x, p3: 0})
            .to({p: -Math.PI/4, p1: 0, p2: Math.PI/4, p3: -Math.PI/6}, 1500)
            .onUpdate(() => {
                this.parteSuperior.rotation.x = animacion2._object.p;
                this.brazoDER.rotation.z = animacion2._object.p1;
                this.brazoDER.rotation.x = animacion2._object.p2;
                this.brazoIZQ.rotation.z = -animacion2._object.p1;
                this.brazoIZQ.rotation.x = animacion2._object.p2;
                this.cabeza.rotation.x = animacion2._object.p3;
            })

        var animacion = new TWEEN.Tween(origen)
            .to(destino, 200)
            .onUpdate(() => {
                this.parteSuperior.rotation.y = animacion._object.p;
            })
            .yoyo(true)
            .repeat(16)
            .chain(animacion2)
            .onComplete(() => {
                origen.p = 0;
                this.parteSuperior.rotation.y = 0;
            });
            
        setTimeout(() => { animacion.start(); }, 1500);
    }

    update(){
        // Creamos un movimiento continuo de las ruedas del maniqui.
        this.ruedaIZQ.rotation.x -= 0.05;
        this.ruedaDER.rotation.x -= 0.05;
    }
}



export { Maniqui };