import { BoxGeometry, MeshStandardMaterial, Mesh } from 'three';
import { ARButton } from '/node_modules/three/examples/jsm/webxr/ARButton.js';
import { Scenario } from './Scenario.js';
import { v4 as uuidv4} from "uuid";

class WebXRsetup {

    renderer;
    scene;

    gl;
    xrRefSpace;
    xrSession;

    tracktableImages;
    
    scenario;
    step;

    arrayUUID;
    lastUUIDtracked;
    arrayComponents;
    arrayDevices;
    arrayPortNbr;
    arraySteps;

    cube;

    constructor(renderer, scene){
        this.renderer = renderer;
        this.scene = scene;

        this.tracktableImages = [];

        this.arrayUUID = [];
        this.lastUUIDtracked = 0;
        this.arrayComponents = ["PC", "cable2", "powerPort", "powerPort"];
        this.arrayDevices = ["PC", "PC", "PC", "wall"];
        this.arrayPortNbr = [0, 0, 0, 1]
        this.arraySteps = [[false, true, false, false, false], [false, false, true, false, true], [false, false, true, true, false], [false, false, true, true, false]];

        const imageNames = ["cables.jpg", "computer.jpg", "prise.jpg", "energy.jpg"];
        const dir = './images/markers/';
        for(let i=0; i<imageNames.length; i++){
            let uuid = uuidv4();
            this.arrayUUID.push(uuid);
            let source = dir+imageNames[i];
            let image = new Image();
            image.src = source;
            image.onload = () => {
                this.addImage(image, i);
            }
        }

        this.scenario = new Scenario(this.scene);
        this.step = this.scenario.currentStep;

        const geometry = new BoxGeometry(0.2, 0.2, 0.2);
        const material = new MeshStandardMaterial({color: "green"});
        this.cube = new Mesh(geometry, material);
        this.cube.position.set(0, -1, -4);
        this.cube.rotateX(0.1);
        this.cube.rotateY(0.2);
        this.scene.add(this.cube);
    }

    setUpXR(){
        // dom overlay for the next step button
        document.body.appendChild(ARButton.createButton(this.renderer, {
            optionalFeatures: ["dom-overlay", "image-tracking"],
            domOverlay: {root: document.body},
            trackedImages: this.tracktableImages
        }));
        
        this.renderer.xr.enabled = true;
    
        this.renderer.xr.addEventListener("sessionstart", this.onSessionStarted.bind(this));
        this.renderer.xr.addEventListener("sessionend", this.onSessionEnded.bind(this));
    
    }
    
    onSessionStarted(session) {
        this.xrSession = this.renderer.xr.getSession();
        this.gl = this.renderer.getContext();
    
        this.xrSession.requestReferenceSpace("local").then((refSpace) => {
            this.xrRefSpace = refSpace;
        })
        this.xrSession.requestAnimationFrame(this.animationFrameXR.bind(this));
    }
    
    onSessionEnded(event) {
        this.xrSession = null;
        this.gl = null;
    }
    
    animationFrameXR(timestamp, frame){

        if(this.xrSession){
            this.xrSession.requestAnimationFrame(this.animationFrameXR.bind(this));            
            
            // Get the results from the tracked images
            const results = frame.getImageTrackingResults();

            for (const result of results){
                // The result's index is the image's position in the tracktableImages 
                // array specified at session creation
                const imageIndex = result.index;
                const trackedImage = this.tracktableImages[imageIndex];
                const imageuuid = trackedImage.identifier;
            
                const state = result.trackingState;

                // remove marked component when changing step
                if(this.scenario.currentStep != this.step){
                    this.step = this.scenario.currentStep;
                    this.scenario.removeImageUuid(this.lastUUIDtracked, this.tracktableImages);
                }

                if(state=="tracked"){
                    // remove old image marked to later show only the new one marked
                    if(this.lastUUIDtracked != 0){
                        this.scenario.removeImageUuid(this.lastUUIDtracked, this.tracktableImages);
                    }
                    this.lastUUIDtracked = imageuuid;

                    // put new image marked
                    this.scenario.showImageMarked(trackedImage.component, trackedImage.device, trackedImage.portNbr);

                    // change cube color to see if the marker was scanned
                    if(imageuuid == this.arrayUUID[0]){
                        //white cables : PC
                        this.cube.material.color.setHex(0xffffff);
                    }
                    if(imageuuid == this.arrayUUID[1]){
                        //red computer : cable between PC and wall
                        this.cube.material.color.setHex(0xff0000);
                    }
                    if(imageuuid == this.arrayUUID[2]){
                        //blue prise : power port on PC
                        this.cube.material.color.setHex(0x0000ff);
                    }
                    if(imageuuid == this.arrayUUID[3]){
                        //fuchsia energy : power port on wall
                        this.cube.material.color.setHex(0xff00ff);
                    } 
                }  
            } 
        }
    }

    async addImage(marker, i) {
		let x = await createImageBitmap(marker)
		this.tracktableImages.push({
            image: x,
            // widthInMeters: specifies the expected measured width 
            // of the image in the real world
            widthInMeters: 0.1,
            identifier: this.arrayUUID[i],
            component: this.arrayComponents[i],
            device: this.arrayDevices[i],
            portNbr: this.arrayPortNbr[i],
            steps: this.arraySteps[i]  
        });
	}
}

export { WebXRsetup };