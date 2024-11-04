import {getSocket} from "../sockets/socket.js";

const DURATION = 500;
const NUMBER_CARD = 8;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.deck = [];
        this.playerHand = [];
        this.computerHand = [];
        this.tableCards = [];
        this.currentPlayer = 'player';
        this.isInteracting = true;
        this.suits = ['S', 'H', 'D', 'C'];
        this.ranks = [ '7', '8', '9', 'J', 'Q', 'K', 'A'];

        this.socket = null;
    }

    preload() {
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                const cardKey = `${rank}${suit}`;
                const cardUrl = `https://deckofcardsapi.com/static/img/${cardKey}.png`;
                this.load.image(cardKey, cardUrl);
            }
        }
        this.load.image('back', 'https://deckofcardsapi.com/static/img/back.png');
    }

    create() {

        this.socket = getSocket();
        this.createDeck();
        this.dealCards();
        this.currentPlayer = 'player';
        this.displayPlayerHand();
        this.displayComputerHand();

        //TODO with connection get cards info
        //TODO sort logic cards
        //TODO winner

    }

    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.deck.push(`${rank}${suit}`);
            }
        }
        Phaser.Utils.Array.Shuffle(this.deck);
    }

    dealCards() {
        for (let i = 0; i < NUMBER_CARD; i++) {
            this.playerHand.push(this.deck.pop());
            this.computerHand.push(this.deck.pop());
        }
    }

    displayPlayerHand() {
        this.playerHand.forEach((cardKey, index) => {
            const playerCardImage = this.add.image(150 + (index * 100), 500, cardKey).setScale(0.5);
            playerCardImage.originalY = playerCardImage.y;
            playerCardImage.setInteractive();
            this.setupCardInteractions(playerCardImage, cardKey);
        });
    }

    displayComputerHand() {

        this.computerHand.forEach((cardKey, i) => {
            const existingCard = this.children.getByName(`computer_back_${cardKey}`);

            if (!existingCard) {
                const computerCardImage = this.add.image(150 + (i * 100), 100, 'back').setScale(0.5);
                computerCardImage.cardKey = cardKey;
                computerCardImage.setName(`computer_back_${cardKey}`);
                computerCardImage.setInteractive();
                this.setupCardInteractions(computerCardImage, cardKey);
            }
        });
    }


    setupCardInteractions(card, cardKey) {
        card.on('pointerover', () => {
            if (this.isInteracting) {
                this.hoverCard(card);
            }
        });

        card.on('pointerout', () => {
            if (this.isInteracting) {
                this.resetCard(card);
            }
        });

        card.on('pointerdown', () => {
            if (this.currentPlayer === 'player' && this.isInteracting) {
                this.isInteracting = false;
                this.placeCard(card, cardKey, 'player');
            }
        });
    }
    hoverCard(card) {
        if (card) {
            this.tweens.add({
                targets: card,
                scaleX: 0.6,
                scaleY: 0.6,
                y: card.originalY - 30,
                duration: 200,
                ease: 'Power2'
            });
        }
    }

    resetCard(card) {
        if (card) {
            this.tweens.add({
                targets: card,
                scaleX: 0.5,
                scaleY: 0.5,
                y: card.originalY,
                duration: 200,
                ease: 'Power2'
            });
        }
    }


    placeCard(card, cardKey, playerType) {
        this.tweens.add({
            targets: card,
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            scaleX: 0.7,
            scaleY: 0.7,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                this.tableCards.push({ cardKey, playerType });

                this.socket.emit('playCard', {
                    gameId: 1,
                    cardKey,
                    playerId: 1,
                    playerType
                });

                if (playerType === 'player') {
                     this.currentPlayer = 'computer';
                } else {
                     this.currentPlayer = 'player';
                }

                this.nextTurn(playerType);
            }
        });
    }

    nextTurn(playerType) {

        if (this.playerHand.length > 0 && this.computerHand.length > 0) {
            if (playerType === 'player') {
                this.time.delayedCall(DURATION, () => this.computerTurn(), [], this);
            } else {
                this.time.delayedCall(DURATION, () => {
                    this.clearTable();
                    this.isInteracting = true;
                }, [], this);
            }
        } else {
            this.endGame();
        }
    }

    clearTable() {
        const tableCardImages = this.children.getAll().filter(child =>
            this.tableCards.some(tc => tc.cardKey === child.texture.key)
        );

        tableCardImages.forEach(cardImage => {
            this.tweens.add({
                targets: cardImage,
                alpha: 0,
                duration: DURATION,
                onComplete: () => {
                    cardImage.destroy();
                }
            });
        });

        this.children.each(child => {
            if (child.texture && child.texture.key === 'back' && this.tableCards.some(tc => tc.cardKey === child.cardKey)) {
                child.destroy();
            }
        });

        this.tableCards = [];
    }

    computerTurn() {
        if (this.computerHand.length > 0) {
            const computerCardKey = this.computerHand.shift();

            const computerCardImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, computerCardKey).setScale(0.5);

            this.placeCard(computerCardImage, computerCardKey, 'computer');


        }
    }


    endGame() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Over', { fontSize: '40px', fill: '#ff0000' }).setOrigin(0.5);
    }
}

export default GameScene;
