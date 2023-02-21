import { Scene, PerspectiveCamera, WebGLRenderer, MeshBasicMaterial, MeshStandardMaterial, BoxGeometry } from 'three';
import { HemisphereLight, DirectionalLight } from 'three';
import { ARButton } from '/node_modules/three/examples/jsm/webxr/ARButton.js';
import { createRoundedRectangleWithText } from './roundedRectangle.js';
import { createControls } from './controls.js';
import { createMeshFromImage } from './images.js';
import { Mesh, TextureLoader } from 'three';

class World{

    camera;
    renderer;
    scene;

    gl;
    xrRefSpace;
    xrSession;

    constructor(container){
        this.camera = new PerspectiveCamera(
            35, // Field Of View
            1, // Aspect ration (dummy value)
            0.1, // Near clippling plane
            100, // Far clipping plane
        );
        this.camera.position.set(0, 0, 1);
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.physicallyCorrectLights = true;

        container.append(this.renderer.domElement);

        this.setUpXR();

        const controls = createControls(this.camera, this.renderer.domElement);

        const ambientLight = new HemisphereLight(
            'white', // bright sky color
            'darkslategrey', // dim ground color
            5, // intensity
        ); 
        const mainLight = new DirectionalLight('white', 5);
        mainLight.position.set(10, 10, 10);
        this.scene.add(ambientLight, mainLight);

        const roundedRectangle = createRoundedRectangleWithText("Hello");
        roundedRectangle.position.set(0, 0, -2);
        //this.scene.add(roundedRectangle);

        const testPC = createMeshFromImage('./images/physicalComponents/PC.svg');
        this.scene.add(testPC);
       
        this.renderer.setAnimationLoop(function () {
            this.renderer.render(this.scene, this.camera);
        }.bind(this));

        this.onWindowResize(); 
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    // ------------------ end constructor -------------------------------------

    onWindowResize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    setUpXR(){
        document.body.appendChild(ARButton.createButton(this.renderer));
        
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
		//this.xrSession.requestAnimationFrame(this.onXRFrame.bind(this));
	}

	onSessionEnded(event) {
		this.xrSession = null;
		this.gl = null;
	}

  
}

export { World }