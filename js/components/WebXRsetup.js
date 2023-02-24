import { ARButton } from '/node_modules/three/examples/jsm/webxr/ARButton.js';

class WebXRsetup {

    renderer;
    scene;

    gl;
    xrRefSpace;
    xrSession;

    tracktableImages;

    constructor(renderer, scene){
        this.renderer = renderer;
        this.scene = scene;

        this.tracktableImages = [];
        const imageNames = ["atom.jpg", "cables.jpg", "computer.jpg",
            "device_router.jpg", "earth_grass.jpg", "egypt_eolien.jpg",
            "energy.jpg", "ethernet_connection.jpg", "human.jpg",
            "light_plant.jpg", "nuclear.jpg", "prise.jpg", "solar_cables.jpg"];
        const dir = './images/markers/';
        for(let i=0; i<imageNames.length; i++){
            let source = dir+imageNames[i];
            let image = new Image();
            image.src = source;
            image.onload = () => {
                this.addImage(image);
            }
        }
    }

    setUpXR(){
        document.body.appendChild(ARButton.createButton(this.renderer, {
            optionalFeatures: ["image-tracking"],
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
        if(frame){

            const results = frame.getImageTrackingResults();
            
            for (const result of results){
                console.log(result)
                // The result's index is the image's position in the tracktableImages 
                // array specified at session creation
                const imageIndex = result.index;
    
                // Get the pose of the image relative to a referencd space
                const pose = frame.getPose(result.imageSpace, this.xrRefSpace);
                let pos = pose.transform.position;
                let quat = pose.transform.orientation;
    
                const state = result.trackingState;
            
                // atom.jpg
                if(imageIndex == 1){
                    if(state == "tracked"){
                        console.log("PASS")
                    }
                    // children 0 and 1 are the lights
                    // child 2 is the PC
                    this.scene.children[2].position.copy(pos.toJSON());
                    this.scene.children[2].quaternion.copy(quat.toJSON());
                    HighlightImage(imageIndex, pose);
                }

            }
        }
        this.xrSession.requestAnimationFrame(this.animationFrameXR.bind(this));
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