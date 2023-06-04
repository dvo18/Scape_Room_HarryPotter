import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'
import { CSG } from '../libs/CSG-v2.js'
 
const PI = Math.PI;

const RESOLUCION = 32;

const MOSTRAR_TODO = true;


// Obtención de puntos de una forma
function shapeToVector3 ( shape , num_pts = 6 ) {
    var v2 = shape.extractPoints(num_pts).shape ;
    var v3 = [];

    v2.forEach((v) => {
        v3.push( new THREE.Vector3(v.x, v.y, 0));
    });

    return v3 ;
}

function repeatTexture(texture, repeatX, repeatY, espejo=false) {
    var t = texture.clone();

    if (espejo) {
        t.wrapS = THREE.MirroredRepeatWrapping;
        t.wrapT = THREE.MirroredRepeatWrapping;
    }
    else {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
    }

    t.repeat.x = repeatX;
    t.repeat.y = repeatY;

    return t;
}



class H_estructura extends THREE.Object3D {
    constructor( opciones ) {
        super();


        // Variable rotación para la puerta
        this.rotacion_puerta = 0;


        this.conf = opciones;

        // Activar o no techo visible
        if (opciones.hasOwnProperty('techo_visible')) {
            this.techo_visible = opciones.techo_visible;
        }
        else {
            this.techo_visible = true;
        }

        var tipo = 0

        if (! (
            opciones.hasOwnProperty('grosor') &&
            opciones.hasOwnProperty('alto') &&
            opciones.hasOwnProperty('largo') &&
            opciones.hasOwnProperty('profundidad')
        )) {
            console.error('Error: No se han especificado todas las opciones necesarias para crear la estructura');
            return;
        } 
        else if (
            opciones.grosor <= 0 ||
            opciones.alto <= 0 ||
            opciones.largo <= 0 ||
            opciones.profundidad <= 0
        ) {
            console.error('Error: Las medidas de la estructura deben ser positivas mayores que 0');
            return;
        }
        else {
            tipo = 0;
        }


        if (opciones.hasOwnProperty('radio_mayor') &&
            opciones.hasOwnProperty('radio_menor')
        ) {
            if (opciones.radio_mayor < 0.05 || opciones.radio_menor < 0.05) {
                console.error('Error: Los radios de la estructura deben ser positivos mayores o iguales que 0.05');
                return;
            }
            else if (opciones.radio_mayor > this.conf.profundidad/2 || opciones.radio_menor > this.conf.largo/2) {
                console.error('Error: Los radios de la estructura deben ser menores que la pared en la que están');
                return;
            }
            else {
                tipo = 2;
            }
        }
        else if (opciones.hasOwnProperty('radio_mayor')) {
            if (opciones.radio_mayor < 0.05 ) {
                console.error('Error: Los radios de la estructura deben ser positivos mayores o iguales que 0.05');
                return;
            }
            else if (opciones.radio_mayor > this.conf.profundidad/2) {
                console.error('Error: Los radios de la estructura deben ser menores que la pared en la que están');
                return;
            }
            else {
                tipo = 1;
            }
        }


        this.grosor_techo = 2 * opciones.alto/3;

        this.PILAR_PROP_ALTO = 1.6;
        this.PILAR_PROP_RADIO = 1.8;

        this.radio_pilar = 2 * opciones.grosor;
        this.radio_base_pilar = this.radio_pilar*this.PILAR_PROP_RADIO*Math.cos(PI/4);

        this.num_bovedas_pilares = 3;
        this.largo_boveda_pilares = opciones.largo - opciones.radio_menor*2 - (opciones.largo*opciones.porcentaje_pared - opciones.radio_menor) - this.radio_base_pilar*2;
        this.profundidad_boveda_pilares = opciones.profundidad/2 - opciones.radio_mayor - this.radio_base_pilar*2;

        
        this.colorCaliza = '#FDD7A4';

        this.texturaLoader = new THREE.TextureLoader();

        this.T_pared_gris1 = this.texturaLoader.load('../imgs/textura_paredPiedra2_gris_V2inv.jpg');
        this.T_pared_normal1 = this.texturaLoader.load('../imgs/textura_paredPiedra2_normal_V2inv.jpg');
        this.T_pared_gris2 = this.texturaLoader.load('../imgs/textura_paredPiedra2_gris.jpg');
        this.T_pared_normal2 = this.texturaLoader.load('../imgs/textura_paredPiedra2_normal.jpg');

        this.colorPared = new THREE.Color( /*'#A8A7C4'*/'#949CFC' );

        this.T_suelo = this.texturaLoader.load('../imgs/textura_suelo.jpg' );

        this.colorSuelo = new THREE.Color( "rgb(168, 168, 168)" );

        this.T_techo = this.texturaLoader.load('../imgs/textura_techo_piedra_negra.jpg' );

        this.colorTecho = '#28274F';

        this.T_columna = this.texturaLoader.load('../imgs/textura_caliza.jpg' );

        this.T_puerta = this.texturaLoader.load('../imgs/textura_puerta1_1.png' );
        this.T_pomo = this.texturaLoader.load('../imgs/textura_pomo.png' );

        this.T_ladrillo = this.texturaLoader.load('../imgs/textura_techo.jpg' );
        this.colorLadrillo = '#4B589A';



        // Estructuras posibles:
        // Muros ('Mn' con {n='Orientación (N,S,E,O...)'} )
        // Suelos ('S')
        // Techos ('T')
        // Puertas ('P')
        this.estr = {};
        this.estr.CL = [];

        
        if (MOSTRAR_TODO) {
            switch(tipo) {
                case 0:
                    this.createSquareRoom();
                    break;
                case 1:
                    this.createCircularRoom();
                    break;
                case 2:
                    if (opciones.hasOwnProperty('porcentaje_pared')) {
                        this.createDoubleCircularRoom(opciones.porcentaje_pared);
                    }
                    else {
                        this.createDoubleCircularRoom();
                    }
                    break;
            }

            //this.estr.T.position.y = this.conf.alto+this.grosor_techo;

            for(var clave in this.estr) {
                if (clave == 'T' && !this.techo_visible) continue;
                else if (clave == 'CL')
                    for (let e in this.estr[clave])
                        this.add(this.estr[clave][e]);
                else if (clave == 'R') {
                    var r = this.estr[clave].clone();
                    r.position.y = this.conf.alto-this.conf.grosor;

                    var cubo = new THREE.Mesh(new THREE.BoxGeometry(this.conf.largo-2*this.conf.radio_menor, this.conf.alto, this.conf.profundidad));
                    cubo.position.x = this.conf.radio_menor;
                    cubo.position.y = this.conf.alto/2;
                    r = new CSG().subtract([r,cubo]).toMesh();
                    this.add(r);
                }
                this.add(this.estr[clave]);
            }
        }

        this.estr.S.receiveShadow = true;
        this.estr.MO.receiveShadow = true;

        this.reloj = new THREE.Clock();
        this.velocidad_puerta = 0.5;
    }
    

    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////
    

    updatePuerta() {
        var origen = {p: 0};
        var destino = {p: PI/2};

        if (this.estr.P.children[1].rotation.y == PI/2) {
            origen.p = PI/2;
            destino.p = 0;
        }

        var animacion = new TWEEN.Tween(origen).to(destino, 2000).onUpdate(() => {
            this.estr.P.children[1].rotation.y = origen.p;
        }).onComplete(() => {
            origen.p = 0;
        }).start();

        return animacion;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createSquareRoom() {
        this.estr.S = this.createFloor( this.conf.largo, this.conf.profundidad, this.conf.grosor, new THREE.MeshPhongMaterial({color: this.colorSuelo, map: repeatTexture(this.T_suelo,12,12)}) );
        
        this.estr.MN = this.createWall( this.conf.largo, this.conf.alto, this.conf.grosor, new THREE.MeshLambertMaterial ({color: this.colorPared, map: repeatTexture(this.T_pared_gris1,this.conf.largo/5,0.8,true), normalMap: repeatTexture(this.T_pared_normal1,this.conf.largo/5,0.8,true), normalScale: new THREE.Vector2(3,2)}) );
        this.estr.MN.position.z = -(this.conf.profundidad/2+this.conf.grosor/2);
        
        this.estr.MS = this.estr.MN.clone();
        this.estr.MS.material = new THREE.MeshLambertMaterial ({color: this.colorPared, map: repeatTexture(this.T_pared_gris2,this.conf.largo/5,0.8,true), normalMap: repeatTexture(this.T_pared_normal2,this.conf.largo/5,0.8,true), normalScale: new THREE.Vector2(3,2)});
        this.estr.MS.position.z = -this.estr.MN.position.z;
        
        this.estr.MO = this.createWall( this.conf.profundidad, this.conf.alto, this.conf.grosor, new THREE.MeshLambertMaterial({color: this.colorPared, map: repeatTexture(this.T_pared_gris2,this.conf.profundidad/4.5,0.8,true), normalMap: repeatTexture(this.T_pared_normal2,this.conf.profundidad/4.5,0.8,true), normalScale: new THREE.Vector2(3,2)}) );
        this.estr.MO.rotation.y += PI/2;
        this.estr.MO.position.x = -(this.conf.largo/2+this.conf.grosor/2);
        
        this.estr.ME = this.createWall( this.conf.profundidad, this.conf.alto+this.grosor_techo, this.conf.grosor, new THREE.MeshLambertMaterial({color: this.colorPared, map: repeatTexture(this.T_pared_gris1,this.conf.profundidad/4.5,1.4,true), normalMap: repeatTexture(this.T_pared_normal1,this.conf.profundidad/4.5,1.4,true), normalScale: new THREE.Vector2(3,2)}) );
        this.estr.ME.rotation.y += PI/2;
        this.estr.ME.position.x = -this.estr.MO.position.x;

        this.estr.T = this.createFloor(this.conf.largo, this.conf.profundidad, this.grosor_techo+this.conf.grosor, new THREE.MeshLambertMaterial({color: this.colorTecho}) );
        this.estr.T.position.y += this.conf.alto + this.grosor_techo + this.conf.grosor;

        var roda_pie = this.estr.S.clone();
        roda_pie.position.y += this.conf.grosor;

        var roda_pie_eliminar = roda_pie.clone();
        roda_pie_eliminar.scale.x = 1-this.conf.grosor/(2*(this.conf.largo+this.conf.radio_mayor))
        roda_pie_eliminar.scale.z = 1-this.conf.grosor/(2*(this.conf.profundidad+this.conf.radio_menor*2));

        this.estr.R = new CSG().subtract([roda_pie,roda_pie_eliminar]).toMesh();
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createCircularRoom() {
        this.createSquareRoom();

        var partes = this.createSemiCircularRoom(this.conf.radio_mayor);

        for (var parte in partes) {
            partes[parte].position.x += -this.conf.largo/2;
        }

        this.estr.R = new CSG().subtract([this.estr.R,partes.pared_eliminar]).toMesh();
        this.estr.R = new CSG().union([this.estr.R,partes.roda_pie]).toMesh();

        this.estr.S = new CSG().union([this.estr.S,partes.suelo]).toMesh();

        this.estr.T = new CSG().union([this.estr.T,partes.techo]).toMesh();

        var techo_eliminar = new THREE.Mesh( new THREE.CylinderGeometry(this.conf.radio_mayor,this.conf.radio_mayor, this.conf.largo, RESOLUCION) );
        techo_eliminar.scale.x = this.grosor_techo/this.conf.radio_mayor;
        techo_eliminar.rotation.z = PI/2;
        techo_eliminar.position.y = this.conf.alto;

        this.estr.T = new CSG().subtract([this.estr.T,techo_eliminar]).toMesh();

        this.estr.MO = new CSG().subtract([this.estr.MO,partes.pared_eliminar]).toMesh();

        this.estr.MO = new CSG().union([this.estr.MO,partes.pared]).toMesh();
    
        this.estr.CL.push(partes.columnas);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createDoubleCircularRoom( porcentaje_pared = 0.5 ) {
        var partes1 = this.createSemiCircularRoom(this.conf.radio_menor);
        var partes2 = this.createSemiCircularRoom(this.conf.radio_menor);

        for (var parte in partes1) {

            partes1[parte].rotation.y = PI/2;
            partes2[parte].rotation.y = -PI/2;

            if (porcentaje_pared < 0.5) {
                if (this.conf.radio_menor <= this.conf.largo*porcentaje_pared) {
                    partes1[parte].position.x = -(this.conf.largo/2 - this.conf.largo*porcentaje_pared);
                    partes2[parte].position.x = -(this.conf.largo/2 - this.conf.largo*porcentaje_pared);
                }
                else {
                    console.error('Error: Los radios se salen de la estructura');
                    return;
                }
            }
            else if (porcentaje_pared > 0.5) {
                if (this.conf.radio_menor <= this.conf.largo-this.conf.largo*porcentaje_pared) {
                    partes1[parte].position.x = this.conf.largo*porcentaje_pared - this.conf.largo/2;
                    partes2[parte].position.x = this.conf.largo*porcentaje_pared - this.conf.largo/2;
                }
                else {
                    console.error('Error: Los radios se salen de la estructura');
                    return;
                }
            }

            partes1[parte].position.z = this.conf.profundidad/2;
            partes2[parte].position.z = -this.conf.profundidad/2;
        }

        this.createCircularRoom();

        this.estr.R = new CSG().subtract([this.estr.R,partes1.pared_eliminar,partes2.pared_eliminar]).toMesh();
        this.estr.R = new CSG().union([this.estr.R,partes1.roda_pie,partes2.roda_pie]).toMesh();

        this.estr.S = new CSG().union([this.estr.S,partes1.suelo,partes2.suelo]).toMesh();

        if (this.techo_visible) {
            this.estr.T = new CSG().union([this.estr.T,partes1.techo,partes2.techo]).toMesh();

            var techo_eliminar = new THREE.Mesh( new THREE.CylinderGeometry(this.conf.radio_menor,this.conf.radio_menor, this.conf.profundidad, RESOLUCION ) );
            techo_eliminar.scale.z = this.grosor_techo/this.conf.radio_menor;
            techo_eliminar.rotation.x = PI/2;
            techo_eliminar.position.y = this.conf.alto;
            techo_eliminar.position.x = -(this.conf.largo/2 - this.conf.largo*porcentaje_pared);

            this.estr.T = new CSG().subtract([this.estr.T,techo_eliminar]).toMesh();
        }

        this.estr.MN = new CSG().subtract([this.estr.MN,partes2.pared_eliminar]).toMesh();
        this.estr.MN = new CSG().union([this.estr.MN,partes2.pared]).toMesh();
        this.estr.MS = new CSG().subtract([this.estr.MS,partes1.pared_eliminar]).toMesh();
        this.estr.MS = new CSG().union([this.estr.MS,partes1.pared]).toMesh();


        var estructura_columnas_der = this.createPillar_Vault();
        var estructura_columnas_izq = this.createPillar_Vault(1);

        for (var columna in estructura_columnas_der) {
            estructura_columnas_der[columna].position.z = -(this.conf.radio_mayor + this.profundidad_boveda_pilares/2 + this.radio_base_pilar);
            estructura_columnas_der[columna].position.x = this.conf.largo/2 - this.largo_boveda_pilares/2 - this.radio_base_pilar;

            estructura_columnas_izq[columna].rotation.y = PI;
            estructura_columnas_izq[columna].position.z = this.conf.radio_mayor + this.profundidad_boveda_pilares/2 + this.radio_base_pilar;
            estructura_columnas_izq[columna].position.x = this.conf.largo/2 - this.largo_boveda_pilares/2 - this.radio_base_pilar;
        }

        /*this.estr.MN = new CSG().union([this.estr.MN,estructura_columnas_der.pared]).toMesh();
        this.estr.MS = new CSG().union([this.estr.MS,estructura_columnas_izq.pared]).toMesh();*/
        this.add(estructura_columnas_der.pared);
        this.add(estructura_columnas_izq.pared);

        if (this.techo_visible) {
            this.estr.T = new CSG().subtract([this.estr.T,estructura_columnas_der.techo_eliminar]).toMesh();
            this.estr.T = new CSG().subtract([this.estr.T,estructura_columnas_izq.techo_eliminar]).toMesh();
        }

        this.estr.CL.push(estructura_columnas_der.columnas);
        this.estr.CL.push(estructura_columnas_der.arcos);
        this.estr.CL.push(estructura_columnas_izq.columnas);
        this.estr.CL.push(estructura_columnas_izq.arcos);
        this.estr.CL.push(partes1.columnas);
        this.estr.CL.push(partes2.columnas);

        var p = this.createDoor( this.rotacion_puerta );

        p.puerta.rotation.y = -PI/2;
        p.puerta_eliminar.rotation.y = -PI/2;
        p.puerta.position.x = this.conf.largo/2 + this.conf.grosor/2;
        p.puerta_eliminar.position.x = this.conf.largo/2 + this.conf.grosor/2;

        this.estr.ME = new CSG().subtract([this.estr.ME,p.puerta_eliminar]).toMesh();
        this.estr.R = new CSG().subtract([this.estr.R,p.puerta_eliminar]).toMesh();
        this.estr.P = p.puerta;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createSemiCircularRoom( radio ) {
        var cil = new THREE.Mesh( new THREE.CylinderGeometry( radio, radio, this.conf.grosor, RESOLUCION ), new THREE.MeshMatcapMaterial() );
        cil.position.y = -this.conf.grosor/2;

        var techo = cil.clone();
        techo.scale.y = this.grosor_techo/this.conf.grosor + 1; // (x+y)/y = x/y + y/y = x/y + 1
        techo.position.y = this.conf.alto + this.grosor_techo/2 + this.conf.grosor/2;

        var pared = new THREE.Mesh( new THREE.CylinderGeometry( radio+this.conf.grosor, radio+this.conf.grosor, this.conf.alto, RESOLUCION ), new THREE.MeshMatcapMaterial() );
        var cil_int = new THREE.Mesh( new THREE.CylinderGeometry( radio, radio, this.conf.alto, RESOLUCION ) );
        
        var p = new CSG().subtract([pared,cil_int]).toMesh();
        p.position.y = this.conf.alto/2

        var cub = new THREE.Mesh( new THREE.BoxGeometry( radio+this.conf.grosor, this.conf.alto+2*this.conf.grosor, 2*radio+2*this.conf.grosor ) );  
        cub.position.x = (radio+this.conf.grosor)/2;
        cub.position.y = this.conf.alto/2;

        var pared_interior = new THREE.Mesh( new THREE.BoxGeometry( 2*this.conf.grosor, this.conf.alto, 2*radio) );
        pared_interior.position.y = this.conf.alto/2;

        var esf_techo = new THREE.Mesh( new THREE.SphereGeometry( radio, RESOLUCION, RESOLUCION/2 ) );
        esf_techo.scale.y = this.grosor_techo/radio;
        esf_techo.position.y = this.conf.alto;

        var c1 = this.createPillar();
        var c2 = c1.clone();

        c1.rotation.y = -PI/2;

        c1.position.z = radio;
        c2.position.z = -radio;

        var columnas = new THREE.Object3D().add(c1,c2);


        var roda_pie = cil.clone();
        roda_pie.position.y += this.conf.grosor;

        var roda_pie_eliminar = roda_pie.clone();
        roda_pie_eliminar.scale.x = 1-this.conf.grosor/(2*(this.conf.largo+this.conf.radio_mayor))
        roda_pie_eliminar.scale.z = 1-this.conf.grosor/(2*(this.conf.profundidad+this.conf.radio_menor*2));

        roda_pie = new CSG().subtract([roda_pie,roda_pie_eliminar]).toMesh();

        return {
            roda_pie: new CSG().subtract([roda_pie,cub]).toMesh(),
            suelo: new CSG().subtract([cil,cub]).toMesh(),
            techo: new CSG().subtract([techo,esf_techo]).toMesh(),
            pared: new CSG().subtract([p,cub]).toMesh(),
            pared_eliminar: pared_interior,
            columnas: columnas
        };
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createPillar() {
        var columnaCompleta = new THREE.Object3D();

        var r = this.radio_pilar;

        var alto = this.conf.alto-r*this.PILAR_PROP_ALTO*2;

        var prisma1 = new THREE.Mesh( new THREE.CylinderGeometry(r,r*this.PILAR_PROP_RADIO,r*this.PILAR_PROP_ALTO,4), new THREE.MeshLambertMaterial({color: this.colorPared, map: this.T_columna/*repeatTexture(this.T_columna,1,3,true)*/}) );
        var prisma2 = new THREE.Mesh( new THREE.CylinderGeometry(r,this.radio_base_pilar,r*this.PILAR_PROP_ALTO,8), new THREE.MeshLambertMaterial({color: this.colorTecho, map: this.T_columna/*repeatTexture(this.T_columna,1,3,true)*/}) );

        var prisma = new THREE.Object3D().add(prisma1,prisma2);
        prisma.position.y = r*this.PILAR_PROP_ALTO/2;

        prisma.rotation.y = PI/4;

        var base1 = prisma.clone();
        var base2 = prisma.clone();
        
        base2.rotation.x = PI;
        base2.position.y += this.conf.alto-r*this.PILAR_PROP_ALTO;

        var colum = new THREE.Shape();
        colum.moveTo(0.1,0);
        colum.lineTo(r,0);

        colum.bezierCurveTo( r+r*0.25, 0, /**/ r+r*0.25, r*0.25, /**/ r+r*0.1, r*0.4 );
        colum.quadraticCurveTo( r, r*0.5, /**/ r, r*0.6 );
        colum.lineTo( r, alto/3-r*0.075 );

        colum.bezierCurveTo( r+r*0.075, alto/3-r*0.075, /**/ r+r*0.075, alto/3+r*0.075, /**/ r, alto/3+r*0.075 );
        colum.lineTo( r, alto/3*2-r*0.075 );

        colum.bezierCurveTo( r+r*0.075, alto/3*2-r*0.075, /**/ r+r*0.075, alto/3*2+r*0.075, /**/ r, alto/3*2+r*0.075 );
        colum.lineTo( r, alto-r*0.55 );

        colum.bezierCurveTo( r+r*0.2, alto-r*0.55, /**/ r+r*0.2, alto-r*0.35, /**/ r, alto-r*0.35 );
        colum.bezierCurveTo( r+r*0.35, alto-r*0.35, /**/ r+r*0.35, alto-r*0.2, /**/ r, alto+r*0.01 );
        colum.lineTo(0.1,alto+r/2);
        
        var points = colum.extractPoints(10).shape;

        var columna = new THREE.Mesh( new THREE.LatheGeometry(points, RESOLUCION, 0, Math.PI*2), new THREE.MeshMatcapMaterial() );

        var cil = new THREE.Mesh( new THREE.CylinderGeometry(r+0.001,r+0.001,alto,RESOLUCION), new THREE.MeshLambertMaterial({color: '#AAAAAA', map: repeatTexture(this.T_columna,1,3,true)}) );
        cil.position.y = alto/2;

        columna = new CSG().union([cil,columna]).toMesh();

        columna.position.y = r*this.PILAR_PROP_ALTO;

        columnaCompleta.add(base1,base2,columna);

        columnaCompleta.rotation.y = PI;

        return columnaCompleta;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createPillar_Vault( Izq = 0) {
        var pilar = this.createPillar();

        var columnas = new THREE.Object3D();
        var arcos = new THREE.Object3D();

        var l = this.largo_boveda_pilares / this.num_bovedas_pilares;

        for (let i = 0; i<2*(this.num_bovedas_pilares+1); i++) {
            let p = pilar.clone();

            if (i<this.num_bovedas_pilares+1) {
                p.position.x = -this.largo_boveda_pilares/2 + i*l;
                p.position.z = -this.profundidad_boveda_pilares/2;
            }
            else {
                p.position.x = -this.largo_boveda_pilares/2 + (i-(this.num_bovedas_pilares+1))*l;
                p.position.z = this.profundidad_boveda_pilares/2;
            }

            columnas.add(p);
        }

        ////////////////////////////////////////////////

        var altura = this.radio_pilar * this.PILAR_PROP_ALTO + 2*(this.conf.alto-this.radio_pilar*this.PILAR_PROP_ALTO*2)/3 + this.radio_pilar*0.075 + this.radio_pilar/2;

        var pared = new THREE.Shape();

        pared.moveTo( -l/2+this.radio_pilar/2, 0 );
        pared.lineTo( -l/2+this.radio_pilar/2, altura );
        pared.bezierCurveTo( -l/4, this.conf.alto, /**/ l/4, this.conf.alto, /**/ l/2-this.radio_pilar/2, altura );
        pared.lineTo( l/2-this.radio_pilar/2, 0 );
        pared.lineTo( l/2, 0 );
        pared.lineTo( l/2, this.conf.alto+this.grosor_techo+this.conf.grosor );
        pared.lineTo( -l/2, this.conf.alto+this.grosor_techo+this.conf.grosor );
        pared.lineTo( -l/2, 0 );
        pared.lineTo( -l/2+this.radio_pilar/2, 0 );

        var muro = new THREE.Mesh( new THREE.ExtrudeGeometry( pared, {
            depth: this.radio_base_pilar,
            steps: 1,
            bevelEnabled: false,
        } ), new THREE.MeshLambertMaterial({color: this.colorLadrillo, map: repeatTexture(this.T_ladrillo,0.5,0.5,true)}));

        muro.position.z = -this.radio_base_pilar;


        muro.position.z += -this.profundidad_boveda_pilares/2;

        var csg = new CSG();

        for (let i=0; i<this.num_bovedas_pilares; i++) {
            let m = muro.clone();

            m.position.x = -(this.largo_boveda_pilares/2 - l/2) + i*l;

            if (i == 0) csg.setFromMesh(m);
            else csg.union([m]);
        }

        var paredes = csg.toMesh();

        ////////////////////////////////////////////////

        var curva = new THREE.Shape();
        curva.moveTo( -l/2, altura );
        curva.bezierCurveTo( -l/4, this.conf.alto, /**/ l/4, this.conf.alto, /**/ l/2, altura );


        var circulo = new THREE.Shape();
        circulo.absarc(0,0,this.radio_pilar,0,PI*2,false);

        var curva_path = new THREE.CatmullRomCurve3(shapeToVector3( curva, RESOLUCION/4 ));
        
        var arco = new THREE.Mesh( new THREE.ExtrudeGeometry( circulo, {
            steps: RESOLUCION/2,
            curveSegments: RESOLUCION/4,
            extrudePath: curva_path
        } ), new THREE.MeshLambertMaterial({color: '#AAAAAA', map: this.T_columna}) );

        arco.position.z = -this.profundidad_boveda_pilares/2;

        for (let i=0; i<this.num_bovedas_pilares; i++) {
            let a = arco.clone();

            a.position.x = -(this.largo_boveda_pilares/2 - l/2) + i*l;
            
            arcos.add(a);
        }
        
        ////////////////////////////////////////////////

        var ancho = l - 2*this.radio_base_pilar;

        var boveda = new THREE.Shape();
        boveda.moveTo( -ancho/2, 0 );
        boveda.lineTo( ancho/2, 0 );
        boveda.quadraticCurveTo( ancho/2, 2*this.grosor_techo/3, /**/ 0, this.grosor_techo );
        boveda.quadraticCurveTo( -ancho/2, 2*this.grosor_techo/3, /**/ -ancho/2, 0 );

        boveda = new THREE.Shape(shapeToVector3( boveda, RESOLUCION/4 ) );

        var largo_boveda = this.profundidad_boveda_pilares+2*this.radio_base_pilar+this.conf.radio_mayor;

        var boveda_arco = new THREE.Mesh( new THREE.ExtrudeGeometry( boveda, {
            depth: largo_boveda,
            steps: 1,
            bevelEnabled: false,
        } ) );

        boveda_arco.position.z = -(this.profundidad_boveda_pilares+2*this.radio_base_pilar)/2;

        var techo = new CSG();

        for (let i=0; i<this.num_bovedas_pilares; i++) {
            let b = boveda_arco.clone();

            b.position.x = -(this.largo_boveda_pilares/2 - l/2) + i*l;

            if (i == 0) techo.setFromMesh(b);
            else techo.union([b]);
        }

        boveda_arco.scale.z = (this.largo_boveda_pilares+this.conf.radio_menor+2*this.radio_base_pilar)/largo_boveda;
        boveda_arco.scale.x = (this.profundidad_boveda_pilares-2*this.radio_base_pilar)/ancho;
        boveda_arco.rotation.y = -PI/2;
        boveda_arco.position.z += (this.profundidad_boveda_pilares+2*this.radio_base_pilar)/2;
        boveda_arco.position.x = this.largo_boveda_pilares/2 + this.radio_base_pilar + Izq*this.conf.radio_menor;
        
        techo.union([boveda_arco]);

        techo = techo.toMesh();

        techo.position.y = this.conf.alto;

        return {
            pared: paredes,
            arcos: arcos,
            columnas: columnas,
            techo_eliminar: techo
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createDoor() {
        var estructura_puerta = new THREE.Object3D();
        var puerta_OBJ = new THREE.Object3D();

        var ancho_puerta = 1.35;
        var alto_puerta = 2.8;

        var puerta = this.createWall( ancho_puerta, alto_puerta, this.conf.grosor, new THREE.MeshLambertMaterial({color: '#AAAAAA', map: repeatTexture(this.T_puerta, 1, 1.2, true)}) );
        var cil = new THREE.Mesh( new THREE.CylinderGeometry( ancho_puerta/2, ancho_puerta/2, this.conf.grosor, RESOLUCION/2 ) );

        cil.scale.z = alto_puerta/(2*ancho_puerta);
        cil.rotation.x = PI/2;
        cil.position.y = 3*alto_puerta/4;

        var cubo = new THREE.Mesh( new THREE.BoxGeometry( ancho_puerta, alto_puerta/4, this.conf.grosor ) );
        cubo.position.y = 3*alto_puerta/4 + alto_puerta/8;

        cubo = new CSG().subtract([cubo, cil]).toMesh();

        puerta = new CSG().subtract([puerta, cubo]).toMesh();

        var pomo = new THREE.Mesh( new THREE.CylinderGeometry( 0.04, 0.04, 0.1, RESOLUCION/4 ), new THREE.MeshPhongMaterial({color: '#AAAAAA', map: this.T_pomo}) );
        var toro = new THREE.Mesh( new THREE.TorusGeometry( 0.1, 0.02, RESOLUCION/8, RESOLUCION/4 ), new THREE.MeshMatcapMaterial() );

        pomo.rotation.x = PI/2;
        toro.position.y = -0.1 + 0.01;
        toro.position.z = 0.1/8;

        pomo = new CSG().union([pomo, toro]).toMesh();

        var silueta_pomo = pomo.clone();
        silueta_pomo.material = new THREE.MeshBasicMaterial({color: '#505050', side: THREE.BackSide});
        silueta_pomo.scale.set(1.05,1.05,1.05);
        silueta_pomo.visible = false;

        pomo.position.y = alto_puerta/2 + 0.05;
        pomo.position.x = -ancho_puerta/2 + ancho_puerta*0.25;

        var p2 = pomo.clone();

        p2.rotation.y = PI;

        pomo.position.z = this.conf.grosor/2 + 0.05;
        p2.position.z = -this.conf.grosor/2 - 0.05;

        silueta_pomo.position.copy(pomo.position);

        pomo = new CSG().union([ pomo, p2]).toMesh();

        puerta.position.x = -ancho_puerta/2;
        pomo.position.x = -ancho_puerta/2;
        silueta_pomo.position.x += -ancho_puerta/2;

        pomo.name = 'pomo';

        function setSilueta(booleano) {
            silueta_pomo.visible = booleano;
        }

        pomo.setSilueta = setSilueta;

        puerta_OBJ.add(puerta.clone(), pomo, silueta_pomo);

        puerta_OBJ.position.x = ancho_puerta/2;// + this.conf.grosor/2;

        var ancho_marco = ancho_puerta/2+ancho_puerta/4;

        // Marco de puerta
        var marco_SHAPE = new THREE.Shape();
        marco_SHAPE.moveTo( -ancho_marco, 0 ); 
        marco_SHAPE.lineTo( ancho_marco, 0 );
        marco_SHAPE.lineTo( ancho_marco, 3*alto_puerta/4 );
        marco_SHAPE.quadraticCurveTo( ancho_marco, alto_puerta+alto_puerta/10, /**/ ancho_puerta/2, alto_puerta+alto_puerta/8 );
        marco_SHAPE.quadraticCurveTo( this.conf.grosor/2, alto_puerta+3*alto_puerta/16, /**/ this.conf.grosor/2, alto_puerta+alto_puerta/4 );
        marco_SHAPE.bezierCurveTo( this.conf.grosor/2, alto_puerta+alto_puerta/4+this.conf.grosor/2, /**/ -this.conf.grosor/2, alto_puerta+alto_puerta/4+this.conf.grosor/2, /**/ -this.conf.grosor/2, alto_puerta+alto_puerta/4 );
        marco_SHAPE.quadraticCurveTo( -this.conf.grosor/2, alto_puerta+3*alto_puerta/16, /**/ -ancho_puerta/2, alto_puerta+alto_puerta/8 );
        marco_SHAPE.quadraticCurveTo( -ancho_marco, alto_puerta+alto_puerta/10, /**/ -ancho_marco, 3*alto_puerta/4 );
        marco_SHAPE.lineTo( -ancho_marco, 0 );

        marco_SHAPE = new THREE.Shape(shapeToVector3( marco_SHAPE, RESOLUCION/4 ) );

        var T_marco = this.T_columna.clone();
        T_marco.offset.x = 0.5;
        var marco = new THREE.Mesh( new THREE.ExtrudeGeometry( marco_SHAPE, { depth: 2*this.conf.grosor, bevelThickness: 0.16, bevelSegments: 4 } ), new THREE.MeshLambertMaterial({color: '#AAAAAA', map: T_marco}) );
        marco.position.z = -this.conf.grosor;

        puerta.position.x += ancho_puerta/2;
        var puerta_eliminar = puerta.clone();
        puerta_eliminar.scale.x = 1 + this.conf.grosor/ancho_puerta;
        puerta_eliminar.scale.y = (alto_puerta + this.conf.grosor/2)/alto_puerta;
        puerta_eliminar.scale.z = 6;

        marco = new CSG().subtract([ marco, puerta_eliminar ]).toMesh();

        var puerta_eliminar_pared = puerta_eliminar.clone();

        puerta_eliminar.scale.y = 1.1;

        var p1_eliminar = puerta_eliminar.clone();
        p1_eliminar.position.z = -(3*this.conf.grosor + this.conf.grosor);
        puerta_eliminar.position.z = 3*this.conf.grosor + this.conf.grosor;

        var suelo_eliminar = new THREE.Mesh(new THREE.BoxGeometry(ancho_puerta+this.conf.grosor,1,1));
        suelo_eliminar.position.y = -0.5;

        marco = new CSG().subtract([ marco, suelo_eliminar, puerta_eliminar, p1_eliminar ]).toMesh();

        puerta_OBJ.name = 'puerta';
        estructura_puerta.add( marco, puerta_OBJ );
        
        puerta_eliminar_pared.scale.x = 1.1;
        puerta_eliminar_pared.scale.y = 1.1;

        this.anchoPuerta = new THREE.Box3().setFromObject(puerta_eliminar_pared).getSize(new THREE.Vector3()).x;

        estructura_puerta.name = 'estructura_puerta_OBJ';

        return {
            puerta: estructura_puerta,
            puerta_eliminar: puerta_eliminar_pared
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //


    createFloor( largo, profundidad, grosor, material ) {
        var plano = new THREE.Mesh( new THREE.BoxGeometry(largo,grosor,profundidad), material );

        plano.position.y = -grosor/2;

        return plano;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    createWall( largo, alto, grosor, material ) {
        var plano = new THREE.Mesh( new THREE.BoxGeometry(largo,alto,grosor), material );

        plano.position.y = alto/2;

        return plano;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    getDimensiones() {

        var op = this.conf;

        // TODOS estos cálculos están repetidos, pero no sería eficiente guardarlos en variables pues tendríamos muchas,
        // volvemos a calcular sólo aquellas distancias que son necesarias

        var anchoArcos = this.largo_boveda_pilares / this.num_bovedas_pilares;
        var posX_centroArcos_array = [];
        for (let i=0; i<this.num_bovedas_pilares; i++) {
            posX_centroArcos_array.push( 
                -(this.largo_boveda_pilares/2 - anchoArcos/2) + i*anchoArcos +
                (op.largo/2 - this.largo_boveda_pilares/2 - this.radio_base_pilar) );
        }

        var dist_anchoColumnas = op.profundidad/2 - op.radio_mayor -this.radio_base_pilar*4;


        var posV2xz_columnas_array = [];
        for (let i = 0; i<2*(this.num_bovedas_pilares+1); i++) {
            if (i!=3 && i!=7) {
                if (i<this.num_bovedas_pilares+1) {
                    posV2xz_columnas_array.push( new THREE.Vector2( -this.largo_boveda_pilares/2 + i*anchoArcos + (this.conf.largo/2 - this.largo_boveda_pilares/2 - this.radio_base_pilar), -op.radio_mayor - this.radio_base_pilar ) );
                }
                else {
                    posV2xz_columnas_array.push( new THREE.Vector2( -this.largo_boveda_pilares/2 + (i-(this.num_bovedas_pilares+1))*anchoArcos + (this.conf.largo/2 - this.largo_boveda_pilares/2 - this.radio_base_pilar), op.radio_mayor + this.radio_base_pilar ) );
                }
            }
        }


        return {
            largo: op.largo,
            profundidad: op.profundidad,
            alto: op.alto,
            grosor: op.grosor,
            ancho_puerta: this.anchoPuerta,
            radio_central: op.radio_mayor,
            radio_lateral: op.radio_menor,
            rad_pilar: this.radio_pilar,
            rad_base_pilarPrisma: this.radio_base_pilar,


            posV2xz_columnas_array: posV2xz_columnas_array,                         // ES UN ARRAY, cada una de las posiciones en xz donde están los centros de las columnas
            

            dist_anchoColumnas: dist_anchoColumnas,
            posZ_centroBovedasInterColumnas_positiva: op.radio_mayor + 2*this.radio_base_pilarPrisma + dist_anchoColumnas/2,


            posX_centroArcos_array: posX_centroArcos_array,                         // ES UN ARRAY, cada una de las posiciones en x donde están los centros de los espacios entre columnas (arcos)
            posZ_centroArcos_positiva: op.profundidad/2,                            // posición que es la distancia desde el centro hasta la pared SUR, para la pared NORTE se pone la misma en negativo
            dist_anchoArcos_estanteria: anchoArcos - 2*this.radio_base_pilar,       // distancia que es el ancho desde cada centro de columna pero sin el radio de la base (los prismas), esta es el espacio disponible entre cada columna


            posV2xz_centro_HabCircular_Lateral: new THREE.Vector2(-op.largo/2+op.radio_menor ,op.profundidad/2),    // ES UN VECTOR2, posición del centro de la hab_cir_lateral SUR, resulta estar justo al borde de la pared SUR/NORTE  ---  para la NORTE la z en negativo
            rad_HabCircular_Laterales: op.radio_menor,                                                              // radio de las habitaciones circulares laterales, es la distancia del centro del circulo a la pared (también circular)


            posV2xz_centro_HabCircular_Principal: new THREE.Vector2(-op.largo/2,0),     // ES UN VECTOR2, posición del centro de la hab_cir_principal, resulta estar justo al borde de la pared OESTE
            rad_HabCircular_Principal: op.radio_mayor,                                  // radio de la habitación circular principal

        }
    }
}

export {H_estructura}