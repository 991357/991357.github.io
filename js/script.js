document.addEventListener('DOMContentLoaded', function () {

  const gameToggle = document.getElementById('game-toggle');
  const playText = document.getElementById('play-text');
  const speedControls = document.getElementById('speed-controls');
  const speedButtons = {
    x1: document.getElementById('speed-x1'),
    x2: document.getElementById('speed-x2'),
    x4: document.getElementById('speed-x4'),
    x6: document.getElementById('speed-x6'),
  };
  let isGameEnabled = false;

  // --- Smooth Scroll for all anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Scroll-spy for side navigation ---
  const sections = document.querySelectorAll('.content-section, #home');
  const sideNavLinks = document.querySelectorAll('#side-nav .nav-link');

  function handleScrollSpy() {
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - sectionHeight / 3) {
        currentSectionId = section.getAttribute('id');
      }
    });

    sideNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSectionId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScrollSpy);
  handleScrollSpy();

  // --- Typing Effect ---
  const typingText = document.getElementById('typing-text');
  const text = "도전, 개발 그리고 창의성을 상징하는 개발자";
  let index = 0;
  let isDeleting = false;

  function type() {
    const fullText = text;
    let currentText = '';

    if (isDeleting) {
      currentText = fullText.substring(0, index - 1);
      index--;
    } else {
      currentText = fullText.substring(0, index + 1);
      index++;
    }

    if(typingText) {
      typingText.textContent = currentText;
    }

    let typeSpeed = isDeleting ? 100 : 200;

    if (!isDeleting && index === fullText.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && index === 0) {
      isDeleting = false;
    }
    
    setTimeout(type, typeSpeed);
  }

  type();

  // --- Background Shooting Game ---
  const canvas = document.getElementById('background-game');
  if (canvas && window.innerWidth > 768) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const player = {
      x: width / 2,
      y: height / 2,
      size: 15,
      color: '#7dcfff' // accent2
    };

    const mouse = {
      x: width / 2,
      y: height / 2
    };

    const safeZoneElement = document.querySelector('#home .container');
    let safeZoneRect = { left: 0, top: 0, right: 0, bottom: 0 };
    const safeZonePadding = 30; // 30px padding

    function updateSafeZone() {
        if (safeZoneElement) {
            const rect = safeZoneElement.getBoundingClientRect();
            safeZoneRect = {
                left: rect.left - safeZonePadding,
                top: rect.top - safeZonePadding,
                right: rect.right + safeZonePadding,
                bottom: rect.bottom + safeZonePadding,
            };
        }
    }

    let bullets = [];
    let targets = [];
    let particles = [];
    let targetSpawnCounter = 0;
    let shootCooldownCounter = 0;
    let animationFrameId = null;
    let lastTime = 0;
    let gameSpeed = 1; // Game speed multiplier

    function startGame() {
        if (!animationFrameId && isGameEnabled) {
            updateSafeZone();
            lastTime = 0;
            animate(0);
        }
    }

    function stopGame() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            ctx.clearRect(0, 0, width, height);
            // Clear all game elements
            bullets = [];
            targets = [];
            particles = [];
        }
    }

    if (gameToggle && playText) {
        gameToggle.addEventListener('change', function() {
            isGameEnabled = this.checked;
            playText.classList.toggle('hidden', this.checked);
            speedControls.classList.toggle('hidden', !this.checked);

            if (isGameEnabled) {
                if (window.scrollY === 0) {
                    startGame();
                }
                // Set x1 as default active button
                if(speedButtons.x1) {
                    Object.values(speedButtons).forEach(btn => btn.classList.remove('active'));
                    speedButtons.x1.classList.add('active');
                    gameSpeed = 1;
                }
            } else {
                stopGame();
                 // Clear active state from all speed buttons
                Object.values(speedButtons).forEach(btn => btn.classList.remove('active'));
            }
        });
    }

    Object.entries(speedButtons).forEach(([key, button]) => {
        if (button) {
            button.addEventListener('click', function() {
                const speed = parseInt(key.slice(1));
                gameSpeed = speed;

                // Remove active class from all speed buttons
                Object.values(speedButtons).forEach(btn => btn.classList.remove('active'));
                // Add active class to the clicked button
                this.classList.add('active');
            });
        }
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      updateSafeZone();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    class Particle {
      constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }

      update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        this.alpha -= 0.02 * (deltaTime * 60); // Adjust alpha fade based on frame rate
        this.draw();
      }
    }

    function spawnTarget() {
        const radius = Math.random() * (30 - 10) + 10;
        let x, y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : width + radius;
            y = Math.random() * height;
        } else {
            x = Math.random() * width;
            y = Math.random() < 0.5 ? 0 - radius : height + radius;
        }
        
        const angle = Math.atan2(height / 2 - y, width / 2 - x);
        const velocity = {
            x: Math.cos(angle) * 120,
            y: Math.sin(angle) * 120
        };

        targets.push({ x, y, radius, color: '#c0caf5', velocity });
    }

    function animate(timestamp) {
      animationFrameId = requestAnimationFrame(animate);
      let deltaTime = (timestamp - lastTime) / 1000 || 0;
      lastTime = timestamp;
      
      // Apply game speed
      deltaTime *= gameSpeed;

      ctx.clearRect(0, 0, width, height);

      const lerpFactor = 1 - Math.pow(0.90, deltaTime * 60);
      player.x += (mouse.x - player.x) * lerpFactor;
      player.y += (mouse.y - player.y) * lerpFactor;

      ctx.save();
      ctx.translate(player.x, player.y);
      const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(player.size, 0);
      ctx.lineTo(-player.size / 2, -player.size / 2);
      ctx.lineTo(-player.size / 2, player.size / 2);
      ctx.closePath();
      ctx.fillStyle = player.color;
      ctx.fill();
      ctx.restore();

      if (shootCooldownCounter > 15) {
        const bulletAngle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
        const velocity = { x: Math.cos(bulletAngle) * 600, y: Math.sin(bulletAngle) * 600 };
        bullets.push({ x: player.x, y: player.y, radius: 4, color: '#bb9af7', velocity: velocity });
        shootCooldownCounter = 0;
      }
      shootCooldownCounter += gameSpeed;

      particles.forEach((p, i) => { p.alpha <= 0 ? particles.splice(i, 1) : p.update(deltaTime); });

      bullets.forEach((b, i) => {
        b.x += b.velocity.x * deltaTime;
        b.y += b.velocity.y * deltaTime;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) { setTimeout(() => bullets.splice(i, 1), 0); }
      });

      targets.forEach((target, tIndex) => {
        const prevX = target.x - target.velocity.x * deltaTime;
        const prevY = target.y - target.velocity.y * deltaTime;

        target.x += target.velocity.x * deltaTime;
        target.y += target.velocity.y * deltaTime;

        const targetRight = target.x + target.radius;
        const targetLeft = target.x - target.radius;
        const targetTop = target.y - target.radius;
        const targetBottom = target.y + target.radius;

        if (targetRight > safeZoneRect.left && targetLeft < safeZoneRect.right && targetBottom > safeZoneRect.top && targetTop < safeZoneRect.bottom) {
            if (prevX + target.radius <= safeZoneRect.left) {
                target.velocity.x *= -1;
                target.x = safeZoneRect.left - target.radius;
            } 
            else if (prevX - target.radius >= safeZoneRect.right) {
                target.velocity.x *= -1;
                target.x = safeZoneRect.right + target.radius;
            }
            else if (prevY + target.radius <= safeZoneRect.top) {
                target.velocity.y *= -1;
                target.y = safeZoneRect.top - target.radius;
            }
            else if (prevY - target.radius >= safeZoneRect.bottom) {
                target.velocity.y *= -1;
                target.y = safeZoneRect.bottom + target.radius;
            }
        }

        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.strokeStyle = target.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        bullets.forEach((bullet, bIndex) => {
          const dist = Math.hypot(bullet.x - target.x, bullet.y - target.y);
          if (dist - target.radius - bullet.radius < 1) {
            for (let i = 0; i < target.radius * 0.5; i++) {
              particles.push(new Particle(bullet.x, bullet.y, Math.random() * 2, target.color, { x: (Math.random() - 0.5) * 720, y: (Math.random() - 0.5) * 720 }));
            }
            if (target.radius - 10 > 10) {
                 gsap.to(target, { radius: target.radius - 10, duration: 0.1 / gameSpeed });
                 setTimeout(() => { bullets.splice(bIndex, 1); }, 0);
            } else {
                setTimeout(() => { targets.splice(tIndex, 1); bullets.splice(bIndex, 1); }, 0);
            }
          }
        });
      });

      targetSpawnCounter += gameSpeed;
      if (targetSpawnCounter > 100) {
        spawnTarget();
        targetSpawnCounter = 0;
      }
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            stopGame();
        } else {
            startGame();
        }
    });
    
    const gsapScript = document.createElement('script');
    gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js';
    gsapScript.onload = () => {
        if (window.scrollY === 0) {
            // Don't start game automatically, wait for toggle
        }
    };
    document.body.appendChild(gsapScript);
  }
});