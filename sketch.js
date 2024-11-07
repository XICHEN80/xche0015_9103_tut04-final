
let circles = []; 
let circleCount = 40; 
let layersPerCircle = 8; 
let particlesPerLayer = 40; 
let circleRadius = 130; 
let circleSpacing = 400; 
let layoutAngle = 7; 

let rotationAngle = 0; 
let scaleFactor = 1; 

function setup() {
  createCanvas(windowWidth, windowHeight); 
  background("#02212f"); 

  initCircles(); 

  setInterval(animateCircles, 400);
}

function draw() {
  background("#055376"); 
  push();
  translate(width / 2, height / 2); // Translate canvas to center
  rotate(rotationAngle); // Apply rotation angle
  scale(scaleFactor); // Apply scaling factor
  translate(-width / 2, -height / 2); // Restore canvas position

  // Draw each Circle object
  for (let circle of circles) {
    circle.show();
  }
  pop();
}

// Animation function 
function animateCircles() {
  rotationAngle += PI / 180 * 12; // 12 degrees each time to speed up rotation
  scaleFactor = 1 + 0.05 * sin(millis() / 1); // create periodic scaling effect
}

function initCircles() {
   // Calculate the offset for the tilt angle
  let angleRad = radians(layoutAngle); 
  let xStep = circleSpacing * cos(angleRad); 
  let yStep = circleSpacing * sin(angleRad); 

  // Calculate the number of rows and columns needed to fill the canvas
  let cols = Math.ceil(width / xStep) + 2; 
  let rows = Math.ceil(height / yStep) + 7; 

  // To evenly space the circles, we start at the top left corner of the canvas and offset them slightly
  let startX = -circleRadius;
  let startY = -circleRadius;

  // Create Circle objects 
  for (let row = 0; row < rows; row++) {
    let offsetX = (row % 2) * (xStep / 2); // Offset each row

    for (let col = 0; col < cols; col++) {
      let x = startX + col * xStep + offsetX;
      let y = startY + row * (yStep * 2.3);

  // create circles within canvas range
      if (x >= -circleRadius && x <= width + circleRadius &&
          y >= -circleRadius && y <= height + circleRadius) {
        circles.push(new Circle(x, y, circleRadius, layersPerCircle, particlesPerLayer));
      }
    }
  }
}

class Circle {
  constructor(x, y, radius, numLayers, particlesPerLayer) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.particles = []; 
    this.concentricCircles = []; 
    this.rays = []; 

    // Random background color
    this.backgroundColor = random(0, 10) >= 3 ? color(255, 255, 255) : color(random(100, 255), random(100, 255), random(100, 255));
    this.showParticle = random(0, 10) >= 2; 

    this.initConcentricCircles(); 
    this.initParticles(numLayers, particlesPerLayer); 
    this.initRays(); 
    this.hexagonPoints = this.calculateHexagonPoints(); 
  }

  // Calculate hexagon vertex coordinates
  calculateHexagonPoints() {
    let points = [];
    for (let i = 0; i < 8; i++) {
      let angle = TWO_PI / 8 * i - PI / 8;
      let px = this.x + cos(angle) * (this.radius) * 1.2;
      let py = this.y + sin(angle) * (this.radius) * 1.2;
      points.push({x: px, y: py});
    }
    return points;
  }

  // Draw hexagon edges
  drawVineEdge(start, end) {
    let distance = dist(start.x, start.y, end.x, end.y);
    let steps = floor(distance / 10);

    push();
    strokeWeight(4);
    stroke(random(100, 255), random(100, 200), random(100, 200));
    noFill();

    beginShape();
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let x = lerp(start.x, end.x, t);
      let y = lerp(start.y, end.y, t);
  //Add the effect of waves between lines
      let perpX = -(end.y - start.y) / distance;
      let perpY = (end.x - start.x) / distance;
      let amp = 4 * sin(t * PI);
      let freq = 4;

      x += perpX * amp * sin(t * TWO_PI * freq);
      y += perpY * amp * sin(t * TWO_PI * freq);

      curveVertex(x, y);
    }
    endShape();
    pop();
  }

  drawHexagonFrame() {
    for (let i = 0; i < 8; i++) {
      let start = this.hexagonPoints[i];
      let end = this.hexagonPoints[(i + 1) % 8];
      this.drawVineEdge(start, end);
    }
   // Draw the vertex pearl
    for (let point of this.hexagonPoints) {
     // White pearl
      fill(255);
      noStroke();
      ellipse(point.x, point.y, 15);
     // pearl highlights 
      fill(255, 255, 255, 200);
      ellipse(point.x - 15 / 4, point.y - 15 / 4, 15 / 3);
    }
  }

  initConcentricCircles() {
    let numCircles = Math.ceil(random(1,8));
    let colors = [
      color(255, 100, 100),
      color(100, 255, 100),
      color(100, 100, 255),
      color(255, 255, 100),
      color(255, 100, 255),
      color(100, 255, 255),
      color(255, 150, 50),
      color(150, 50, 255)
    ];
   // create concentric circles from outside to inside
    for (let i = 0; i < numCircles; i++) {
      let radius = map(i, 0, numCircles - 1, this.radius * 0.8, this.radius * 0.1);
      let col = colors[i % colors.length];
      this.concentricCircles.push({
        radius: radius * 1.3,
        color: col,
        strokeWeight: map(i, 0, numCircles - 1, 4, 1)
      });
    }
  }

  // Initialize particles
  initParticles(numLayers, particlesPerLayer) {
    let layerColor = color(random(100, 255), random(100, 255), random(100, 255));
    for (let layer = 0; layer < numLayers; layer++) {
      let layerRadius = (this.radius / numLayers) * (layer + 1);

      for (let i = 0; i < particlesPerLayer; i++) {
        let angle = (TWO_PI / particlesPerLayer) * i + random(-0.05, 0.05);
        let dist = layerRadius + random(-2, 0);
        let size = map(layer, 0, numLayers - 1, 4, 12) * random(0.8, 1.2);

        let px = this.x + cos(angle) * dist;
        let py = this.y + sin(angle) * dist;

        this.particles.push(new Particle(px, py, layerColor, size));
      }
    }
  }

  // Initialize rays
  initRays() {
    let numRays = 60;
    let rayLength = this.radius;
    for (let i = 0; i < numRays; i++) {
      let angle = (TWO_PI / numRays) * i;
      let innerRadius = this.radius * 0.4;
      let outerRadius = innerRadius + rayLength * 0.6;
      this.rays.push({
        angle: angle,
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        color: color(random(200, 255), random(100, 200), 50)
      });
    }
  }

  show() {
    this.drawBackground();

    if (!this.showParticle) {
      // draw rays
      for (let ray of this.rays) {
        stroke(ray.color);
        strokeWeight(2);
        let x1 = this.x + cos(ray.angle) * ray.innerRadius;
        let y1 = this.y + sin(ray.angle) * ray.innerRadius;
        let x2 = this.x + cos(ray.angle) * ray.outerRadius;
        let y2 = this.y + sin(ray.angle) * ray.outerRadius;
        line(x1, y1, x2, y2);
      }
    } else {
      for (let p of this.particles) {
        p.show();
      }
    }
  // draw concentric circles
    for (let circle of this.concentricCircles) {
      fill(circle.color);
      strokeWeight(circle.strokeWeight);
      stroke(255, 100);
      ellipse(this.x, this.y, circle.radius);
    }

    this.drawHexagonFrame();
  }

  drawBackground() {
    fill(this.backgroundColor);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2.1);
  }
}

class Particle {
  constructor(x, y, col, size) {
    this.x = x + random(-0.5, 0.5);
    this.y = y + random(-0.5, 0.5);
    this.col = col;
    this.size = size;
  }

  // Display particle
  show() {
    fill(this.col);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
}

// Regenerate circles when window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circles = [];
  initCircles();
  redraw();
}