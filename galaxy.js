// Main variables
let scene, camera, renderer, controls;
let galaxy, stars = [];
let infoPanel, toggleInfoBtn, closeInfoBtn, resetViewBtn;

// Educational content
const galaxyInfo = {
    "Milky Way": {
        content: "The Milky Way is a barred spiral galaxy with an estimated diameter of 100,000-200,000 light-years. It contains 100-400 billion stars and at least that many planets.",
        position: { x: 0, y: 0, z: 0 }
    },
    "Solar System": {
        content: "Our solar system is located in the Orion Arm, about 27,000 light-years from the galactic center. It takes about 230 million years to complete one orbit around the galaxy.",
        position: { x: -20, y: 0, z: 0 }
    },
    "Galactic Center": {
        content: "At the center of the Milky Way lies Sagittarius A*, a supermassive black hole with a mass of about 4 million suns. The central bulge contains older, redder stars.",
        position: { x: 0, y: 0, z: -10 }
    },
    "Spiral Arms": {
        content: "The Milky Way has four main spiral arms: Norma, Scutum-Centaurus, Sagittarius, and Perseus. Our solar system lies in a smaller arm called the Orion Spur.",
        position: { x: 15, y: 5, z: 0 }
    }
};

// Initialize the application
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create galaxy
    createGalaxy();
    
    // Setup UI
    setupUI();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Create the galaxy structure
function createGalaxy() {
    galaxy = new THREE.Group();
    scene.add(galaxy);
    
    // Galactic center (black hole)
    const centerGeometry = new THREE.SphereGeometry(5, 32, 32);
    const centerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.7
    });
    const galacticCenter = new THREE.Mesh(centerGeometry, centerMaterial);
    galacticCenter.userData = { name: "Galactic Center" };
    galaxy.add(galacticCenter);
    
    // Add glow effect to center
    const centerGlowGeometry = new THREE.SphereGeometry(7, 32, 32);
    const centerGlowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4a148c,
        transparent: true,
        opacity: 0.3
    });
    const centerGlow = new THREE.Mesh(centerGlowGeometry, centerGlowMaterial);
    galacticCenter.add(centerGlow);
    
    // Create spiral arms
    createSpiralArm(0, 0x1a237e, 30);  // Blue arm
    createSpiralArm(Math.PI, 0x4a148c, 30);  // Purple arm
    
    // Create stars (simplified)
    createStars(1000);
    
    // Add solar system marker
    const solarSystemMarker = createMarker(-20, 0, 0, 0xffff00, "Solar System");
    galaxy.add(solarSystemMarker);
}

// Create a spiral arm
function createSpiralArm(angleOffset, color, count) {
    const arm = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
        const radius = 10 + (i * 3);
        const angle = angleOffset + (i * 0.3);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const starSize = 0.5 + Math.random() * 1.5;
        const starGeometry = new THREE.SphereGeometry(starSize, 16, 16);
        const starMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.2
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(x, 0, z);
        star.userData = { name: "Spiral Arms" };
        arm.add(star);
    }
    
    galaxy.add(arm);
}

// Create random background stars
function createStars(count) {
    const starGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < count; i++) {
        // Random position in a sphere
        const radius = 200 + Math.random() * 800;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions.push(x, y, z);
        
        // Random color (white to blue)
        colors.push(0.8 + Math.random() * 0.2);
        colors.push(0.8 + Math.random() * 0.2);
        colors.push(1.0);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// Create a marker for important locations
function createMarker(x, y, z, color, name) {
    const markerGeometry = new THREE.SphereGeometry(1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);
    marker.userData = { name: name };
    
    // Add pulsating animation
    let scale = 1;
    function animateMarker() {
        scale = 1 + Math.sin(Date.now() * 0.002) * 0.2;
        marker.scale.set(scale, scale, scale);
        requestAnimationFrame(animateMarker);
    }
    animateMarker();
    
    return marker;
}

// Setup UI elements and event listeners
function setupUI() {
    infoPanel = document.getElementById('info-panel');
    toggleInfoBtn = document.getElementById('toggle-info');
    closeInfoBtn = document.getElementById('close-info');
    resetViewBtn = document.getElementById('reset-view');
    
    toggleInfoBtn.addEventListener('click', function() {
        infoPanel.style.display = 'block';
        updateInfoPanel("Milky Way");
    });
    
    closeInfoBtn.addEventListener('click', function() {
        infoPanel.style.display = 'none';
    });
    
    resetViewBtn.addEventListener('click', function() {
        camera.position.set(0, 50, 100);
        controls.reset();
        updateInfoPanel("Milky Way");
    });
    
    // Raycaster for object interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(galaxy.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.name) {
                updateInfoPanel(object.userData.name);
                
                // Move camera closer to the object
                const targetPosition = object.position.clone();
                targetPosition.multiplyScalar(0.5); // Move to half the distance
                targetPosition.y += 10; // Add some height
                
                gsap.to(camera.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: 1
                });
                
                infoPanel.style.display = 'block';
            }
        }
    }
    
    window.addEventListener('click', onMouseClick, false);
}

// Update information panel content
function updateInfoPanel(title) {
    if (galaxyInfo[title]) {
        document.getElementById('info-title').textContent = title;
        document.getElementById('info-content').textContent = galaxyInfo[title].content;
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate galaxy slowly
    galaxy.rotation.y += 0.001;
    
    // Required for damping in OrbitControls
    controls.update();
    
    renderer.render(scene, camera);
}

// Start the application
init();