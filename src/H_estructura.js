import * as THREE from '../libs/three.module.js'
import { CSG } from '../libs/CSG-v2.js'
 
const PI = Math.PI;

class H_estructura extends THREE.Object3D {
    constructor( opciones ) {
        super();

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


        // Estructuras posibles:
        // Muros ('Mn' con {n='Orientación (N,S,E,O...)'} )
        // Suelos ('S')
        // Puertas ('P')
        this.estr = {};


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

        var pilar = this.createPillar(0.2);
        pilar.position.x = this.conf.largo/2 - 0.27;
        pilar.position.z = -this.conf.profundidad/2 + 0.27;
        this.add(pilar);

        for(var clave in this.estr) {
            if (clave == 'T' && !this.techo_visible) continue;
            this.add(this.estr[clave]);
        }
    }


    createCircularRoom() {
        this.createSquareRoom();

        var partes = this.createSemiCircularRoom(this.conf.radio_mayor);

        for (var parte in partes) {
            partes[parte].position.x += -this.conf.largo/2;
        }

        this.estr.S = new CSG().union([this.estr.S,partes.suelo]).toMesh();

        this.estr.T = new CSG().union([this.estr.T,partes.techo]).toMesh();

        this.estr.MO = new CSG().subtract([this.estr.MO,partes.pared_eliminar]).toMesh();

        this.estr.MO = new CSG().union([this.estr.MO,partes.pared]).toMesh();
    }


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

        this.estr.S = new CSG().union([this.estr.S,partes1.suelo,partes2.suelo]).toMesh();
        this.estr.T = new CSG().union([this.estr.T,partes1.techo,partes2.techo]).toMesh();
        this.estr.MN = new CSG().subtract([this.estr.MN,partes2.pared_eliminar]).toMesh();
        this.estr.MN = new CSG().union([this.estr.MN,partes2.pared]).toMesh();
        this.estr.MS = new CSG().subtract([this.estr.MS,partes1.pared_eliminar]).toMesh();
        this.estr.MS = new CSG().union([this.estr.MS,partes1.pared]).toMesh();
    }


    createSquareRoom() {
        this.estr.S = this.createFloor( this.conf.largo, this.conf.profundidad, this.conf.grosor, new THREE.MeshMatcapMaterial() );
        
        this.estr.MN = this.createWall( this.conf.largo, this.conf.alto, this.conf.grosor, new THREE.MeshMatcapMaterial() );
        this.estr.MN.position.z = -(this.conf.profundidad/2+this.conf.grosor/2);
        
        this.estr.MS = this.estr.MN.clone();
        this.estr.MS.position.z = -this.estr.MN.position.z;
        
        this.estr.MO = this.createWall( this.conf.profundidad, this.conf.alto, this.conf.grosor, new THREE.MeshMatcapMaterial() );
        this.estr.MO.rotation.y += PI/2;
        this.estr.MO.position.x = -(this.conf.largo/2+this.conf.grosor/2);
        
        this.estr.ME = this.estr.MO.clone();
        this.estr.ME.position.x = -this.estr.MO.position.x;

        this.estr.T = this.estr.S.clone();
        this.estr.T.position.y += this.conf.alto + this.conf.grosor;
        
    }


    createSemiCircularRoom( radio ) {
        var cil = new THREE.Mesh( new THREE.CylinderGeometry( radio, radio, this.conf.grosor, 100 ), new THREE.MeshMatcapMaterial() );
        cil.position.y = -this.conf.grosor/2;

        var techo = cil.clone();
        techo.position.y += this.conf.alto+this.conf.grosor;

        var pared = new THREE.Mesh( new THREE.CylinderGeometry( radio+this.conf.grosor, radio+this.conf.grosor, this.conf.alto, 100 ), new THREE.MeshMatcapMaterial() );
        var cil_int = new THREE.Mesh( new THREE.CylinderGeometry( radio, radio, this.conf.alto, 100 ) );
        
        var p = new CSG().subtract([pared,cil_int]).toMesh();
        p.position.y = this.conf.alto/2

        var cub = new THREE.Mesh( new THREE.BoxGeometry( radio+this.conf.grosor, this.conf.alto+2*this.conf.grosor, 2*radio+2*this.conf.grosor ) );  
        cub.position.x = (radio+this.conf.grosor)/2;
        cub.position.y = this.conf.alto/2;

        var pared_interior = new THREE.Mesh( new THREE.BoxGeometry( 2*this.conf.grosor, this.conf.alto, 2*radio) );
        pared_interior.position.y = this.conf.alto/2;
        //pared_interior.position.x = -this.conf.grosor/2;

        var s = new CSG().subtract([cil,cub]).toMesh();
        var t = new CSG().subtract([techo,cub]).toMesh();
        
        return {
            suelo: s,
            techo: t,
            pared: new CSG().subtract([p,cub]).toMesh(),
            pared_eliminar: pared_interior
        };
    }


    createFloor( largo, profundidad, grosor, material ) {
        var plano = new THREE.Mesh( new THREE.BoxGeometry(largo,profundidad,grosor), material );

        plano.rotation.x = -Math.PI/2;

        // empezamos en nivel 0
        plano.position.y = -grosor/2;

        return plano;
    }


    createWall( largo, alto, grosor, material ) {
        var plano =  this.createFloor(largo,alto,grosor,material);

        plano.rotation.x += Math.PI/2;

        plano.position.y = alto/2;

        return plano;
    }


    createPillar( r ) {
        const PROP_ALTO = 1.6;
        const PROP_RADIO = 1.8;

        var alto = this.conf.alto-r*PROP_ALTO*2;

        var prisma1 = new THREE.Mesh( new THREE.CylinderGeometry(r,r*PROP_RADIO,r*PROP_ALTO,4), new THREE.MeshMatcapMaterial() );
        var prisma2 = new THREE.Mesh( new THREE.CylinderGeometry(r,r*PROP_RADIO*Math.cos(PI/4),r*PROP_ALTO,8), new THREE.MeshMatcapMaterial() );

        var prisma = new CSG().union([prisma1,prisma2]).toMesh();
        prisma.position.y = r*PROP_ALTO/2;

        prisma.rotation.y = PI/4;

        var base1 = prisma.clone();
        var base2 = prisma.clone();
        
        base2.rotation.x = PI;
        base2.position.y += this.conf.alto-r*PROP_ALTO;

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
        var columna = new THREE.Mesh( new THREE.LatheGeometry(points, 100, 0, Math.PI*2), new THREE.MeshMatcapMaterial() );

        columna.position.y = r*PROP_ALTO;

        return new CSG().union([base1,base2,columna]).toMesh();
    }


}

export {H_estructura}