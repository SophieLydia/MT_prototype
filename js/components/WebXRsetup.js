import { BoxGeometry, MeshStandardMaterial, Mesh } from 'three';
import { ARButton } from '/node_modules/three/examples/jsm/webxr/ARButton.js';

class WebXRsetup {

    renderer;
    scene;

    gl;
    xrRefSpace;
    xrSession;

    tracktableImages;

    cube;

    constructor(renderer, scene){
        this.renderer = renderer;
        this.scene = scene;

        this.tracktableImages = [];
        const imageNames = ["atom.jpg", "cables.jpg", "computer.jpg",
            "energy.jpg", "prise.jpg"];
        const dir = './images/markers/';
        for(let i=0; i<imageNames.length; i++){
            let source = dir+imageNames[i];
            let image = new Image();
            image.src = source;
            image.onload = () => {
                this.addImage(image);
            }
        }

        const geometry = new BoxGeometry(0.2, 0.2, 0.2);
        const material = new MeshStandardMaterial({color: "green"});
        this.cube = new Mesh(geometry, material);
        this.cube.position.set(0, 0, -4);
        this.cube.rotateX(0.1);
        this.cube.rotateY(0.2);
        this.scene.add(this.cube);
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
        //if(frame){
        if(this.xrSession){
            this.xrSession.requestAnimationFrame(this.animationFrameXR.bind(this));
            
            const session = frame.session;
            const baseLayer = session.renderState.baseLayer;

            const pose = frame.getViewerPose(this.xrRefSpace);

            if(pose){
                for( const view of pose.views){
                    const viewport = baseLayer.getViewport(view);
                    this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                    // Get the results from the tracked images
                    const results = frame.getImageTrackingResults();
            
                    for (const result of results){
                        // The result's index is the image's position in the tracktableImages 
                        // array specified at session creation
                        const imageIndex = result.index;
            
                        // Get the pose of the image relative to a referencd space
                        const pose1 = frame.getPose(result.imageSpace, this.xrRefSpace);
                        let pos = pose1.transform.position;
                        let quat = pose1.transform.orientation;
            
                        const state = result.trackingState;
                    
                        if(imageIndex == 0){
                            if(state == "tracked"){
                                console.log("PASS 0")
                            }
                            // children 0 and 1 are the lights
                            // child 2 is the PC
                            //this.cube.position.copy(pos.toJSON());
                            //this.cube.quaternion.copy(quat.toJSON());
                            //let distance = this.cube.max.distanceTo(new Vector3(this.cube.max.x, this.cube.max.y, this.cube.min.z))
                            //this.cube.translateY(- distance);
                            //HighlightImage(imageIndex, pose);
                            //this.cube.position.set(0, -0.5, -1);
                            //white energy cable
                            this.cube.material.color.setHex(0xffffff);
                        }
                        if(imageIndex == 1){
                            if(state == "tracked"){
                                console.log("PASS 1")
                            }
                            //black computer
                            this.cube.material.color.setHex(0x000000);
                        }
                        if(imageIndex == 2){
                            if(state == "tracked"){
                                console.log("PASS 2")
                            }
                            //red atom
                            this.cube.material.color.setHex(0xff0000);
                        }
                        if(imageIndex == 3){
                            if(state == "tracked"){
                                console.log("PASS 3")
                            }
                            //blue energy
                            this.cube.material.color.setHex(0x0000ff);
                        }
                        if(imageIndex == 4){
                            if(state == "tracked"){
                                console.log("PASS 4")
                            }
                            //fuchsia prise
                            this.cube.material.color.setHex(0xff00ff);
                        }
                    }
                }
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