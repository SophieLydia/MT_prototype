import { Mesh, MeshStandardMaterial, Texture} from 'three';
import { RoundedBoxGeometry } from '/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createTextureText } from './texts.js';

function createRoundedRectangle(backgroundColor = "lightgreen"){
    // Default: width = 1, height = 1, depth = 1, 
    // segments = 2, radius = 0.1 
    const geometry = new RoundedBoxGeometry(0.2, 0.2, 0.05, 3, 0.1);
    const material = new MeshStandardMaterial({color: backgroundColor});

    const mesh = new Mesh(geometry, material);
    mesh.rotation.set(0.4, 0.3, 0.1);
    return mesh;
}

function createRoundedRectangleWithText(str, backgroundColor = 0x72BFD8){
    const canvas = createTextureText(str);
    const texture = new Texture(canvas);
    texture.needsUpdate = true;

    const geometry = new RoundedBoxGeometry(0.2, 0.2, 0.05, 3, 0.1);
    const material = new MeshStandardMaterial({ map: texture, color: backgroundColor });
    const mesh = new Mesh(geometry, material);
    mesh.rotation.set(0.4, 0.3, 0.1);
    mesh.position.set(0, 0, -1);
    return mesh;
}

export { createRoundedRectangle, createRoundedRectangleWithText };