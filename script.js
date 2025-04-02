const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Add stars background
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.1,
});

const starsVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light (sun)
const sunLight = new THREE.PointLight(0xFFFFFF, 1.5);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Create sun and planets
const celestialBodies = {};
const planetData = {
    sun: {
        radius: 6,
        position: [0, 0, 0],
        color: 0xFFCC33,
        orbitRadius: 0,
        orbitSpeed: 0,
        rotationSpeed: 0.001,
        texture: createSunTexture(),
        info: "The Sun is the star at the center of our Solar System. It's a nearly perfect sphere of hot plasma with a diameter of about 1.39 million kilometers. The Sun radiates energy mainly as light, ultraviolet, and infrared radiation, and is by far the most important source of energy for life on Earth."
    },
    mercury: {
        radius: 0.4,
        position: [10, 0, 0],
        color: 0x8A8A8A,
        orbitRadius: 10,
        orbitSpeed: 0.04,
        rotationSpeed: 0.004,
        info: "Mercury is the smallest and innermost planet in the Solar System. It is named after the Roman deity Mercury, the messenger of the gods. Mercury has no natural satellites and no substantial atmosphere. It has a large iron core which generates a magnetic field about 1% as strong as Earth's."
    },
    venus: {
        radius: 0.9,
        position: [14, 0, 0],
        color: 0xE6E6BA,
        orbitRadius: 14,
        orbitSpeed: 0.015,
        rotationSpeed: 0.002,
        info: "Venus is the second planet from the Sun. It's named after the Roman goddess of love and beauty. As the brightest natural object in Earth's night sky after the Moon, Venus can cast shadows and can be visible to the naked eye in broad daylight. Venus has a thick, toxic atmosphere filled with carbon dioxide and clouds of sulfuric acid."
    },
    earth: {
        radius: 1,
        position: [19, 0, 0],
        color: 0x3333FF,
        orbitRadius: 19,
        orbitSpeed: 0.01,
        rotationSpeed: 0.005,
        info: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. According to radiometric dating and other evidence, Earth formed over 4.5 billion years ago. Earth's atmosphere consists mostly of nitrogen and oxygen. Earth orbits the Sun at a distance of about 150 million kilometers."
    },
    mars: {
        radius: 0.5,
        position: [24, 0, 0],
        color: 0xE27B58,
        orbitRadius: 24,
        orbitSpeed: 0.008,
        rotationSpeed: 0.005,
        info: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. It's often called the 'Red Planet' because of its reddish appearance, which is caused by iron oxide (rust) on its surface. Mars has two small moons, Phobos and Deimos, which may be captured asteroids."
    },
    jupiter: {
        radius: 2.5,
        position: [40, 0, 0],
        color: 0xF0C896,
        orbitRadius: 40,
        orbitSpeed: 0.002,
        rotationSpeed: 0.01,
        info: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It's a gas giant with a mass more than two and a half times that of all the other planets in the Solar System combined. Jupiter is primarily composed of hydrogen and helium and lacks a definite surface. The planet has a powerful magnetic field and at least 79 moons."
    },
    saturn: {
        radius: 2.2,
        position: [56, 0, 0],
        color: 0xF0E6AA,
        orbitRadius: 56,
        orbitSpeed: 0.0009,
        rotationSpeed: 0.008,
        ringRadius: 3.5,
        ringWidth: 0.7,
        info: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth. Saturn is named after the Roman god of wealth and agriculture. Saturn's most notable feature is its prominent ring system, which is composed mainly of ice particles, rocky debris, and dust."
    },
    uranus: {
        radius: 1.8,
        position: [75, 0, 0],
        color: 0xD1E7E7,
        orbitRadius: 75,
        orbitSpeed: 0.0004,
        rotationSpeed: 0.006,
        tilt: Math.PI/2,
        info: "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. It is named after the ancient Greek deity of the sky Uranus. Uranus has a ring system, a magnetosphere, and 27 known moons. The Uranian system has a unique configuration because its axis of rotation is tilted sideways, nearly into the plane of its solar orbit."
    },
    neptune: {
        radius: 1.7,
        position: [85, 0, 0],
        color: 0x3D85C6,
        orbitRadius: 85,
        orbitSpeed: 0.0001,
        rotationSpeed: 0.005,
        info: "Neptune is the eighth and farthest-known planet from the Sun in the Solar System. It is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet. It is 17 times the mass of Earth and is slightly more massive than its near-twin Uranus. Neptune is named after the Roman god of the sea. It has 14 known moons, the largest of which is Triton."
    }
};

// Function to create sun texture
function createSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create gradient
    const gradient = context.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#FFFF00');
    gradient.addColorStop(0.5, '#FFCC00');
    gradient.addColorStop(1, '#FF8800');
    
    // Draw circle
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Create planets and their orbits
const planetGroup = new THREE.Group();
scene.add(planetGroup);

// Create orbital paths (rings)
function createOrbitLine(radius) {
    const segments = 100;
    const orbitGeometry = new THREE.BufferGeometry();
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
            radius * Math.cos(theta),
            0,
            radius * Math.sin(theta)
        );
    }
    
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    return orbit;
}

for (const [name, data] of Object.entries(planetData)) {
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    
    let material;
    if (data.texture) {
        material = new THREE.MeshPhongMaterial({ 
            map: data.texture,
            emissive: 0xFFCC33,
            emissiveIntensity: 0.5
        });
    } else {
        material = new THREE.MeshLambertMaterial({ color: data.color });
    }
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...data.position);
    mesh.userData = { 
        name: name,
        orbitRadius: data.orbitRadius,
        orbitSpeed: data.orbitSpeed,
        rotationSpeed: data.rotationSpeed,
        info: data.info
    };
    
    // Add planets to scene
    if (name === 'sun') {
        scene.add(mesh);
    } else {
        planetGroup.add(mesh);
        
        // Create orbit line
        const orbitLine = createOrbitLine(data.orbitRadius);
        scene.add(orbitLine);
    }
    
    // Add Saturn's rings if applicable
    if (name === 'saturn') {
        const ringGeometry = new THREE.RingGeometry(data.ringRadius, data.ringRadius + data.ringWidth, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xF0E6AA, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }
    
    // Add tilt if applicable
    if (data.tilt) {
        mesh.rotation.z = data.tilt;
    }
    
    // Store reference to mesh
    celestialBodies[name] = mesh;
    
    // Create text label for planet
    const labelDiv = document.createElement('div');
    labelDiv.className = 'planet-label';
    labelDiv.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    labelDiv.style.position = 'absolute';
    labelDiv.style.display = 'block';
    document.body.appendChild(labelDiv);
    
    // Store label reference
    mesh.userData.label = labelDiv;
}

// Camera controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let orbitActive = true;
let labelsVisible = true;
let selectedObject = null;

// Set initial camera position
camera.position.set(0, 30, 80);
camera.lookAt(0, 0, 0);

// Handle mouse events
renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        isDragging = true;
        checkPlanetClick(e);
    }
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        // Rotate camera around center
        const theta = deltaMove.x * 0.005;
        const phi = deltaMove.y * 0.005;

        const cameraPosition = new THREE.Vector3();
        camera.getWorldPosition(cameraPosition);
        
        // Rotate horizontally
        cameraPosition.x = cameraPosition.x * Math.cos(theta) + cameraPosition.z * Math.sin(theta);
        cameraPosition.z = cameraPosition.z * Math.cos(theta) - cameraPosition.x * Math.sin(theta);
        
        // Rotate vertically
        const radius = cameraPosition.length();
        const centerToCamera = cameraPosition.clone().normalize();
        const upVector = new THREE.Vector3(0, 1, 0);
        const rightVector = new THREE.Vector3().crossVectors(centerToCamera, upVector).normalize();
        
        // Rotate camera up/down
        const rotationAxis = rightVector;
        const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, phi);
        cameraPosition.applyMatrix4(rotationMatrix);
        
        // Apply new position
        camera.position.copy(cameraPosition);
        camera.lookAt(0, 0, 0);

        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
});

renderer.domElement.addEventListener('mouseup', () => {
    isDragging = false;
});

renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // Calculate zoom direction
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    // Get current camera position
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);
    
    // Calculate new position
    cameraPosition.multiplyScalar(zoomFactor);
    
    // Apply new position
    camera.position.copy(cameraPosition);
    camera.lookAt(0, 0, 0);
});

// Check for planet clicks using raycasting
function checkPlanetClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Get all objects to check for intersection
    const objects = [celestialBodies.sun, ...planetGroup.children];
    const intersects = raycaster.intersectObjects(objects);
    
    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object;
        displayPlanetInfo(selectedPlanet);
        
        // Highlight selected planet
        if (selectedObject) {
            selectedObject.material.emissive = new THREE.Color(0x000000);
        }
        
        // Set new selection
        selectedObject = selectedPlanet;
        if (selectedPlanet !== celestialBodies.sun) {
            selectedPlanet.material.emissive = new THREE.Color(0x333333);
        }
        
        // Animate camera to focus on planet
        const planetPosition = new THREE.Vector3();
        selectedPlanet.getWorldPosition(planetPosition);
        
        const distanceFactor = selectedPlanet.userData.name === 'sun' ? 10 : 5;
        const newPosition = planetPosition.clone().normalize().multiplyScalar(
            planetPosition.length() + selectedPlanet.geometry.parameters.radius * distanceFactor
        );
        
        gsap.to(camera.position, {
            x: newPosition.x,
            y: newPosition.y,
            z: newPosition.z,
            duration: 1,
            onUpdate: function() {
                camera.lookAt(planetPosition);
            }
        });
    }
}

// Display planet information
function displayPlanetInfo(planet) {
    const infoPanel = document.getElementById('info-panel');
    const planetName = planet.userData.name.charAt(0).toUpperCase() + planet.userData.name.slice(1);
    
    infoPanel.innerHTML = `
        <h3>${planetName}</h3>
        <p>${planet.userData.info}</p>
    `;
}

// Control buttons
document.getElementById('toggle-orbit').addEventListener('click', function() {
    orbitActive = !orbitActive;
    this.textContent = orbitActive ? 'Pause Orbits' : 'Resume Orbits';
});

document.getElementById('toggle-labels').addEventListener('click', function() {
    labelsVisible = !labelsVisible;
    this.textContent = labelsVisible ? 'Hide Labels' : 'Show Labels';
    
    // Toggle visibility of all labels
    for (const [name, obj] of Object.entries(celestialBodies)) {
        if (obj.userData.label) {
            obj.userData.label.style.display = labelsVisible ? 'block' : 'none';
        }
    }
});

document.getElementById('reset-view').addEventListener('click', function() {
    // Reset camera position
    gsap.to(camera.position, {
        x: 0,
        y: 30,
        z: 80,
        duration: 1,
        onUpdate: function() {
            camera.lookAt(0, 0, 0);
        }
    });
    
    // Reset selection
    if (selectedObject) {
        selectedObject.material.emissive = new THREE.Color(0x000000);
        selectedObject = null;
    }
    
    // Reset info panel
    document.getElementById('info-panel').innerHTML = `
        <h3>Solar System Simulator</h3>
        <p>Click on a planet to view information about it.</p>
        <p>Zoom: Mouse wheel</p>
        <p>Rotate: Click and drag</p>
        <p>Pan: Right-click and drag</p>
    `;
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update planets
    for (const [name, obj] of Object.entries(celestialBodies)) {
        // Rotate planets
        obj.rotation.y += obj.userData.rotationSpeed;
        
        // Orbit planets (except sun)
        if (name !== 'sun' && orbitActive) {
            const time = Date.now() * 0.001;
            const orbitRadius = obj.userData.orbitRadius;
            const orbitSpeed = obj.userData.orbitSpeed;
            
            obj.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
            obj.position.z = Math.sin(time * orbitSpeed) * orbitRadius;
        }
        
        // Update labels
        if (obj.userData.label) {
            // Get screen position
            const position = new THREE.Vector3();
            obj.getWorldPosition(position);
            position.project(camera);
            
            // Convert to screen coordinates
            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = (position.y * -0.5 + 0.5) * window.innerHeight;
            
            // Update label position
            obj.userData.label.style.left = `${x}px`;
            obj.userData.label.style.top = `${y - 20}px`;
        }
    }
    
    renderer.render(scene, camera);
}

animate();