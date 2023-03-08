import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { DirectionalLight } from 'three';
import { createControls } from './controls.js';
import { WebXRsetup } from './WebXRsetup.js';

class World{

    camera;
    renderer;
    scene;

    controls;

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

        const webXRsetup = new WebXRsetup(this.renderer, this.scene);

        webXRsetup.setUpXR();

        this.controls = createControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        const mainLight = new DirectionalLight('white', 5);
        mainLight.position.set(10, 10, 10);
        this.scene.add(mainLight);

        this.onWindowResize(); 
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    // ------------------ end constructor -------------------------------------

    start(){
        this.renderer.setAnimationLoop(function () {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }.bind(this));
    }    

    onWindowResize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

export { World };