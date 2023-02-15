var container, light;
var camera, scene, renderer, raycaster, mouse;
var objects;
var selectedObject;
var objectDescription;

var voiceGuide;
var voiceGuideVolume = 1;

var camPos = null;
var targetPos = null;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var targetObject;
var targetObjectOffsetY = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;

var destinyRotation = null;

var windowHalfX;
var windowHalfY;

var welcomeFile = "";
var welcomeText = "";

document.getElementById("info").onclick = function () {
  document.getElementById("info").style.display = "none";
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // FOR ROTATION WHEN A PICTURE IS NOT SELECTED
  if (camPos == null) {
    var _iR = unwrap([camera.rotation.y, targetRotation], Math.PI * 2);
    var _dR = _iR[1] - _iR[0];
    if (Math.abs(_dR) > 0.002) {
      _rY = camera.rotation.y + _dR * 0.06;
      camera.rotation.y = _rY;

      var cameraDegrees = ((camera.rotation.y * 180) / Math.PI).toFixed(0);
      if (
        parseFloat(cameraDegrees) > parseFloat(360) ||
        parseFloat(cameraDegrees) < parseFloat(-360)
      ) {
        camera.rotation.y = (0 * Math.PI) / 180;
      }
    }
  }

  // FOR MOVING TO A SELECTED PICTURE
  else if (camPos != null) {
    camPos.lerp(targetPos, 0.04);
    camera.position.copy(camPos);

    camera.rotation.y = lerp(camera.rotation.y, destinyRotation, 0.04);

    var checkerX1 = parseFloat(camera.position.x).toFixed(0);
    var checkerX2 = parseFloat(targetPos.x).toFixed(0);
    var checkerZ1 = parseFloat(camera.position.z).toFixed(0);
    var checkerZ2 = parseFloat(targetPos.z).toFixed(0);
    var checkerRotation1 = parseFloat(camera.rotation.y).toFixed(2);
    var checkerRotation2 = parseFloat(destinyRotation).toFixed(2);

    if (checkerX1 == "-0") {
      checkerX1 = "0";
    }
    if (checkerRotation1 == "-0.00") {
      checkerRotation1 = "0.00";
    }

    if (
      checkerX1 == checkerX2 &&
      checkerZ1 == checkerZ2 &&
      checkerRotation1 == checkerRotation2
    ) {
      camPos = null;
      targetPos = null;
      targetRotation = camera.rotation.y;

      document.getElementById("info").style.display = "block";
      document.getElementById("infotext").innerHTML =
        selectedObject.userData[1];
    }
  }

  renderer.render(scene, camera);
}

function lerp(value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
}

function onDocumentMouseMove(event) {
  if (document.getElementById("pleasewait").style.display == "none") {
    mouseX = event.clientX - windowHalfX;
    targetRotation =
      targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.0035;
  }
}

function onDocumentMouseUp(event) {
  if (document.getElementById("pleasewait").style.display == "none") {
    document.removeEventListener("mousemove", onDocumentMouseMove, false);
    document.removeEventListener("mouseup", onDocumentMouseUp, false);
    document.removeEventListener("mouseout", onDocumentMouseOut, false);
  }
}

function onDocumentMouseOut(event) {
  if (document.getElementById("pleasewait").style.display == "none") {
    document.removeEventListener("mousemove", onDocumentMouseMove, false);
    document.removeEventListener("mouseup", onDocumentMouseUp, false);
    document.removeEventListener("mouseout", onDocumentMouseOut, false);
  }
}

function onDocumentTouchStart(event) {
  if (document.getElementById("pleasewait").style.display == "none") {
    if (event.touches.length == 1) {
      event.preventDefault();
      mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
      targetRotationOnMouseDown = targetRotation;
    }
  }
}

function onDocumentTouchMove(event) {
  if (document.getElementById("pleasewait").style.display == "none") {
    if (event.touches.length == 1) {
      event.preventDefault();
      mouseX = event.touches[0].pageX - windowHalfX;
      targetRotation =
        targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.002;
    }
  }
}

function onDocumentMouseDown(event) {
  if (document.getElementById("pleasewait").style.display == "none") {
    event.preventDefault();
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mouseup", onDocumentMouseUp, false);
    document.addEventListener("mouseout", onDocumentMouseOut, false);
    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

    // CHECKING IF THE USER CLICKED IN A PICTURE
    if (camPos == null) {
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(objects);
      if (intersects.length > 0) {
        document.getElementById("info").style.display = "none";

        selectedObject = intersects[0].object;

        var cameraDegrees = ((camera.rotation.y * 180) / Math.PI).toFixed(2);
        var objectDegrees = (
          (selectedObject.rotation.y * 180) /
          Math.PI
        ).toFixed(2);

        if (parseFloat(cameraDegrees) < parseFloat(-180)) {
          cameraDegrees = parseFloat(cameraDegrees) + parseFloat(180);

          cameraDegrees = (parseFloat(cameraDegrees) + parseFloat(180)) % 360; //angulo opuesto

          camera.rotation.y = (cameraDegrees * Math.PI) / 180;
          cameraDegrees = ((camera.rotation.y * 180) / Math.PI).toFixed(2);
        }

        if (
          parseFloat(cameraDegrees) > parseFloat(180) &&
          objectDegrees != 180
        ) {
          cameraDegrees = parseFloat(cameraDegrees) - parseFloat(180);

          cameraDegrees = (parseFloat(cameraDegrees) - parseFloat(180)) % 360; //angulo opuesto

          camera.rotation.y = (cameraDegrees * Math.PI) / 180;
          cameraDegrees = ((camera.rotation.y * 180) / Math.PI).toFixed(2);
        }

        if (parseFloat(objectDegrees).toFixed(0) != parseFloat(-180)) {
          destinyRotation = selectedObject.rotation.y;
        } else {
          if (cameraDegrees < 0) {
            destinyRotation = (-180 * Math.PI) / 180;
          } else {
            destinyRotation = (180 * Math.PI) / 180;
          }
        }

        if (selectedObject.rotation.y == 0) {
          camPos = new THREE.Vector3(
            camera.position.x,
            camera.position.y,
            camera.position.z
          ); // Holds current camera position
          targetPos = new THREE.Vector3(
            selectedObject.position.x,
            camera.position.y,
            selectedObject.position.z + 50
          ); // Target position
        } else if (selectedObject.rotation.y == Math.PI / 2) {
          camPos = new THREE.Vector3(
            camera.position.x,
            camera.position.y,
            camera.position.z
          ); // Holds current camera position
          targetPos = new THREE.Vector3(
            selectedObject.position.x + 50,
            camera.position.y,
            selectedObject.position.z
          ); // Target position
        } else if (selectedObject.rotation.y == -(Math.PI / 2)) {
          camPos = new THREE.Vector3(
            camera.position.x,
            camera.position.y,
            camera.position.z
          ); // Holds current camera position
          targetPos = new THREE.Vector3(
            selectedObject.position.x - 50,
            camera.position.y,
            selectedObject.position.z
          ); // Target position
        } else if (selectedObject.rotation.y == Math.PI) {
          camPos = new THREE.Vector3(
            camera.position.x,
            camera.position.y,
            camera.position.z
          ); // Holds current camera position
          targetPos = new THREE.Vector3(
            selectedObject.position.x,
            camera.position.y,
            selectedObject.position.z - 50
          ); // Target position
        }
      }
    }
  }
}

function smod(x, m) {
  return x - Math.floor(x / m + 0.5) * m;
}

function unwrap(x, m, init) {
  var yi = init || 0;
  var y = [];
  for (var i = 0; i < x.length; ++i) {
    yi += smod(x[i] - yi, m);
    y[i] = yi;
  }
  return y;
}

function drawRoom() {
  objects = [];
  container = document.getElementById("container");
  container.innerHTML = "";

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera = new THREE.PerspectiveCamera(
    37.8,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x304040);

  light = new THREE.HemisphereLight(0xe8e8e8, 0x000000, 1);
  light.position.set(0, 0, 0);
  scene.add(light);

  group = new THREE.Group();
  scene.add(group);

  camera.position.set(0, 0, 195);
  camera.lookAt(scene.position);

  // ADDING FLOOR
  var floorTexture = new THREE.ImageUtils.loadTexture(
    "asset/texture/Texture_Floor.jpg"
  );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(40, 30);
  var floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture,
    side: THREE.DoubleSide,
  });
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 0, 0);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -40;
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  // ADDING CEIL
  var ceilTexture = new THREE.ImageUtils.loadTexture(
    "asset/texture/Texture_Ceil.jpg"
  );
  ceilTexture.wrapS = ceilTexture.wrapT = THREE.RepeatWrapping;
  ceilTexture.repeat.set(20, 20);
  var ceilMaterial = new THREE.MeshBasicMaterial({
    map: ceilTexture,
    side: THREE.DoubleSide,
  });
  var ceilGeometry = new THREE.PlaneGeometry(1050, 1000, 0, 0);
  var ceil = new THREE.Mesh(ceilGeometry, ceilMaterial);
  ceil.position.y = 47;
  ceil.rotation.x = Math.PI / 2;
  scene.add(ceil);

  // ADDING WALLS
  var wallTexture = new THREE.ImageUtils.loadTexture(
    "asset/texture/Texture_Wall.jpg"
  );
  var wallMaterial = new THREE.MeshBasicMaterial({
    map: wallTexture,
    side: THREE.DoubleSide,
  });
  var wallGeometry1 = new THREE.PlaneGeometry(600, 90, 0, 0);
  var wallGeometry2 = new THREE.PlaneGeometry(600, 90, 0, 0);
  var wallGeometry3 = new THREE.PlaneGeometry(600, 90, 0, 0);
  var wallGeometry4 = new THREE.PlaneGeometry(600, 90, 0, 0);

  var wall1 = new THREE.Mesh(wallGeometry1, wallMaterial); // FRONT
  var wall2 = new THREE.Mesh(wallGeometry2, wallMaterial); // RIGHT
  var wall3 = new THREE.Mesh(wallGeometry3, wallMaterial); // BACK
  var wall4 = new THREE.Mesh(wallGeometry4, wallMaterial); // LEFT

  wall1.position.y = 5;
  wall1.position.z = -230;
  wall1.position.x = -150;
  wall1.rotation.x = 0;

  wall2.position.y = 5;
  wall2.position.z = 0;
  wall2.position.x = -370;
  wall2.rotation.y = Math.PI / 2;

  wall3.position.y = 5;
  wall3.position.z = 270;
  wall3.position.x = -150;
  wall3.rotation.x = 0;

  wall4.position.y = 5;
  wall4.position.z = 0;
  wall4.position.x = 50;
  wall4.rotation.y = Math.PI / 2;

  scene.add(wall1);
  scene.add(wall2);
  scene.add(wall3);
  scene.add(wall4);
}

function renderRoom() {
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  requestAnimationFrame(animate);

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousedown", onDocumentMouseDown, false);
  document.addEventListener("touchstart", onDocumentTouchStart, false);
  document.addEventListener("touchmove", onDocumentTouchMove, false);
}

function welcome(a, b) {
  welcomeFile = a;
  welcomeText = b;
}

function welcomeSpeak() {
  a = welcomeFile;
  b = welcomeText;
  if (voiceGuide != undefined) {
    voiceGuide.pause();
  }
  voiceGuide = new Audio(a);
  voiceGuide.onended = function () {
    document.getElementById("info").style.display = "none";
  };
  voiceGuide.volume = voiceGuideVolume;
  voiceGuide.loop = true;
  voiceGuide.play();
  document.getElementById("info").style.display = "block";
  document.getElementById("infotext").innerHTML = b;
}

function addToLeft(a, b, c, d, e) {
  var image3DArtTexture = new THREE.ImageUtils.loadTexture(c);
  var image3DArtMaterial = new THREE.MeshBasicMaterial({
    map: image3DArtTexture,
  });
  var image3DArtGeometry = new THREE.PlaneGeometry(a, 30, 0, 0);
  var image3DArt = new THREE.Mesh(image3DArtGeometry, image3DArtMaterial);
  image3DArt.position.y = 0;
  image3DArt.position.z = b;
  image3DArt.position.x = -369;
  image3DArt.rotation.y = Math.PI / 2;
  objectDescription = [];
  objectDescription[0] = d;
  objectDescription[1] = e;
  image3DArt.userData = objectDescription;
  scene.add(image3DArt);
  objects.push(image3DArt);
}

function addToFront(a, b, c, d, e) {
  var image3DArtTexture = new THREE.ImageUtils.loadTexture(c);
  var image3DArtMaterial = new THREE.MeshBasicMaterial({
    map: image3DArtTexture,
  });
  var image3DArtGeometry = new THREE.PlaneGeometry(a, 30, 0, 0);
  var image3DArt = new THREE.Mesh(image3DArtGeometry, image3DArtMaterial);
  image3DArt.position.y = 0;
  image3DArt.position.z = -229;
  image3DArt.position.x = b;
  image3DArt.rotation.y = 0;
  objectDescription = [];
  objectDescription[0] = d;
  objectDescription[1] = e;
  image3DArt.userData = objectDescription;
  scene.add(image3DArt);
  objects.push(image3DArt);
}

function addToRight(a, b, c, d, e) {
  var image3DArtTexture = new THREE.ImageUtils.loadTexture(c);
  var image3DArtMaterial = new THREE.MeshBasicMaterial({
    map: image3DArtTexture,
  });
  var image3DArtGeometry = new THREE.PlaneGeometry(a, 30, 0, 0);
  var image3DArt = new THREE.Mesh(image3DArtGeometry, image3DArtMaterial);
  image3DArt.position.y = 0;
  image3DArt.position.z = b;
  image3DArt.position.x = 49;
  image3DArt.rotation.y = -(Math.PI / 2);
  objectDescription = [];
  objectDescription[0] = d;
  objectDescription[1] = e;
  image3DArt.userData = objectDescription;
  scene.add(image3DArt);
  objects.push(image3DArt);
}

function addToBack(a, b, c, d, e) {
  var image3DArtTexture = new THREE.ImageUtils.loadTexture(c);
  var image3DArtMaterial = new THREE.MeshBasicMaterial({
    map: image3DArtTexture,
  });
  var image3DArtGeometry = new THREE.PlaneGeometry(a, 30, 0, 0);
  var image3DArt = new THREE.Mesh(image3DArtGeometry, image3DArtMaterial);
  image3DArt.position.y = 0;
  image3DArt.position.z = 269;
  image3DArt.position.x = b;
  image3DArt.rotation.y = Math.PI;
  objectDescription = [];
  objectDescription[0] = d;
  objectDescription[1] = e;
  image3DArt.userData = objectDescription;
  scene.add(image3DArt);
  objects.push(image3DArt);
}

document.getElementById("buttonenter").onclick = function () {
  document.getElementById("pleasewait").style.display = "none";
  document.getElementById("buttonenter").style.display = "none";
  welcomeSpeak();
};

window.onload = function () {
  document.getElementById("buttonenter").style.display = "block";
};
