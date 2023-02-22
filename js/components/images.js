import { MeshBasicMaterial, Mesh, ExtrudeGeometry } from "three";
import { SVGLoader } from '/node_modules/three/examples/jsm/loaders/SVGLoader.js'
import { Group, Color, DoubleSide } from "three";

function createMeshFromImage(imagePath, scene, positionX, positionY, positionZ){

    let loader = new SVGLoader();
    loader.load(imagePath, (data) => {

        // https://stackoverflow.com/questions/56023033/three-js-how-to-extrude-a-shape-defined-by-an-image-file
        //let data = loader.parse(test);
        let paths = data.paths;
        const groupImage = new Group();

        const extrusionSettings = {
            depth: 2,
            bevelEnabled: false,

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
                    depthWrite: false
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
                    depthWrite: false
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
        scene.add(groupImage);   
    });
}

export { createMeshFromImage };