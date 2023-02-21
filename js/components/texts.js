import { Mesh, MeshBasicMaterial } from 'three';
import { FontLoader, TextGeometry } from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

function create3DText(text, scene){
    const loader = new FontLoader();
    loader.load('/node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
        const geometry = new TextGeometry(text, {
            font: font,
            size: 0.3,
		    height: 0.01,
		    curveSegments: 12,
		    bevelEnabled: true,
		    bevelThickness: 0.1,
		    bevelSize: 0.01,
		    bevelOffset: 0,
		    bevelSegments: 1
        });

        const material = new MeshBasicMaterial({ color: 0x000000});
        const textMesh = new Mesh(geometry, material);
        textMesh.position.set(0, 1.5, 0);
        scene.add(textMesh);
    });

}

// https://stackoverflow.com/questions/12380072/threejs-render-text-in-canvas-as-texture-and-then-apply-to-a-plane
function createTextureText(str){
    let canvas = document.createElement('canvas');
    let size = 250;
    canvas.width = size;
    canvas.height = size;
    var context = canvas.getContext('2d');
    context.fillStyle = 'white';  
    context.textAlign = 'center';
    context.font = '34px Arial';
    context.fillRect(0, 0, size, size);
    context.fillStyle = 'black';
    context.fillText(str, size / 2, size / 2);
    return canvas;
}

  export { create3DText, createTextureText };