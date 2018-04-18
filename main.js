var threediv = document.getElementById('three');
var width = threediv.clientWidth;
var height = threediv.clientHeight;
var scene = new THREE.Scene();
var scale = 3;
var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 100 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);
var geometry = new THREE.SphereGeometry( 0.1 );
var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

var keysDown = [];
var keys = { up: 38, down: 40, right: 39, left: 37, a: 65, s: 83, d: 68, w: 87, shift: 16, r: 82, f: 70 }
addEventListener("keydown", function(e) {
    Object.keys(keys).forEach(function(key) {
        if (keys[key] == e.keyCode) {
          e.preventDefault();
          keysDown[e.keyCode] = true;
        }
    });
}, false);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);

function createCubes() {
    var min = -200;
    var max = 200;
    for (var x = min; x < max; x+=10) {
        for (var y = min; y < max; y+=10) {
            for (var z = min; z < max; z+=10) {
                
                var cube = new THREE.Mesh( geometry, material );
                cube.position.x = x + Math.random() * 10;
                cube.position.y = y + Math.random() * 10;
                cube.position.z = z + Math.random() * 10;
                scene.add( cube );
            }
        }
    }
}
createCubes();

camera.position.z = 5;

var moveSpeed = 0.0001;
var rotateSpeed = 0.05;
var xVelocity = 0;
var yVelocity = 0;
var zVelocity = 0;
var throttle = 0;
var maxVelocity = 2;
var maxThrottle = 10 * moveSpeed * 2;
var throttleChange = false; // Stop when changing forward/reverse

function update() {
    // Roll
    if (keys.right in keysDown) {
        camera.rotateZ(-rotateSpeed);
    }
    if (keys.left in keysDown) {
        camera.rotateZ(rotateSpeed);
    }
    // Pitch
    if (keys.up in keysDown) {
        camera.rotateX(-rotateSpeed);
    }
    if (keys.down in keysDown) {
        camera.rotateX(rotateSpeed);
    }
    // Yaw
    if (keys.a in keysDown) {
        camera.rotateY(rotateSpeed);
    }
    if (keys.d in keysDown) {
        camera.rotateY(-rotateSpeed);
    }

    // Throttle
    if (keys.w in keysDown) {
        if (throttle < 0 && (throttle + moveSpeed == 0 || throttle + moveSpeed > 0)) {
            throttle = 0;
            throttleChange = true;
        }
        else if (!throttleChange)
            throttle += moveSpeed;
    }
    if (keys.s in keysDown) {
        if (throttle > 0 && (throttle - moveSpeed == 0 || throttle - moveSpeed < 0)) {
            throttle = 0;
            throttleChange = true;
        }
        else if (!throttleChange)
            throttle -= moveSpeed;
    }

    var direction = camera.getWorldDirection();
    direction.normalize();
    direction.multiplyScalar(throttle);
    xVelocity += direction.x;
    yVelocity += direction.y;
    zVelocity += direction.z;

    if (throttle > maxThrottle || throttle < -maxThrottle)
        throttle = maxThrottle * Math.sign(throttle);

    if (!(keys.w in keysDown) && !(keys.s in keysDown) && throttleChange)
        throttleChange = false;
    
    camera.position.x += xVelocity;
    camera.position.y += yVelocity;
    camera.position.z += zVelocity;
}

function updateUI() {
    var speedElem = document.getElementById('speed');
    var speed = Math.abs(xVelocity) + Math.abs(yVelocity) + Math.abs(zVelocity);
    speedElem.value = Math.floor(speed * 100);
    var throttleElem = document.getElementById('throttle');
    throttleElem.value = Math.floor(throttle * 5000);
    var headingElem = document.getElementById('heading');
    var heading = (-camera.rotation.y + 3 * Math.PI / 2) * (180 / Math.PI);
    if (camera.getWorldDirection().z > 0)
        heading = (camera.rotation.y + Math.PI / 2) * (180 / Math.PI);
    headingElem.value = heading;
    $('.dial').trigger('change');
}

function animate() {
    requestAnimationFrame( animate );

    update();
    updateUI();

    renderer.render( scene, camera );
}
animate();