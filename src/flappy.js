function newElement(tagName, className) {
    const element = document.createElement(tagName);
    element.className = className;

    return element;
}

function ScoreBoard() {

    this.HTMLElement = newElement('div', 'score');

    this.updateScore = score => this.HTMLElement.innerHTML = score;

    this.updateScore(0);

}

function Bird() {

    let isFlying = false;

    this.HTMLElement = newElement('img', 'bird');

    this.getSource = () => parseInt(this.HTMLElement.src.split('bird')[1].split('.png')[0]);
    this.setSource = number => this.HTMLElement.src = `./imgs/bird${number}.png`;

    this.getAltitude = () => parseFloat(this.HTMLElement.style.bottom.split('%')[0]);
    this.setAltitude = altitude => this.HTMLElement.style.bottom = `${altitude}%`;

    const flying = () => isFlying = true;
    const falling = () => isFlying = false;

    this.resetEvents = () => {

        window.onmousedown = () => flying();
        window.onmouseup = () => falling();
    
        window.onkeydown = () => flying();
        window.onkeyup = () => falling();
    
        window.ontouchstart = () => flying();
        window.ontouchend = () => falling();
    }

    this.fly = () => {

        let y = this.getAltitude();
        let src = this.getSource();

        y += isFlying ? 1 : -0.6;
        src = isFlying ? 
            (src === 0 ? 2 : 0) : 1;

        this.setAltitude(y);
        this.setSource(src);
    }

    this.resetEvents();
    this.setSource(1);
    this.setAltitude(50);

}

function Barrier(reverse = false) {

    this.HTMLElement = newElement('div', 'barrier');

    const pipe = newElement('div', 'pipe');
    this.HTMLElement.appendChild(pipe);

    const border = newElement('div', 'border');
    this.HTMLElement.appendChild(border);

    this.HTMLElement.style.flexDirection = reverse ? 'column-reverse' : 'column';

    this.setHeight = height => this.HTMLElement.style.height = `${height}%`;

}

function BarrierPair(initPosition) {

    this.HTMLElement = newElement('div', 'barrier-pair');

    this.crossedMiddle = false;

    this.top = new Barrier();
    this.HTMLElement.appendChild(this.top.HTMLElement);

    this.bottom = new Barrier(true);
    this.HTMLElement.appendChild(this.bottom.HTMLElement);

    this.sortOpening = () => {

        const minOpening = 25;
        const maxOpening = 40;
        const minHeight = 10;

        const opening = Math.random() * (maxOpening - minOpening) + minOpening;

        const maxHeight = 100 - (2 * minHeight + opening);
        const heightTop = Math.random() * (maxHeight - minHeight) + minHeight;
        const heightBottom = 100 - opening - heightTop;

        this.top.setHeight(heightTop);
        this.bottom.setHeight(heightBottom);
    }

    this.getPosition = () => parseFloat(this.HTMLElement.style.right.split('%')[0]);
    this.setPosition = position => this.HTMLElement.style.right = `${position}%`;

    this.move = displacement => this.setPosition(this.getPosition() + displacement);

    this.sortOpening();
    this.setPosition(initPosition);

}

function Obstacles(addScore) {

    this.displacement = 1;

    this.pairs = [
        new BarrierPair(-25),
        new BarrierPair(-100)
    ];

    this.animation = () => {
        this.pairs.forEach(pair => {

            const position = pair.getPosition();
            pair.move(this.displacement);

            if (position >= 100) {
                pair.setPosition(-50);
                pair.sortOpening();
                pair.crossedMiddle = false;
            }

            const crossedMiddle = position >= 50 &&
                position < 50 + this.displacement;

            if (crossedMiddle && !pair.crossedMiddle) {
                addScore();
                pair.crossedMiddle = true;
            }
        });
    };

}

function checkOverlappingElements(elem1, elem2) {

    const e1 = elem1.getBoundingClientRect();
    const e2 = elem2.getBoundingClientRect();

    const horizontal = e1.right >= e2.left
        && e1.left <= e2.right;

    const vertical = e1.top <= e2.bottom
        && e1.bottom >= e2.top;

    return horizontal && vertical;
}

function checkCollision(bird, barriers) {

    let collisionHappened = false;

    barriers.forEach(pair => {

        if (!collisionHappened) {

            const birdElem = bird.HTMLElement;
            const topBarrier = pair.top.HTMLElement;
            const bottomBarrier = pair.bottom.HTMLElement;

            collisionHappened = checkOverlappingElements(birdElem, topBarrier)
                || checkOverlappingElements(birdElem, bottomBarrier);
        }

    });

    return collisionHappened;
}

function resetEventFunctions(clear = true, callBackFunc) {

    if (clear) {
        window.onclick = () => {};
        window.onkeydown = () => {};
        window.ontouchstart = () => {};
    } else {
        window.onclick = callBackFunc;
        window.onkeydown = callBackFunc;
        window.ontouchstart = callBackFunc;
    }

}

function FlappyGame() {

    let loop;
    let score = 0;

    const gameScene = document.querySelector('[flappy-game]');

    const scoreBoard = new ScoreBoard();
    gameScene.appendChild(scoreBoard.HTMLElement);

    const bird = new Bird();
    gameScene.appendChild(bird.HTMLElement);

    const obstacles = new Obstacles(() => {

        scoreBoard.updateScore(++score);
        if (score % 10 === 0 && score > 0) obstacles.displacement += 0.2;

    });

    obstacles.pairs.forEach(pair => gameScene.appendChild(pair.HTMLElement));

    this.start = () => {

        resetEventFunctions();
        bird.resetEvents();

        loop = setInterval(() => {

            bird.fly();

            obstacles.animation();

            if (checkCollision(bird, obstacles.pairs)) this.finish();

        }, 20);

    }

    this.startWithDelay = (miliseconds = 3000) => {

        setTimeout(() => this.start(), miliseconds);
    }

    this.stop = () => clearInterval(loop);

    this.finish = () => {

        this.stop();

        const userResponse = confirm('GAME OVER! \n\nRestart game?');

        if (userResponse) {
            window.location.reload();
        } else {
            const message = () => {
                alert('GAME OVER! \n\nReload page to restart (F5).');
                resetEventFunctions();
            }
            resetEventFunctions(false, message);
        }     
    }

}

const newGame = new FlappyGame();
// newGame.startWithDelay();
resetEventFunctions(false, newGame.start);