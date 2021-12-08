class Confetti {
    constructor(particles, gravity, maxIters) {
        this.numParticles = particles;
        this.gravity = gravity;
        this.maxIters = maxIters;
        this.colors = ["#f94144", "#f3722c", "#f8961e", "#f9844a", "#f9c74f", "#90be6d", "#43aa8b",
            "#4d908e", "#577590", "#277da1"];
        this.shapes = ["square", "square", "square", "square", "circle", "circle", "triangle"];
        this.maxWidth = 15;
        this.maxHeight = 15;
        this.variance = 10;
        this.drawInterval = 0.01;
        this.canvasId = "confetti-canvas";
        this.particles = [];
        for (let x = 0; x < this.numParticles; x++){
            let variance = Math.floor(Math.random()*this.variance);
            this.particles.push(
                {
                    spawnAt: Math.round(Math.random()*this.maxIters),
                    x: Math.round(Math.random()*window.innerWidth),
                    y: 10,
                    waveAmp: Math.round(Math.random()*3) + 2,
                    waveVar: Math.round(Math.random()*25) + 10,
                    waveOffset: Math.round(Math.random()*100),
                    color: this.colors[Math.floor(Math.random()*this.colors.length)],
                    shape: this.shapes[Math.floor(Math.random()*this.shapes.length)],
                    width: this.maxWidth - variance,
                    height: this.maxHeight - variance,
                    variance: variance,
                    rotation: Math.floor(Math.random()*90),
                    spin: ((Math.random()*2) - 1) * 3,
                    xSpin: Math.random() + 0.2,
                }
            )
            // console.log(this.particles);
        }
        this.drawParticles = function(iters, ctx, canvas){
            let below = 0;
            for (let particle of this.particles) {
                if (particle.spawnAt <= iters){
                    particle.x += Math.cos(
                        ((particle.y - particle.waveOffset) / 100) + particle.waveVar
                    ) * particle.waveAmp;
                    //particle.x += Math.cos(((Math.cos(particle.x) * particle.waveAmp) - (particle.y - particle.waveOffset)) / (particle.waveAmp * 3)) * particle.waveAmp;
                    ctx.fillStyle = particle.color;
                    if (particle.shape == "square"){
                        let points = [rotate(particle.width, 0, particle.rotation),
                            rotate(0, particle.height, particle.rotation),
                            rotate(-particle.width, 0, particle.rotation),
                            rotate(0, -particle.height, particle.rotation)];
                        ctx.beginPath();
                        ctx.moveTo(particle.x + points[0][0], particle.y + points[0][1]);
                        ctx.lineTo(particle.x + points[1][0], particle.y + points[1][1]);
                        ctx.lineTo(particle.x + points[2][0], particle.y + points[2][1]);
                        ctx.lineTo(particle.x + points[3][0], particle.y + points[3][1]);
                        ctx.closePath();
                        ctx.fill();
                    } else if (particle.shape == "circle") {
                        ctx.beginPath();
                        ctx.ellipse(particle.x, particle.y, Math.abs(particle.width),
                            Math.abs(particle.height), (Math.PI / 180) * particle.rotation,
                            0, 2 * Math.PI);
                        ctx.fill();
                    } else if (particle.shape == "triangle") {
                        let points = [rotateTri(particle.width * Math.cos(0) + particle.x,
                            particle.height * Math.sin(0) + particle.y, particle.x,
                            particle.y, particle.rotation),
                            rotateTri(particle.width * Math.cos((1/3) * (2 * Math.PI)) + particle.x,
                                particle.height * Math.sin((1/3) * (2 * Math.PI)) + particle.y,
                                particle.x, particle.y, particle.rotation),
                            rotateTri(particle.width * Math.cos((2/3) * (2 * Math.PI)) + particle.x,
                                particle.height * Math.sin((2/3) * (2 * Math.PI)) + particle.y,
                                particle.x, particle.y, particle.rotation)];
                        ctx.beginPath();
                        ctx.moveTo(points[0][0], points[0][1]);
                        ctx.lineTo(points[1][0], points[1][1]);
                        ctx.lineTo(points[2][0], points[2][1]);
                        ctx.closePath();
                        ctx.fill();
                    }
                    particle.y += this.gravity * this.drawInterval;
                    if (particle.y > canvas.height + this.maxHeight){
                        below++;
                    }
                    particle.rotation += particle.spin
                    if (particle.rotation > 360){
                        particle.rotation -= 360;
                    } else if (particle.rotation < 0){
                        particle.rotation += 360;
                    }
                    particle.width += particle.xSpin;
                    if (particle.width > this.maxWidth || particle.width < 0){
                        particle.xSpin = -particle.xSpin;
                    }
                }
            }
            // console.log(Math.random()); // To check if it is running
            return below;
        }
    }
}

function rotate(x, y, angle){
    let radians = (Math.PI / 180) * angle
    let cos = Math.cos(radians),
        sin = Math.sin(radians);
    return [Math.round((cos * x) + (sin * y)), Math.round((cos * y) - (sin * x))];
}

function rotateTri(x, y, cx, cy, angle){
    let radians = (Math.PI / 180) * angle;
    let cos = Math.cos(radians),
        sin = Math.sin(radians);
    return [Math.round((cos * (x - cx)) - (sin * (y - cy)) + cx),
        Math.round((cos * (y - cy)) + (sin * (x - cx)) + cy)];
}

function startConfetti({particles = 1000, gravity = 250, maxIters = 500} = {}) {
    let confetti = new Confetti(particles, gravity, maxIters);
    let canvas = document.getElementById(confetti.canvasId);
    if (canvas == null){
        canvas = makeCanvas(confetti.canvasId);
    }
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;
    let ctx = canvas.getContext('2d');
    let iters = 0;
    let doDraw = setInterval(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let below = confetti.drawParticles(iters, ctx, canvas);
        iters++;
        console.log(iters);
        if (below >= confetti.particles.length) {
            clearInterval(doDraw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            document.getElementById(confetti.canvasId).remove();
        }
    }, confetti.drawInterval * 1000);
}

function makeCanvas(id) {
    document.getElementById("body").insertAdjacentHTML("afterbegin",
        `<canvas id="${id}" style="position:absolute;width:${document.body.offsetWidth}px;height:${document.body.offsetHeight}px;background-color:rgba(0,0,0,0);pointer-events:none;z-index:998;"></canvas>`
    );
    return document.getElementById(id);
}
