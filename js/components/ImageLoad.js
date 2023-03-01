import { MeshBasicMaterial, Mesh, ExtrudeGeometry } from "three";
import { SVGLoader } from '/node_modules/three/examples/jsm/loaders/SVGLoader.js'
import { Group, Color, DoubleSide } from "three";

class ImageLoad {

    scene;

    pc;
    pc_powerPort;
    pc_LANport;

    pc_cable_router;

    router;
    router_powerPort;
    router_LANport1;
    router_LANport2;
    router_WANport;

    elements;

    constructor(scene){
        this.elements = []
        this.scene = scene;
    
        this.loadAllMeshes();
    }

    async loadAllMeshes(){
        this.pc = await this.createMesh('./images/physicalComponents/PC.svg', true)
        this.pc_powerPort = await this.createMesh('./images/physicalComponents/powerPort.svg', false);
        this.pc_LANport = await this.createMesh('./images/physicalComponents/LANport.svg', false);
        this.router = await this.createMesh('./images/physicalComponents/router.svg', true);
        this.router_powerPort = await this.createMesh('./images/physicalComponents/powerPort.svg', false);
        this.router_LANport1 = await this.createMesh('./images/physicalComponents/LANport.svg', false);
        this.router_LANport2 = await this.createMesh('./images/physicalComponents/LANport.svg', false);
        this.router_WANport = await this.createMesh('./images/physicalComponents/WANport.svg', false);
        this.pc_cable_router = await this.createMesh('./images/physicalComponents/cable.svg', false)

        this.pc.position.set(-1, 0, -3);
        this.pc_powerPort.position.set(-0.95, -0.1, -3);
        this.pc_LANport.position.set(-0.75, -0.09, -3);

        this.pc_cable_router.position.set(-0.685, 0.23, -3);

        this.router.position.set(-0.05, 0.125, -3);
        this.router_powerPort.position.set(0.01, -0.135, -3);
        this.router_LANport1.position.set(0.2, -0.125, -3);
        this.router_LANport2.position.set(0.45, -0.125, -3);
        this.router_WANport.position.set(0.7, -0.125, -3);
    
        this.scene.add(this.pc, this.pc_powerPort, this.pc_LANport);
        this.scene.add(this.pc_cable_router);
        this.scene.add(this.router, this.router_powerPort, this.router_LANport1, this.router_LANport2, this.router_WANport);
    };
    
    async createMesh(imagePath, baseElement){   
        return new Promise((resolve) => {
            let loader = new SVGLoader();
        
            loader.load(imagePath, data => {
                let paths = data.paths;
                const groupImage = new Group();
                
                const extrusionSettings = {
                    depth: 2, 
                    bevelEnabled: false
                };
                
                // https://muffinman.io/blog/three-js-extrude-svg-path/
                // To get the right geometry and material corresponding to an image
                paths.forEach((path, i) => {
                    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_svg.html
                    // To color the border and background of the mesh
                    const fillColor = path.userData.style.fill;
                    if (fillColor !== undefined && fillColor !== 'none') {
                        const material = new MeshBasicMaterial({
                            color: new Color().setStyle(fillColor).convertSRGBToLinear(),
                            opacity: path.userData.style.fillOpacity,
                            transparent: true,
                            side: DoubleSide,
                            depthWrite: false, 
                            depthTest: baseElement
                        });
                
                        const shapes = path.toShapes(true);
                        shapes.forEach((shape, j) => {
                            const geometry = new ExtrudeGeometry(shape, extrusionSettings);
                            const mesh = new Mesh(geometry, material);
                            groupImage.add(mesh);
                        });
                    }
                
                    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_svg.html
                    // To color inside the mesh
                    const strokeColor = path.userData.style.stroke;
                    if (strokeColor !== undefined && strokeColor !== 'none') {
                        const material = new MeshBasicMaterial({
                            color: new Color().setStyle(strokeColor).convertSRGBToLinear(),
                            opacity: path.userData.style.strokeOpacity,
                            transparent: true,
                            side: DoubleSide,
                            depthWrite: false,
                            depthTest: baseElement    
                        });
                        for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
                            const subPath = path.subPaths[ j ];
                            const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
                            if (geometry) {
                                const mesh = new Mesh(geometry, material);
                                groupImage.add(mesh);
                            }
                        }
                    }
                });
                
                groupImage.scale.set(0.005, 0.005, 0.005)
                groupImage.scale.y *= -1;
                groupImage.scale.z *= -1;
                    
                // To superimpose the port components on the device components
                if(baseElement){
                    groupImage.renderOrder = 0;
                }else{
                    groupImage.renderOrder = 1;
                } 
                this.elements.push(groupImage);
                return resolve(groupImage);
            });
        });
    } 

    async replaceMesh(imagePath, device, portNbr){
        const name = imagePath.substring(28, imagePath.length-4);
        if(name == "cable" || name == "cable_currentStep" ||
            name == "cable_rightMarker" || name == "cable_wrongMarker"){
                const pos = this.pc_cable_router.position;
                this.scene.remove(this.pc_cable_router);
                this.pc_cable_router = await this.createMesh(imagePath, false);
                this.pc_cable_router.position.copy(pos);
                this.scene.add(this.pc_cable_router);
        }
        else if(name == "PC" || name == "PC_currentStep" ||
            name == "PC_rightMarker" || name == "PC_wrongMarker"){
                const pos = this.pc.position;
                this.scene.remove(this.pc);
                this.pc = await this.createMesh(imagePath, true);
                this.pc.position.copy(pos);
                this.scene.add(this.pc);
        }
        else if(name == "router" || name == "router_currentStep" ||
            name == "router_rightMarker" || name == "router_wrongMarker"){
                const pos = this.router.position;
                this.scene.remove(this.router);
                this.router = await this.createMesh(imagePath, true);
                this.router.position.copy(pos);
                this.scene.add(this.router);
        }
        else if(device == "PC"){
            if(name == "powerPort" || name == "powerPort_currentStep" ||
                name == "powerPort_rightMarker" || name == "powerPort_wrongMarker"){
                    const pos = this.pc_powerPort.position;
                    this.scene.remove(this.pc_powerPort);
                    this.pc_powerPort = await this.createMesh(imagePath, false);
                    this.pc_powerPort.position.copy(pos);
                    this.scene.add(this.pc_powerPort);
            }
            else if(name == "LANport" || name == "LANport_currentStep" ||
                name == "LANport_rightMarker" || name == "LANport_wrongMarker"){
                    const pos = this.pc_LANport.position;
                    this.scene.remove(this.pc_LANport);
                    this.pc_LANport = await this.createMesh(imagePath, false);
                    this.pc_LANport.position.copy(pos);
                    this.scene.add(this.pc_LANport);
            }
        }
        else if(device == "router"){
            if(name == "powerPort" || name == "powerPort_currentStep" ||
                name == "powerPort_rightMarker" || name == "powerPort_wrongMarker"){
                    const pos = this.router_powerPort.position;
                    this.scene.remove(this.router_powerPort);
                    this.router_powerPort = await this.createMesh(imagePath, false);
                    this.router_powerPort.position.copy(pos);
                    this.scene.add(this.router_powerPort);
            }
            else if(name == "LANport" || name == "LANport_currentStep" ||
                name == "LANport_rightMarker" || name == "LANport_wrongMarker"){
                    if(portNbr == 1){
                        const pos = this.router_LANport1.position;
                        this.scene.remove(this.router_LANport1);
                        this.router_LANport1 = await this.createMesh(imagePath, false);
                        this.router_LANport1.position.copy(pos);
                        this.scene.add(this.router_LANport1);
                    }else if(portNbr == 2){
                        const pos = this.router_LANport2.position;
                        this.scene.remove(this.router_LANport2);
                        this.router_LANport2 = await this.createMesh(imagePath, false);
                        this.router_LANport2.position.copy(pos);
                        this.scene.add(this.router_LANport2);
                    }
            }
            else if(name == "WANport" || name == "WANport_currentStep" ||
                name == "WANport_rightMarker" || name == "WANport_wrongMarker"){
                    const pos = this.router_WANport.position;
                    this.scene.remove(this.router_WANport);
                    this.router_WANport = await this.createMesh(imagePath, false);
                    this.router_WANport.position.copy(pos);
                    this.scene.add(this.router_WANport);
            }
        }
    }
}

/*

function createMeshFromImage(imagePath, scene, positionX, positionY, positionZ, baseElement){

    let loader = new SVGLoader();
    loader.load(imagePath, (data) => {

        let paths = data.paths;
        const groupImage = new Group();

        const extrusionSettings = {
            depth: 2,
            bevelEnabled: false
        };

        // https://muffinman.io/blog/three-js-extrude-svg-path/
        // To get the right geometry and material corresponding to an image
        paths.forEach((path, i) => {
            // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_svg.html
            // To color the border and background of the mesh
            const fillColor = path.userData.style.fill;
            if (fillColor !== undefined && fillColor !== 'none') {
                const material = new MeshBasicMaterial({
                    color: new Color().setStyle(fillColor).convertSRGBToLinear(),
                    opacity: path.userData.style.fillOpacity,
                    transparent: true,
                    side: DoubleSide,
                    depthWrite: false, 
                    depthTest: baseElement
                });

                const shapes = path.toShapes(true);
                shapes.forEach((shape, j) => {
                    const geometry = new ExtrudeGeometry(shape, extrusionSettings);
                    const mesh = new Mesh(geometry, material);
                    groupImage.add(mesh);
                });
            }

            // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_svg.html
            // To color inside the mesh
            const strokeColor = path.userData.style.stroke;
            if (strokeColor !== undefined && strokeColor !== 'none') {
                const material = new MeshBasicMaterial({
                    color: new Color().setStyle(strokeColor).convertSRGBToLinear(),
                    opacity: path.userData.style.strokeOpacity,
                    transparent: true,
                    side: DoubleSide,
                    depthWrite: false,
                    depthTest: baseElement
                });
                for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
                    const subPath = path.subPaths[ j ];
                    const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
                    if (geometry) {
                        const mesh = new Mesh(geometry, material);
                        groupImage.add(mesh);
                    }
                }
            }
        });

        groupImage.scale.set(0.005, 0.005, 0.005)
        groupImage.scale.y *= -1;
        groupImage.scale.z *= -1;
        groupImage.position.set(positionX, positionY, positionZ);
        
        // To superimpose the port components on the device components
        if(baseElement){
            groupImage.renderOrder = 0;
        }else{
            groupImage.renderOrder = 1;
        } 
        scene.add(groupImage);   
    });
}

*/

export { ImageLoad };