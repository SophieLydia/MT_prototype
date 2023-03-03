import { BoxGeometry, MeshStandardMaterial, Mesh } from 'three';
import { ARButton } from '/node_modules/three/examples/jsm/webxr/ARButton.js';
import { Scenario } from './Scenario.js';

class WebXRsetup {

    renderer;
    scene;

    gl;
    xrRefSpace;
    xrSession;

    tracktableImages;

    scenario;

    cube;

    constructor(renderer, scene){
        this.renderer = renderer;
        this.scene = scene;

        this.tracktableImages = [];
        const imageNames = ["cables.jpg", "computer.jpg",
            "prise.jpg"];
        const dir = './images/markers/';
        for(let i=0; i<imageNames.length; i++){
            let source = dir+imageNames[i];
            let image = new Image();
            image.src = source;
            image.onload = () => {
                this.addImage(image);
            }
        }

        this.scenario = new Scenario(this.scene);

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
        this.xrSession.requestAnimationFrame(this.animationFrameXR.bind(this));
        if(this.xrSession){
            
            // Get the results from the tracked images
            const results = frame.getImageTrackingResults();
            
            for (const result of results){
                // The result's index is the image's position in the tracktableImages 
                // array specified at session creation
                const imageIndex = result.index;
            
                const state = result.trackingState;
                
                if(imageIndex == 0){
                    if(state == "tracked"){
                        console.log("PASS 0")
                    }
                    //white cable
                    this.cube.material.color.setHex(0xffffff);
                }
                else if(imageIndex == 1){
                    if(state == "tracked"){
                        console.log("PASS 2")
                    }
                    //red computer
                    this.cube.material.color.setHex(0xff0000);
                }
                else if(imageIndex == 2){
                    if(state == "tracked"){
                        console.log("PASS 3")
                    }
                    //blue prise
                    this.cube.material.color.setHex(0x0000ff);
                }
                /*
                if(imageIndex == 3){
                    if(state == "tracked"){
                        console.log("PASS 4")
                    }
                    //fuchsia prise
                    this.cube.material.color.setHex(0xff00ff);
                }
                */    
            }
        }
    }

    async addImage(marker) {
		let x = await createImageBitmap(marker)
		this.tracktableImages.push({
            image: x,
            // widthInMeters: specifies the expected measured width 
            // of the image in the real world
            widthInMeters: 0.1  
        });
	}
}

export { WebXRsetup };