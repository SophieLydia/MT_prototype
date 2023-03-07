import { MeshBasicMaterial, Mesh, ExtrudeGeometry } from "three";
import { SVGLoader } from '/node_modules/three/examples/jsm/loaders/SVGLoader.js'
import { Group, Color, DoubleSide } from "three";

class ImageLoad {

    scene;

    pc;
    pc_powerPort;
    pc_LANport;

    pc_cable_router;
    pc_cable_wall;

    router;
    router_powerPort;
    router_LANport1;
    router_LANport2;
    router_WANport;

    router_cable_wall;

    wall;
    wall_powerPort1;
    wall_powerPort2;

    constructor(scene){
        this.scene = scene;
        this.loadAllMeshes();
    }

    // Load all components of scenario 1 at the right position
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
        this.wall = await this.createMesh('./images/physicalComponents/wall.svg', true);
        this.wall_powerPort1 = await this.createMesh('./images/physicalComponents/powerPort.svg', false);
        this.wall_powerPort2 = await this.createMesh('./images/physicalComponents/powerPort.svg', false);
        this.pc_cable_wall = await this.createMesh('./images/physicalComponents/cable2.svg', false);
        this.router_cable_wall = await this.createMesh('./images/physicalComponents/cable3.svg', false);

        const zPosition = -4;

        this.pc.position.set(-1.1, 0, zPosition);
        this.pc_powerPort.position.set(-1.05, -0.1, zPosition);
        this.pc_LANport.position.set(-0.85, -0.09, zPosition);

        this.pc_cable_router.position.set(-0.785, 0.23, zPosition);
        this.pc_cable_wall.position.set(-1.01, 0.33, zPosition);

        this.router.position.set(-0.15, 0.125, zPosition);
        this.router_powerPort.position.set(-0.11, -0.135, zPosition);
        this.router_LANport1.position.set(0.1, -0.125, zPosition);
        this.router_LANport2.position.set(0.35, -0.125, zPosition);
        this.router_WANport.position.set(0.6, -0.125, zPosition);

        this.router_cable_wall.position.set(-0.07, -0.235, zPosition);

        this.wall.position.set(1.2, -0.05, zPosition);
        this.wall_powerPort1.position.set(1.4, -0.135, zPosition);
        this.wall_powerPort2.position.set(1.69, -0.135, zPosition);

        this.scene.add(this.wall, this.wall_powerPort1, this.wall_powerPort2);
        this.scene.add(this.pc, this.pc_powerPort, this.pc_LANport);
        this.scene.add(this.pc_cable_router, this.pc_cable_wall, this.router_cable_wall);
        this.scene.add(this.router, this.router_powerPort, this.router_LANport1, this.router_LANport2, this.router_WANport);
    };
    
    // Create mesh from an image with same geometry and aspect
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
                    
                // To superimpose the port and cable components on the device components
                if(baseElement){
                    groupImage.renderOrder = 0;
                }else{
                    groupImage.renderOrder = 1;
                } 
                return resolve(groupImage);
            });
        });
    } 

    // When a component changes of color, it is in fact replaced
    async replaceMesh(imagePath, device, portNbr){
        const name = imagePath.substring(28, imagePath.length-4);
        if(device == "wall"){
            if(name == "wall" || name == "wall_currentStep" ||
            name == "wall_rightMarker" || name == "wall_wrongMarker"){
                const pos = this.wall.position;
                const new_wall = await this.createMesh(imagePath, true);
                this.scene.remove(this.wall);
                this.wall = new_wall;
                this.wall.position.copy(pos);
                this.scene.add(this.wall);
            }
            else if(name == "powerPort" || name == "powerPort_currentStep" ||
                name == "powerPort_rightMarker" || name == "powerPort_wrongMarker"){
                    if(portNbr == 1){
                        const pos = this.wall_powerPort1.position;
                        const new_wall_powerPort1 = await this.createMesh(imagePath, false);
                        this.scene.remove(this.wall_powerPort1);
                        this.wall_powerPort1 = new_wall_powerPort1;
                        this.wall_powerPort1.position.copy(pos);
                        this.scene.add(this.wall_powerPort1);
                    }
                    else if(portNbr == 2){
                        const pos = this.wall_powerPort2.position;
                        const new_wall_powerPort2 = await this.createMesh(imagePath, false);
                        this.scene.remove(this.wall_powerPort2);
                        this.wall_powerPort2 = new_wall_powerPort2;
                        this.wall_powerPort2.position.copy(pos);
                        this.scene.add(this.wall_powerPort2);
                    }
            }
        }
        else if(device == "PC"){
            if(name == "PC" || name == "PC_currentStep" ||
            name == "PC_rightMarker" || name == "PC_wrongMarker"){
                const pos = this.pc.position;
                const new_pc = await this.createMesh(imagePath, true);
                this.scene.remove(this.pc);
                this.pc = new_pc;
                this.pc.position.copy(pos);
                this.scene.add(this.pc);
            }
            else if(name == "powerPort" || name == "powerPort_currentStep" ||
                name == "powerPort_rightMarker" || name == "powerPort_wrongMarker"){
                    const pos = this.pc_powerPort.position;
                    const new_pc_powerPort = await this.createMesh(imagePath, false);
                    this.scene.remove(this.pc_powerPort);
                    this.pc_powerPort = new_pc_powerPort;
                    this.pc_powerPort.position.copy(pos);
                    this.scene.add(this.pc_powerPort);
            }
            else if(name == "LANport" || name == "LANport_currentStep" ||
                name == "LANport_rightMarker" || name == "LANport_wrongMarker"){
                    const pos = this.pc_LANport.position;
                    const new_pc_LANport = await this.createMesh(imagePath, false);
                    this.scene.remove(this.pc_LANport);
                    this.pc_LANport = new_pc_LANport;
                    this.pc_LANport.position.copy(pos);
                    this.scene.add(this.pc_LANport);
            }
            else if(name == "cable" || name == "cable_currentStep" ||
                name == "cable_rightMarker" || name == "cable_wrongMarker"){
                    const pos = this.pc_cable_router.position;
                    const new_pc_cable_router = await this.createMesh(imagePath, false);
                    this.scene.remove(this.pc_cable_router);
                    this.pc_cable_router = new_pc_cable_router;
                    this.pc_cable_router.position.copy(pos);
                    this.scene.add(this.pc_cable_router);
            }
            else if(name == "cable2" || name == "cable2_currentStep" ||
                name == "cable2_rightMarker" || name == "cable2_wrongMarker"){
                    const pos = this.pc_cable_wall.position;
                    const new_pc_cable_wall = await this.createMesh(imagePath, false);
                    this.scene.remove(this.pc_cable_wall);
                    this.pc_cable_wall = new_pc_cable_wall;
                    this.pc_cable_wall.position.copy(pos);
                    this.scene.add(this.pc_cable_wall);
            }
        }
        else if(device == "router"){
            if(name == "router" || name == "router_currentStep" ||
                name == "router_rightMarker" || name == "router_wrongMarker"){
                    const pos = this.router.position;
                    const new_router = await this.createMesh(imagePath, true);
                    this.scene.remove(this.router);
                    this.router = new_router;
                    this.router.position.copy(pos);
                    this.scene.add(this.router);
            }
            else if(name == "powerPort" || name == "powerPort_currentStep" ||
                name == "powerPort_rightMarker" || name == "powerPort_wrongMarker"){
                    const pos = this.router_powerPort.position;
                    const new_router_powerPort = await this.createMesh(imagePath, false);
                    this.scene.remove(this.router_powerPort);
                    this.router_powerPort = new_router_powerPort;
                    this.router_powerPort.position.copy(pos);
                    this.scene.add(this.router_powerPort);
            }
            else if(name == "LANport" || name == "LANport_currentStep" ||
                name == "LANport_rightMarker" || name == "LANport_wrongMarker"){
                    if(portNbr == 1){
                        const pos = this.router_LANport1.position;
                        const new_router_LANport1 = await this.createMesh(imagePath, false);
                        this.scene.remove(this.router_LANport1);
                        this.router_LANport1 = new_router_LANport1;
                        this.router_LANport1.position.copy(pos);
                        this.scene.add(this.router_LANport1);
                    }else if(portNbr == 2){
                        const pos = this.router_LANport2.position;
                        const new_router_LANport2 = await this.createMesh(imagePath, false);
                        this.scene.remove(this.router_LANport2);
                        this.router_LANport2 = new_router_LANport2;
                        this.router_LANport2.position.copy(pos);
                        this.scene.add(this.router_LANport2);
                    }
            }
            else if(name == "WANport" || name == "WANport_currentStep" ||
                name == "WANport_rightMarker" || name == "WANport_wrongMarker"){
                    const pos = this.router_WANport.position;
                    const new_router_WANport = await this.createMesh(imagePath, false);
                    this.scene.remove(this.router_WANport);
                    this.router_WANport = new_router_WANport;
                    this.router_WANport.position.copy(pos);
                    this.scene.add(this.router_WANport);
            }
            else if(name == "cable3" || name == "cable3_currentStep" ||
                name == "cable3_rightMarker" || name == "cable3_wrongMarker"){
                    const pos = this.router_cable_wall.position;
                    const new_router_cable_wall = await this.createMesh(imagePath, false);
                    this.scene.remove(this.router_cable_wall);
                    this.router_cable_wall = new_router_cable_wall;
                    this.router_cable_wall.position.copy(pos);
                    this.scene.add(this.router_cable_wall);
            }
        }
    }
}

export { ImageLoad };