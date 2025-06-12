// sparkles.js

const sparkleContainer = document.getElementById('sparkles');

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');

    // Randomly choose circle or star
    if (Math.random() > 0.7) {
        sparkle.classList.add('star');
    }

    // Random horizontal start position
    sparkle.style.left = Math.random() * window.innerWidth + 'px';

    // Random animation duration and delay for natural effect
    const duration = 4000 + Math.random() * 3000; // 4-7 seconds
    const delay = Math.random() * 5000; // up to 5 seconds delay

    sparkle.style.animationDuration = `${duration}ms, ${duration}ms`;
    sparkle.style.animationDelay = `${delay}ms, ${delay}ms`;


    sparkleContainer.appendChild(sparkle);

    // Remove sparkle after animation ends
    sparkle.addEventListener('animationend', () => {
        sparkle.remove();
    });
}

// Continuously create sparkles every 300ms
setInterval(createSparkle, 300);
