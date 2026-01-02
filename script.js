// ===============================
// HERO WEBGL
// ===============================
const canvas = document.getElementById("hero-canvas");
const heroRight = document.querySelector(".hero-right");
const heroLeft = document.querySelector(".hero-left");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0.6, 2.8);
camera.rotation.x = -0.35;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const light = new THREE.DirectionalLight(0xffffff, 1.3);
light.position.set(1, 1, 2);
scene.add(light);

function resize() {
  const w = heroRight.clientWidth;
  const h = heroRight.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

const geometry = new THREE.PlaneGeometry(6, 6, 160, 160);

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uDepth: { value: 0 }
  },
  vertexShader: `uniform float uTime; uniform vec2 uMouse; uniform float uDepth; varying vec2 vUv; void main() { vUv = uv; vec3 pos = position; float wave = sin(pos.x * 1.3 + uTime * 0.6) + cos(pos.y * 1.6 - uTime * 0.5); float d = distance(uv, uMouse); float ripple = sin(d * 14.0 - uTime * 4.5) * exp(-d * 4.0); pos.z += wave * 0.8 + ripple * 1.2 + uDepth * 1.2; gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); }`,
  fragmentShader: `varying vec2 vUv; void main() { vec3 color = mix(vec3(0.04,0.04,0.06), vec3(0.15,0.15,0.22), vUv.y); gl_FragColor = vec4(color,1.0); }`
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

const targetMouse = new THREE.Vector2(0.5, 0.5);
const currentMouse = new THREE.Vector2(0.5, 0.5);

heroRight.addEventListener("mousemove", (e) => {
  const r = heroRight.getBoundingClientRect();
  targetMouse.x = (e.clientX - r.left) / r.width;
  targetMouse.y = 1 - (e.clientY - r.top) / r.height;
});

// ===============================
// HERO ENTRANCE
// ===============================
gsap.from(heroLeft.children, { opacity: 0, y: 50, duration: 1.2, stagger: 0.12, ease: "power3.out" });
gsap.from(plane.position, { z: -2, duration: 1.6, ease: "power4.out" });

// ===============================
// PROJECT REVEAL
// ===============================
gsap.registerPlugin(ScrollTrigger);



const projects = document.querySelectorAll(".project");
if(projects.length > 0){
  projects.forEach(project => {
    const media = project.querySelector(".project-media");
    const info = project.querySelector(".project-info");

    gsap.to(project, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: project, start: "top 75%" }
    });

    gsap.to(media, {
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: project, start: "top 75%" }
    });

    gsap.from(info.children, {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: project, start: "top 75%" }
    });
  });
  
}


// ===============================
// SCROLL DEPTH
// ===============================
window.addEventListener("scroll", () => {
  material.uniforms.uDepth.value = window.scrollY * 0.0005;
  heroLeft.style.transform = `translateY(${window.scrollY * 0.08}px)`;
});
// ===============================
// ABOUT ME – TYPED QUOTE (SAFE)
// ===============================
window.addEventListener("load", () => {
  const aboutSection = document.querySelector(".about-me");
  const aboutTarget = document.getElementById("about-typed");

  if (!aboutSection || !aboutTarget) return;

  const aboutText = `Hi, I’m Kamal — I build solutions by thinking deeply and executing cleanly.

I enjoy leading teams, breaking down complex problems, and turning ideas into real-world products that create impact.

I believe good work starts with the right questions and ends with thoughtful execution.

Research taught me how to ask better questions.
Engineering taught me how to answer them.

— Kamal`;

  let aboutIndex = 0;
  let aboutStarted = false;

  function typeAbout() {
    if (aboutIndex < aboutText.length) {
      aboutTarget.innerHTML +=
        aboutText[aboutIndex] === "\n" ? "<br>" : aboutText[aboutIndex];
      aboutIndex++;
      setTimeout(typeAbout, 55);
    }
  }

  ScrollTrigger.create({
    trigger: aboutSection,
    start: "top 65%",
    once: true,
    onEnter: () => {
      if (!aboutStarted) {
        aboutStarted = true;
        typeAbout();

        gsap.to(".about-portrait img", {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out"
        });
      }
    }
  });
});

// ===============================
// LOOP
// ===============================
let time = 0;
function animate() {
  requestAnimationFrame(animate);

  time += 0.01;
  material.uniforms.uTime.value = time;

  currentMouse.lerp(targetMouse, 0.08);
  material.uniforms.uMouse.value.copy(currentMouse);

  plane.rotation.x = (currentMouse.y - 0.5) * 0.3;
  plane.rotation.y = (currentMouse.x - 0.5) * 0.3;

  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
animate();


// ===============================
// HERO PARTICLE AVATAR
// ===============================
const loader = new THREE.TextureLoader();
loader.load('avatar.png', (texture) => {
  const img = document.createElement('img');
  img.src = 'avatar.png';
  img.onload = () => {
    const canvasAvatar = document.createElement('canvas');
    canvasAvatar.width = img.width;
    canvasAvatar.height = img.height;
    const ctx = canvasAvatar.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height);

    const geometryAvatar = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let y = 0; y < img.height; y += 2) {
      for (let x = 0; x < img.width; x += 2) {
        const idx = (y * img.width + x) * 4;
        const alpha = imgData.data[idx + 3];
        if (alpha > 128) { // only opaque pixels
          const vx = (x - img.width/2) / 100;
          const vy = -(y - img.height/2) / 100;
          const vz = (Math.random() - 0.5) * 0.5;
          positions.push(vx, vy, vz);
          colors.push(1, 1, 1); // white, we can shader later
        }
      }
    }

    geometryAvatar.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometryAvatar.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const materialAvatar = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const points = new THREE.Points(geometryAvatar, materialAvatar);
    points.position.set(0, 0, 0.1);
    scene.add(points);

    // animate particle float
    function animateAvatar() {
      requestAnimationFrame(animateAvatar);
      const pos = geometryAvatar.attributes.position.array;
      for (let i = 2; i < pos.length; i += 3) {
        pos[i] += Math.sin(time + i) * 0.0005;
      }
      geometryAvatar.attributes.position.needsUpdate = true;
    }
    animateAvatar();
  }

});

// Tilt effect for hackathon cards
const hackCards = document.querySelectorAll('.hack-card');
hackCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width/2;
    const cy = rect.height/2;
    const dx = x - cx;
    const dy = y - cy;
    const tiltX = (dy/cy)*10;
    const tiltY = -(dx/cx)*10;
    card.querySelector('.card-inner').style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  card.addEventListener('mouseleave', e => {
    card.querySelector('.card-inner').style.transform = `rotateX(0deg) rotateY(0deg)`;
  });
});

// ===============================
// HACK CARDS FULL FLIP ON CURSOR
// ===============================
hackCards.forEach(card => {
  const inner = card.querySelector('.card-inner');

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    const tiltX = (dy / cy) * 15;
    const tiltY = -(dx / cx) * 15;
    const flipY = dx > 0 ? 180 : 0;

    inner.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY + flipY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
});

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault();

  emailjs.sendForm(
    "service_7rx1fvj",
    "template_t3ihrt8",
    this
  ).then(() => {
    alert("Message sent successfully!");
    this.reset();
  }, (error) => {
    alert("Failed to send message.");
  });
});
