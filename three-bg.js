document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scenario = canvas.getAttribute('data-scenario') || 'index';

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1B1F2A, 0.025);

  const camera = new THREE.PerspectiveCamera(50, canvas.parentElement.clientWidth / canvas.parentElement.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 25);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- Materials ---
  const neonLineMat = new THREE.LineBasicMaterial({ color: 0xC6FF3E, transparent: true, opacity: 0.8 });
  const altLineMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 }); // White
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xC6FF3E, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }); // Neon Laser

  function createBlueprintNode(geometry, mat = neonLineMat) {
    const edges = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(edges, mat);
  }

  function createRoundedBox(width, height, depth, radius) {
    const shape = new THREE.Shape();
    const x = -width/2, y = -height/2;
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);
    return new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 });
  }

  function createDeviceScreen(width, height, resX, resY) {
    const cvs = document.createElement('canvas');
    cvs.width = resX; cvs.height = resY;
    const ctx = cvs.getContext('2d');
    const tex = new THREE.CanvasTexture(cvs);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    return { cvs, ctx, tex, mesh };
  }

  // --- 1. The Main POS Terminal ---
  const posGroup = new THREE.Group();
  const base = createBlueprintNode(new THREE.BoxGeometry(9, 0.5, 7.5));
  base.position.set(0, -4.5, 1.5);
  posGroup.add(base);

  const strut = createBlueprintNode(new THREE.BoxGeometry(3, 5.8, 1.2));
  strut.position.set(0, -2, -0.5);
  strut.rotation.x = 0.35;
  posGroup.add(strut);

  const mount = createBlueprintNode(new THREE.BoxGeometry(4, 3.5, 0.5));
  mount.position.set(0, 0.8, 1.0);
  mount.rotation.x = -0.15; 
  posGroup.add(mount);

  const screenBody = createBlueprintNode(createRoundedBox(13, 8.5, 0.6, 0.6));
  screenBody.position.set(0, 1, 1.5);
  screenBody.rotation.x = -0.15;
  posGroup.add(screenBody);

  const mainScreen = createDeviceScreen(12.2, 7.8, 1024, 680);
  mainScreen.mesh.position.set(0, 0, 0.35);
  screenBody.add(mainScreen.mesh);

  posGroup.position.set(12, -2, -8);
  posGroup.rotation.y = -0.2;
  scene.add(posGroup);
  
  const posWorld = new THREE.Vector3(12, 0, -8);

  // --- Dynamic Receipt Setup ---
  const paperCanvas = document.createElement('canvas');
  paperCanvas.width = 300; paperCanvas.height = 600;
  const pCtx = paperCanvas.getContext('2d');
  const paperTexture = new THREE.CanvasTexture(paperCanvas);
  
  function createReceiptMesh(width, height) {
      const tex = paperTexture.clone();
      tex.needsUpdate = true;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
      mesh.geometry.translate(0, -height/2, 0);
      return mesh;
  }

  let printerObj; 

  function drawReceiptBase() {
    pCtx.clearRect(0, 0, 300, 600);
    pCtx.strokeStyle = '#C6FF3E'; pCtx.lineWidth = 4; pCtx.strokeRect(2, 2, 296, 596);
    pCtx.fillStyle = '#C6FF3E'; pCtx.font = 'bold 24px monospace'; pCtx.textAlign = 'center';
    pCtx.fillText('TILLEASE', 150, 40); pCtx.font = '16px monospace';
    pCtx.fillText(scenario === 'laundry' ? 'TAG #88' : (scenario === 'restaurant' ? 'KOT #12' : 'SYNC OK'), 150, 70);
    pCtx.fillRect(20, 100, 260, 2); pCtx.textAlign = 'left';
    for(let i=0; i<8; i++) {
      pCtx.fillRect(20, 130 + i*30, 180 + Math.random()*40, 4);
      pCtx.fillRect(250, 130 + i*30, 30, 4);
    }
    paperTexture.needsUpdate = true;
  }
  drawReceiptBase();

  // --- 2. Scenario Specific Hardware ---
  let scannerLaser;
  let waiterTablet, tabScreen;
  let kdsScreen, kdsDisplay;
  let customerPhone, phScreen, washerDoor;
  let localPacket2;
  let grocery1, grocery2, conveyorBelt;
  let ownerLaptop, laptopScreen;
  let posReceipt;

  // Custom Printer Generator (Detailed Thermal Printer)
  function createDetailedPrinter() {
    const group = new THREE.Group();
    const pBase = createBlueprintNode(createRoundedBox(4, 3, 5, 0.3), altLineMat);
    pBase.position.y = -1.5;
    group.add(pBase);

    const pTop = createBlueprintNode(new THREE.CylinderGeometry(2, 2, 4, 16, 1, false, 0, Math.PI), altLineMat);
    pTop.rotation.z = Math.PI/2;
    pTop.position.set(0, 0, -0.5);
    group.add(pTop);
    
    const btn = createBlueprintNode(new THREE.BoxGeometry(0.5, 0.2, 0.5), neonLineMat);
    btn.position.set(1.2, 0.1, 2);
    group.add(btn);
    
    return group;
  }

  if (scenario === 'retail') {
    // Conveyor Belt Assembly
    conveyorBelt = new THREE.Group();
    conveyorBelt.position.set(-2, -4, -4); 
    scene.add(conveyorBelt);
    
    const beltBody = createBlueprintNode(new THREE.BoxGeometry(16, 1, 6), altLineMat);
    conveyorBelt.add(beltBody);

    // Groceries
    grocery1 = createBlueprintNode(new THREE.BoxGeometry(2, 3, 2), altLineMat);
    conveyorBelt.add(grocery1);
    
    grocery2 = createBlueprintNode(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 16), altLineMat);
    conveyorBelt.add(grocery2);

    // Detailed Barcode Scanner on Stand
    const scannerGroup = new THREE.Group();
    const sHead = createBlueprintNode(new THREE.BoxGeometry(2, 2, 3), neonLineMat);
    scannerGroup.add(sHead);
    const sStand = createBlueprintNode(new THREE.CylinderGeometry(0.2, 0.2, 4, 8), altLineMat);
    sStand.position.set(0, -2.5, -1);
    scannerGroup.add(sStand);
    
    scannerGroup.position.set(2, 4, 0); // Positioned over belt
    scannerGroup.rotation.x = 0.5; // Looking down at items
    conveyorBelt.add(scannerGroup);
    
    scannerLaser = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 8), laserMat);
    scannerLaser.position.set(0, -1, 3);
    scannerLaser.rotation.x = 1.5;
    scannerGroup.add(scannerLaser);
    
    // POS Receipt
    printerObj = createReceiptMesh(3, 6);
    printerObj.position.set(0, -1, 2.5);
    printerObj.rotation.x = -0.8;
    screenBody.add(printerObj);

  } else if (scenario === 'restaurant') {
    // Waiter Tablet with UI
    waiterTablet = createBlueprintNode(createRoundedBox(4, 6, 0.2, 0.2), neonLineMat);
    tabScreen = createDeviceScreen(3.6, 5.6, 400, 600);
    tabScreen.mesh.position.z = 0.11;
    waiterTablet.add(tabScreen.mesh);
    waiterTablet.position.set(-8, -2, 4); 
    scene.add(waiterTablet);

    // KDS Screen & KOT Printer
    const kitchenGroup = new THREE.Group();
    kdsScreen = createBlueprintNode(createRoundedBox(10, 6, 0.4, 0.2), altLineMat);
    kdsDisplay = createDeviceScreen(9.6, 5.6, 1000, 600);
    kdsDisplay.mesh.position.z = 0.21;
    kdsScreen.add(kdsDisplay.mesh);
    
    const kMount = createBlueprintNode(new THREE.CylinderGeometry(0.3, 0.3, 4, 8), altLineMat);
    kMount.rotation.x = Math.PI/2;
    kMount.position.z = -2;
    kdsScreen.add(kMount);
    kdsScreen.position.set(0, 5, 0);
    kitchenGroup.add(kdsScreen);

    const kotPrinter = createDetailedPrinter();
    kotPrinter.position.set(-3, -2, 0);
    kitchenGroup.add(kotPrinter);

    printerObj = createReceiptMesh(3, 5);
    printerObj.position.set(-3, -0.5, 1.5);
    printerObj.rotation.x = -0.5;
    kitchenGroup.add(printerObj);

    kitchenGroup.position.set(26, 2, -12);
    kitchenGroup.rotation.y = -0.5;
    scene.add(kitchenGroup);
    
    posReceipt = createReceiptMesh(3, 6); 
    posReceipt.position.set(0, -1, 2.5);
    posReceipt.rotation.x = -0.8;
    screenBody.add(posReceipt);

  } else if (scenario === 'laundry') {
    const tagPrinter = createDetailedPrinter();
    tagPrinter.position.set(-6, -3, 1);
    posGroup.add(tagPrinter);

    printerObj = createReceiptMesh(2, 6);
    printerObj.position.set(-6, -2, 1.5);
    printerObj.rotation.x = -1.0;
    posGroup.add(printerObj);

    // Customer Phone with UI
    customerPhone = createBlueprintNode(createRoundedBox(3, 6, 0.2, 0.3), neonLineMat);
    phScreen = createDeviceScreen(2.8, 5.8, 300, 600);
    phScreen.mesh.position.z = 0.11;
    customerPhone.add(phScreen.mesh);
    
    customerPhone.position.set(-8, 2, 4); 
    customerPhone.rotation.y = 0.5;
    scene.add(customerPhone);
    
    // POS Receipt
    posReceipt = createReceiptMesh(3, 6); 
    posReceipt.position.set(0, -1, 2.5);
    posReceipt.rotation.x = -0.8;
    screenBody.add(posReceipt);

    // Washing Machine (Industrial Design)
    const laundryGroup = new THREE.Group();
    
    const washerBase = createBlueprintNode(new THREE.BoxGeometry(4.5, 5.5, 4.5), altLineMat);
    washerBase.position.set(0, -0.25, 0);
    laundryGroup.add(washerBase);

    const wPanel = createBlueprintNode(new THREE.BoxGeometry(4.5, 1.2, 1.5), altLineMat);
    wPanel.position.set(0, 3.1, 1.5);
    laundryGroup.add(wPanel);
    
    for(let i=0; i<3; i++) {
        const btn = createBlueprintNode(new THREE.BoxGeometry(0.4, 0.4, 0.4), neonLineMat);
        btn.position.set(-1.5 + i*1.0, 3.1, 2.2);
        laundryGroup.add(btn);
    }

    const doorFrame = createBlueprintNode(new THREE.CylinderGeometry(1.6, 1.6, 0.2, 32), altLineMat);
    doorFrame.rotation.x = Math.PI/2;
    doorFrame.position.set(0, -0.5, 2.3);
    laundryGroup.add(doorFrame);

    washerDoor = new THREE.Group();
    washerDoor.position.set(0, -0.5, 2.1);
    
    const tumbleGeo1 = createBlueprintNode(new THREE.IcosahedronGeometry(1.2, 0), neonLineMat);
    const tumbleGeo2 = createBlueprintNode(new THREE.IcosahedronGeometry(0.9, 0), altLineMat);
    tumbleGeo2.rotation.x = 1.0;
    
    washerDoor.add(tumbleGeo1);
    washerDoor.add(tumbleGeo2);
    laundryGroup.add(washerDoor);

    laundryGroup.position.set(24, -2, -6); 
    scene.add(laundryGroup);

  } else if (scenario === 'salon') {
    printerObj = createReceiptMesh(3, 6);
    printerObj.position.set(0, -1, 2.5);
    printerObj.rotation.x = -0.8;
    screenBody.add(printerObj);

  } else {
    // Index (Homepage)
    printerObj = createReceiptMesh(3, 6);
    printerObj.position.set(0, -1, 2.5);
    printerObj.rotation.x = -0.8;
    screenBody.add(printerObj);

    ownerLaptop = new THREE.Group();
    const lBase = createBlueprintNode(new THREE.BoxGeometry(8, 0.4, 6), altLineMat);
    const lScreenFrame = createBlueprintNode(new THREE.BoxGeometry(8, 5, 0.3), altLineMat);
    lScreenFrame.position.set(0, 2.5, -3);
    lScreenFrame.rotation.x = -0.2;
    ownerLaptop.add(lBase);
    ownerLaptop.add(lScreenFrame);

    laptopScreen = createDeviceScreen(7.6, 4.6, 800, 500);
    laptopScreen.mesh.position.set(0, 2.5, -2.8);
    laptopScreen.mesh.rotation.x = -0.2;
    ownerLaptop.add(laptopScreen.mesh);

    ownerLaptop.position.set(24, 6, -10);
    ownerLaptop.rotation.y = -0.3;
    scene.add(ownerLaptop);
  }

  // --- 3. Packets & Clouds ---
  const cloudPaths = [];
  const lineMats = new THREE.LineBasicMaterial({ color: 0xC6FF3E, transparent: true, opacity: 0.15, linewidth: 2 });
  for(let i=0; i<3; i++) {
    const curve = new THREE.QuadraticBezierCurve3(
      posWorld,
      new THREE.Vector3(posWorld.x - 8 - Math.random()*8, 15, posWorld.y - 15),
      new THREE.Vector3(-5 + Math.random()*10, 35, -30)
    );
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)), lineMats));
    cloudPaths.push(curve);
  }
  
  const localPacket = createBlueprintNode(new THREE.BoxGeometry(0.5, 0.5, 0.5), altLineMat);
  localPacket.visible = false;
  scene.add(localPacket);

  localPacket2 = createBlueprintNode(new THREE.BoxGeometry(0.5, 0.5, 0.5), altLineMat);
  localPacket2.visible = false;
  scene.add(localPacket2);

  const cloudPacket = createBlueprintNode(new THREE.BoxGeometry(0.6, 0.6, 0.6), neonLineMat);
  cloudPacket.visible = false;
  scene.add(cloudPacket);

  const ambientGroup = new THREE.Group();
  for(let i=0; i<30; i++) {
    const m = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.8, 0)), new THREE.LineBasicMaterial({ color: 0xC6FF3E, transparent: true, opacity: 0.15 }));
    m.position.set((Math.random()-0.5)*60, Math.random()*40, -10 - Math.random()*40);
    m.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    ambientGroup.add(m);
  }
  scene.add(ambientGroup);

  // --- Animation Loop ---
  let mouseX = 0, mouseY = 0;
  if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth/2) * 0.0004;
      mouseY = (e.clientY - window.innerHeight/2) * 0.0004;
    });
  }

  const clock = new THREE.Clock();

  // --- Airport Board Text Scramble Effect ---
  const initScramble = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const wordEls = document.querySelectorAll('.scramble');
    
    wordEls.forEach(el => {
      el.addEventListener('mouseover', scrambleText);
      scrambleText({target: el}); // Run on load
    });
  
    function scrambleText(event) {
      const el = event.target;
      let iteration = 0;
      const originalText = el.dataset.value || el.innerText;
      if (!el.dataset.value) el.dataset.value = originalText;
      
      clearInterval(el.scrambleInterval);
      
      // Prevent layout shifting by locking exact width and clipping overflow
      if (!el.style.width) {
        el.style.display = 'inline-block';
        const rect = el.getBoundingClientRect();
        el.style.width = rect.width + 2 + 'px';
        el.style.overflow = 'hidden';
        el.style.verticalAlign = 'bottom';
      }
      
      // Force neon color during animation
      const originalColor = el.style.color;
      el.style.color = '#c6ff3e'; // Neon lime
      
      el.scrambleInterval = setInterval(() => {
        el.innerText = originalText.split("").map((letter, index) => {
          if(index < iteration) {
            return originalText[index];
          }
          return letters[Math.floor(Math.random() * 26)];
        }).join("");
        
        if(iteration >= originalText.length){
          clearInterval(el.scrambleInterval);
          // Only revert color if it's not permanently neon
          if (!el.classList.contains('scramble')) {
             el.style.color = originalColor;
          }
        }
        iteration += 1 / 3; // Slower speed of decoding
      }, 60);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScramble);
  } else {
    initScramble();
  }

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    posGroup.position.y = -2 + Math.sin(time * 1.2) * 0.4;
    posGroup.rotation.y = -0.2 + Math.sin(time * 0.4) * 0.08;
    posGroup.rotation.z = Math.sin(time * 0.6) * 0.02;
    ambientGroup.rotation.y = time * 0.02;

    // Reset Main POS Screen
    const ctx = mainScreen.ctx;
    ctx.clearRect(0, 0, 1024, 680);
    ctx.strokeStyle = '#c6ff3e'; ctx.fillStyle = '#c6ff3e'; ctx.lineWidth = 4;
    
    localPacket.visible = false;
    localPacket2.visible = false;
    cloudPacket.visible = false;

    // --- RETAIL (14s) ---
    if (scenario === 'retail') {
       const t = time % 14;
       ctx.strokeRect(40, 40, 600, 600); ctx.strokeRect(680, 40, 300, 600);
       ctx.font = 'bold 36px monospace'; ctx.fillText('TILLEASE / RETAIL', 80, 100);
       if (t > 1.5) {
           ctx.strokeRect(700, 80, 50, 50); ctx.fillRect(770, 90, 140, 4); ctx.fillRect(770, 110, 70, 4); 
           ctx.fillRect(700, 560, 260, 50); 
       } else ctx.strokeRect(700, 560, 260, 50);        if (scannerLaser) scannerLaser.material.opacity = 0;
       localPacket.visible = false;
       
       if (grocery1) {
           if (t < 3.0) {
               grocery1.position.set(-8 + (t/3.0)*10, 2, 0); // slides to X=2
           } else if (t < 5.0) {
               grocery1.position.set(2 + ((t-3.0)/2.0)*6, 2, 0); // slides to X=8
           } else {
               grocery1.position.set(8, 2, 0);
           }
       }
       
       if (grocery2) {
           if (t < 4.0) {
               grocery2.position.set(-8, 1.75, 0);
           } else if (t < 7.0) {
               grocery2.position.set(-8 + ((t-4.0)/3.0)*10, 1.75, 0); // slides to X=2
           } else if (t < 9.0) {
               grocery2.position.set(2 + ((t-7.0)/2.0)*6, 1.75, 0); // slides to X=8
           } else {
               grocery2.position.set(8, 1.75, 0);
           }
       }

       // Laser Flashes at t=2.9-3.1 and t=6.9-7.1
       if (scannerLaser) {
           if ((t > 2.9 && t < 3.1) || (t > 6.9 && t < 7.1)) {
               scannerLaser.material.opacity = 0.8;
           }
       }
       
       // Packets routing from scanner to POS
       let scannerPos = new THREE.Vector3(0, 0, -4); // approx global pos of scanner
       if (t > 3.0 && t < 3.8) {
           localPacket.visible = true;
           localPacket.position.lerpVectors(scannerPos, posWorld, (t - 3.0) / 0.8);
       }
       if (t > 7.0 && t < 7.8) {
           localPacket.visible = true;
           localPacket.position.lerpVectors(scannerPos, posWorld, (t - 7.0) / 0.8);
       }
       
       // Till Screen UI Updates (items added)
       if (t > 3.5 && t < 7.5) {
           ctx.fillRect(40, 200, 520, 60);
       } else if (t >= 7.5 && t < 14) {
           ctx.fillRect(40, 200, 520, 140); // 2 items
       }
       
       // Packet POS to Cloud (Payment processing)
       if (t > 8.0 && t < 10.0) {
           localPacket.visible = true;
           localPacket.position.lerpVectors(posWorld, cloudPaths[1].getPointAt(0.5), (t - 8.0) / 2.0);
       }
       
       // Receipt scrolls out (10.0 to 12.0)
       if (printerObj) {
           if (t < 10.0 || t > 15.0) { printerObj.scale.y = 0.001; printerObj.material.opacity = 0; } 
           else {
               let s = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 10.0) / 0.5)), 3);
               printerObj.scale.y = Math.max(0.001, s);
               if (printerObj.material.map) { printerObj.material.map.repeat.y = -s; printerObj.material.map.offset.y = 1; }
               printerObj.material.opacity = 0.95;
           }
       }
       if (t > 5.0 && t < 7.0) {
           cloudPacket.visible = true;
           cloudPacket.position.copy(cloudPaths[0].getPointAt((t - 5.0) / 2.0));
       }
    } 
 
    // --- RESTAURANT (14s) ---
    else if (scenario === 'restaurant') {
       const t = time % 14;
       
       // 0-2: Waiter Tablet takes order
       if (waiterTablet) {
          waiterTablet.position.y = -2 + Math.sin(time * 2) * 0.5;
          waiterTablet.rotation.x = 0.4 + Math.sin(time) * 0.1;
          waiterTablet.rotation.y = 0.5;
          const tCtx = tabScreen.ctx;
          tCtx.clearRect(0,0,400,600); tCtx.strokeStyle = '#FFFFFF'; tCtx.fillStyle = '#FFFFFF'; tCtx.lineWidth = 4;
          tCtx.strokeRect(20,20,360,560);
          tCtx.font = 'bold 24px monospace'; tCtx.fillText('MENU SELECTION', 40, 60);
          
          for(let i=0; i<6; i++) {
              let x = 40 + (i%2)*160;
              let y = 90 + Math.floor(i/2)*150;
              if (t < 2.8) {
                  if ((i===0 && t>0.4) || (i===3 && t>1.0) || (i===5 && t>1.6)) {
                      tCtx.fillRect(x, y, 140, 130);
                  } else {
                      tCtx.strokeRect(x, y, 140, 130);
                  }
              } else {
                  tCtx.strokeRect(x, y, 140, 130);
              }
          }
          tabScreen.tex.needsUpdate = true;
       }
       
       // 2.0-2.8: Tablet syncs to POS
       if (t > 2.0 && t < 2.8) {
           localPacket.visible = true;
           localPacket.position.lerpVectors(new THREE.Vector3(-8,-2,4), posWorld, (t - 2.0) / 0.8);
       }
       // 2.8-3.6: POS routes to Kitchen KDS and KOT Printer simultaneously
       if (t > 2.8 && t < 3.6) {
           localPacket.visible = true;
           localPacket2.visible = true;
           // Kitchen Group is at (26, 2, -12)
           // KDS relative is (0, 5, 0) -> World (26, 7, -12)
           // KOT Printer relative is (-3, -2, 0) -> World (23, 0, -12)
           localPacket.position.lerpVectors(posWorld, new THREE.Vector3(26, 7, -12), (t - 2.8) / 0.8);
           localPacket2.position.lerpVectors(posWorld, new THREE.Vector3(23, 0, -12), (t - 2.8) / 0.8);
       }
       
       // Main POS Screen (Table active from 3.6 until payment finishes at 11)
       ctx.strokeRect(40, 40, 944, 600);
       ctx.font = 'bold 36px monospace'; ctx.fillText('TILLEASE / FLOOR PLAN', 80, 100);
       for(let i=0; i<8; i++) {
         let x = 80 + (i%4)*220; let y = 160 + Math.floor(i/4)*220;
         if (i === 2 && t > 3.6 && t < 11.0) ctx.fillRect(x, y, 180, 180); 
         else ctx.strokeRect(x, y, 180, 180);
       }

       // Update KDS Screen (Ticket active 3.6 until served at 8.0)
       if (kdsScreen) {
          const kCtx = kdsDisplay.ctx;
          kCtx.clearRect(0,0,1000,600); kCtx.strokeStyle = '#FFFFFF'; kCtx.fillStyle = '#FFFFFF'; kCtx.lineWidth = 4;
          kCtx.strokeRect(20,20,960,560);
          kCtx.font = '36px monospace'; kCtx.fillText('KDS ACTIVE TICKETS', 40, 80);
          for(let i=0; i<4; i++) {
            if (i === 0 && t > 3.6 && t < 8.0) kCtx.fillRect(40 + i*230, 120, 210, 400);
            else kCtx.strokeRect(40 + i*230, 120, 210, 400);
          }
          kdsDisplay.tex.needsUpdate = true;
       }
       
       // KOT Prints (3.6 to 5.0)
       if (printerObj) {
           if (t < 3.6 || t > 8.0) { printerObj.scale.y = 0.001; printerObj.material.opacity = 0; } 
           else {
               let s = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 3.6) / 0.5)), 3);
               printerObj.scale.y = Math.max(0.001, s);
               if (printerObj.material.map) { printerObj.material.map.repeat.y = -s; printerObj.material.map.offset.y = 1; }
               printerObj.material.opacity = 0.95;
           }
       }

       // Bill Prints at Till (9.0 to 11.0)
       if (posReceipt) {
           if (t < 9.0) { posReceipt.scale.y = 0.001; posReceipt.material.opacity = 0; }
           else {
               let s = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 9.0) / 0.5)), 3);
               posReceipt.scale.y = Math.max(0.001, s);
               if (posReceipt.material.map) { posReceipt.material.map.repeat.y = -s; posReceipt.material.map.offset.y = 1; }
               posReceipt.material.opacity = 0.95 * (1 - (t > 13.0 ? (t - 13.0) * 1 : 0));
           }
       }
       
       // 11.0-13.0: Cloud Sync (Payment done)
       if (t > 11.0 && t < 13.0) {
           cloudPacket.visible = true;
           cloudPacket.position.copy(cloudPaths[1].getPointAt((t - 11.0) / 2.0));
       }
    } 
    // --- LAUNDRY (16s) ---
    else if (scenario === 'laundry') {
       const t = time % 16;
       
       // 0-2: Tag printer rapid printing
       if (printerObj) {
           if (t > 2.0) { printerObj.scale.y = 0.001; printerObj.material.opacity = 0; } 
           else {
               let subT = (t * 3) % 1.0; 
               printerObj.scale.y = Math.max(0.001, subT); 
               if (printerObj.material.map) { printerObj.material.map.repeat.y = -subT; printerObj.material.map.offset.y = 1; }
               printerObj.material.opacity = 0.95;
           }
       }
       
       // 2-4: Washing Machine Processing
       if (washerDoor) {
           if (t > 2.0 && t < 4.0) {
               washerDoor.rotation.z -= 0.15; // spins fast
               washerDoor.rotation.x += 0.05; // tumble effect
               washerDoor.children.forEach(c => c.material.opacity = 1.0);
           } else {
               washerDoor.rotation.z -= 0.01; // idles
               washerDoor.rotation.x -= 0.01; 
               washerDoor.children.forEach(c => c.material.opacity = 0.2);
           }
       }

       // 4-5: Washer syncs to POS
       if (t > 4.0 && t < 5.0) {
           localPacket.visible = true;
           localPacket.position.lerpVectors(new THREE.Vector3(24, -2, -6), posWorld, (t - 4.0) / 1.0);
       }

       // 5-6: Packet from POS to Phone (WhatsApp Notification)
       if (t > 5.0 && t < 6.0) {
           localPacket.visible = true;
           localPacket.position.lerpVectors(posWorld, new THREE.Vector3(-8,2,4), (t - 5.0) / 1.0);
       }
       
       // 6-8: Customer Phone App Selection
       if (customerPhone) {
          customerPhone.position.y = 2 + Math.sin(time * 2) * 0.5;
          customerPhone.rotation.x = Math.sin(time) * 0.1;
          const pCtx = phScreen.ctx;
          pCtx.clearRect(0,0,300,600); pCtx.strokeStyle = '#FFFFFF'; pCtx.fillStyle = '#FFFFFF'; pCtx.lineWidth = 4;
          pCtx.strokeRect(10,10,280,580);
          pCtx.font = '20px monospace'; pCtx.fillText('TRACKING APP', 30, 50);
          if (t > 6.0 && t < 8.0) { pCtx.fillRect(30, 400, 240, 60); } // Selecting delivery
          else { pCtx.strokeRect(30, 400, 240, 60); }
          phScreen.tex.needsUpdate = true;
       }

       // 8-9: Packet from Phone to POS (Realtime Sync)
       if (t > 8.0 && t < 9.0) {
           localPacket.visible = true;
           localPacket.position.lerpVectors(new THREE.Vector3(-8,2,4), posWorld, (t - 8.0) / 1.0);
       }
       
       // 9-11: POS UI Delivery Set & Bill Print
       ctx.strokeRect(40, 40, 944, 600); 
       ctx.font = 'bold 36px monospace'; ctx.fillText('TILLEASE / LAUNDRY INTAKE', 80, 100);
       if (t > 9.0) {
           ctx.fillRect(80, 150, 400, 400); 
           ctx.fillStyle = '#1B1F2A'; ctx.fillText('DELIVERY SET', 120, 360); 
       } else ctx.strokeRect(80, 150, 400, 400);

       if (posReceipt) {
           if (t < 9.0 || t > 15.0) { posReceipt.scale.y = 0.001; posReceipt.material.opacity = 0; }
           else {
               let s = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 9.0) / 0.5)), 3);
               posReceipt.scale.y = Math.max(0.001, s);
               if (posReceipt.material.map) { posReceipt.material.map.repeat.y = -s; posReceipt.material.map.offset.y = 1; }
               posReceipt.material.opacity = 0.95;
           }
       }
       
       // 11-13: Cloud Sync (Sales to dashboard)
       if (t > 11.0 && t < 13.0) {
           cloudPacket.visible = true;
           cloudPacket.position.copy(cloudPaths[2].getPointAt((t - 11.0) / 2.0));
       }
    } 
    // --- SALON (8s) ---
    else if (scenario === 'salon') {
       const t = time % 8;
       ctx.strokeRect(40, 40, 944, 600); 
       ctx.font = 'bold 36px monospace'; ctx.fillText('TILLEASE / APPOINTMENTS', 80, 100);
       for(let i=0; i<4; i++) {
         if(i === 1 && t > 1.0) ctx.fillRect(80, 150 + i*100, 864, 80); 
         else ctx.strokeRect(80, 150 + i*100, 864, 80);
       }
       if (t > 3.0 && t < 5.0) {
           cloudPacket.visible = true;
           cloudPacket.position.copy(cloudPaths[0].getPointAt((t - 3.0) / 2.0));
       }
       if (printerObj) {
           if (t < 5.0) { printerObj.scale.y = 0.001; printerObj.material.opacity = 0; } 
           else {
               let s = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 5.0) / 0.5)), 3);
               printerObj.scale.y = Math.max(0.001, s);
               if (printerObj.material.map) { printerObj.material.map.repeat.y = -s; printerObj.material.map.offset.y = 1; }
               printerObj.material.opacity = 0.95 * (1 - (t > 7.0 ? (t - 7.0) * 1 : 0));
           }
       }
    } 
    // --- INDEX (Global Analytics) (10s) ---
    else {
       const t = time % 10;
       ctx.strokeRect(40, 40, 600, 600); ctx.strokeRect(680, 40, 300, 600);
       ctx.font = 'bold 36px monospace'; ctx.fillText('TILLEASE / SYNC NODE', 80, 100);
       if (t > 1.0) {
           ctx.strokeRect(700, 80, 50, 50); ctx.fillRect(770, 90, 140, 4); ctx.fillRect(770, 110, 70, 4); 
           ctx.fillRect(700, 560, 260, 50); 
       } else ctx.strokeRect(700, 560, 260, 50); 
       
       if (printerObj) {
           if (t < 2.0) { printerObj.scale.y = 0.001; printerObj.material.opacity = 0; } 
           else {
               let s = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 2.0) / 0.5)), 3);
               printerObj.scale.y = Math.max(0.001, s);
               if (printerObj.material.map) { printerObj.material.map.repeat.y = -s; printerObj.material.map.offset.y = 1; }
               printerObj.material.opacity = 0.95 * (1 - (t > 8.0 ? (t - 8.0) * 2 : 0));
           }
       }
       if (t > 3.0 && t < 5.0) {
           cloudPacket.visible = true;
           cloudPacket.position.copy(cloudPaths[0].getPointAt((t - 3.0) / 2.0));
       }
       
       if (ownerLaptop) {
           ownerLaptop.position.y = 6 + Math.sin(time * 0.8) * 0.5;
           if (t > 5.0 && t < 7.0) {
               localPacket.visible = true;
               localPacket.position.lerpVectors(cloudPaths[0].getPointAt(1.0), new THREE.Vector3(24, 6, -10), (t - 5.0) / 2.0);
           }
           const lCtx = laptopScreen.ctx;
           lCtx.clearRect(0, 0, 800, 500);
           lCtx.strokeStyle = '#FFFFFF'; lCtx.lineWidth = 4;
           lCtx.strokeRect(20, 20, 760, 460);
           lCtx.fillStyle = '#FFFFFF'; lCtx.font = 'bold 32px monospace';
           lCtx.fillText('OWNER / ANALYTICS DASHBOARD', 40, 70);
           if (t > 7.0) {
               for(let i=0; i<6; i++) {
                   const h = 50 + ((i*37 + 50) % 200); // stable heights based on index
                   lCtx.fillRect(60 + i*110, 420 - h, 80, h);
               }
           }
           laptopScreen.tex.needsUpdate = true;
       }
    }
    
    mainScreen.tex.needsUpdate = true;
    if (localPacket.visible) { localPacket.rotation.x += 0.1; localPacket.rotation.y += 0.1; }
    if (localPacket2.visible) { localPacket2.rotation.x += 0.1; localPacket2.rotation.y += 0.1; }
    if (cloudPacket.visible) { cloudPacket.rotation.x += 0.1; cloudPacket.rotation.y += 0.1; }

    camera.position.x += 0.05 * (mouseX * 8 - camera.position.x);
    camera.position.y += 0.05 * (-mouseY * 4 + 5 - camera.position.y);
    camera.lookAt(0, 3, 0);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
});
