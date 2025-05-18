const container = document.querySelector(".container");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const waveToggle = document.getElementById("waveToggle");

// Configurações
const settings = {
	particleSpeed: 3,
	particleCount: 100,
	waveAmplitude: 3,
	waveFrequency: 0.05,
};

// Estado do experimento
let particles = [];
let animationId;
let isWaveMode = false;
let particleInterval;

// Posições das fendas (em pixels)
const slitTopPosition = container.offsetHeight * 0.35;
const slitBottomPosition = container.offsetHeight * 0.65;
const slitHeight = 30;

function createParticle() {
	const particle = document.createElement("div");
	particle.className = "particle";

	// Posição inicial com pequena variação
	const startY = container.offsetHeight / 2 + (Math.random() * 40 - 20);
	particle.style.top = `${startY}px`;

	container.appendChild(particle);

	// Escolhe aleatoriamente qual fenda a partícula vai passar
	const slitChoice = Math.random() > 0.5 ? "top" : "bottom";
	const targetY =
		slitChoice === "top"
			? slitTopPosition + (Math.random() * slitHeight - slitHeight / 2)
			: slitBottomPosition + (Math.random() * slitHeight - slitHeight / 2);

	particles.push({
		element: particle,
		x: 60,
		y: startY,
		vx: settings.particleSpeed,
		vy: 0,
		passedSlit: false,
		slitChoice: slitChoice,
		targetY: targetY,
		// Para modo onda
		wavePhase: Math.random() * Math.PI * 2,
	});
}

function updateParticles() {
	// biome-ignore lint/complexity/noForEach: <explanation>
	particles.forEach((p) => {
		// Antes da barreira
		if (p.x < 200) {
			// Ajusta gradualmente a trajetória para a fenda alvo
			const direction = p.targetY - p.y;
			p.vy = direction * 0.02;

			p.x += p.vx;
			p.y += p.vy;
		}
		// Na barreira (fendas)
		else if (p.x >= 200 && p.x < 220) {
			const slitCenter =
				p.slitChoice === "top" ? slitTopPosition : slitBottomPosition;
			const slitTop = slitCenter - slitHeight / 2;
			const slitBottom = slitCenter + slitHeight / 2;

			// Verifica se a partícula está dentro da fenda
			if (p.y >= slitTop && p.y <= slitBottom) {
				p.x += p.vx;
				p.passedSlit = true;

				// No modo onda, muda o comportamento após passar pela fenda
				if (isWaveMode) {
					p.vy = 0; // Reseta a velocidade vertical
				}
			} else {
				// Remove partículas que não passaram pela fenda
				p.element.remove();
				return;
			}
		}
		// Após a barreira
		else if (p.passedSlit) {
			p.x += p.vx;

			// Comportamento diferente para modo onda/partícula
			if (isWaveMode) {
				// Movimento ondulatório (interferência)
				const waveEffect =
					Math.sin((p.x - 220) * settings.waveFrequency + p.wavePhase) *
					settings.waveAmplitude;
				p.y += waveEffect;
			} else {
				// Pequena variação aleatória no modo partícula
				p.y += (Math.random() - 0.5) * 0.3;
			}

			// Registra a posição na tela
			if (p.x >= 500 && p.x < 800) {
				createDot(p.x, p.y);
			}

			// Remove partículas que saíram da tela
			if (p.x >= 800 || p.y < 0 || p.y > container.offsetHeight) {
				p.element.remove();
				return;
			}
		}

		// Atualiza posição do elemento
		p.element.style.left = `${p.x}px`;
		p.element.style.top = `${p.y}px`;
	});

	// Filtra partículas ativas
	particles = particles.filter(
		(p) =>
			// biome-ignore lint/complexity/useOptionalChain: <explanation>
			p.element &&
			p.element.parentNode &&
			p.x < 800 &&
			p.y > 0 &&
			p.y < container.offsetHeight,
	);

	// Continua a animação
	animationId = requestAnimationFrame(updateParticles);
}

function createDot(x, y) {
	const dot = document.createElement("div");
	dot.className = "dot";
	dot.style.left = `${x}px`;
	dot.style.top = `${y}px`;
	container.appendChild(dot);
}

function startExperiment() {
	stopExperiment();

	// Limpa os pontos antigos
	const dots = document.querySelectorAll(".dot");
	// biome-ignore lint/complexity/noForEach: <explanation>
	dots.forEach((dot) => dot.remove());

	// Inicia o lançamento de partículas
	particleInterval = setInterval(() => {
		if (particles.length < settings.particleCount) {
			createParticle();
		}
	}, 50);

	// Inicia a animação
	updateParticles();
}

function stopExperiment() {
	cancelAnimationFrame(animationId);
	if (particleInterval) clearInterval(particleInterval);
	// biome-ignore lint/complexity/noForEach: <explanation>
	particles.forEach((p) => {
		// biome-ignore lint/complexity/useOptionalChain: <explanation>
		if (p.element && p.element.parentNode) {
			p.element.remove();
		}
	});
	particles = [];
}

function resetExperiment() {
	stopExperiment();
	const dots = document.querySelectorAll(".dot");
	// biome-ignore lint/complexity/noForEach: <explanation>
	dots.forEach((dot) => dot.remove());
}

// Event listeners
startBtn.addEventListener("click", startExperiment);
resetBtn.addEventListener("click", resetExperiment);

waveToggle.addEventListener("change", (e) => {
	isWaveMode = e.target.checked;
	if (isWaveMode) {
		waveToggle.parentElement.style.backgroundColor = "#d4edda";
	} else {
		waveToggle.parentElement.style.backgroundColor = "#e7e7e7";
	}
});
