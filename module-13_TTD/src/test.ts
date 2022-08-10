import { expect } from 'chai';

// import {Game} from './index';

describe('Tests', () => {
    const playerIndex = 0;
    const playersNumber = 3;
    let game: Game;
    beforeEach(() => {
        game = new Game(playersNumber);
    });

    it('should create game within correct number of players', () => {
        expect(game.players.length).to.equal(playersNumber);
    });

    it('should return score', () => {
        const result = game.score(playerIndex);
        expect(result).to.equal(game.players[playerIndex]);
    });

    it('should increase 10 points', () => {
        const points = 10;
        game.players[playerIndex] = 299;
        game.isStarted = true;
        game.throw(points, 1, playerIndex);
        expect(game.players[playerIndex]).to.equal(289);
    });

    it('should increase 20 points within double', () => {
        game.isStarted = true;
        const points = 10;
        game.players[playerIndex] = 299;
        game.throw(points, 2, playerIndex);
        expect(game.players[playerIndex]).to.equal(279);
    });

    it('should increase 30 points within triple', () => {
        game.isStarted = true;
        const points = 10;
        game.players[playerIndex] = 299;
        game.throw(points, 3, playerIndex);
        expect(game.players[playerIndex]).to.equal(269);
    });

    it('should not increase if gama starts without double', () => {
        const points = 10;
        game.throw(points, 1, playerIndex);
        expect(game.players[playerIndex]).to.equal(301);
    });

    it('should not end game without double', () => {
        const points = 15;
        game.players[playerIndex] = 15;
        game.throw(points, 1, playerIndex);
        expect(game.players[playerIndex]).to.equal(15);
        expect(game.isFinished).to.be.false;
    });

    it('should not end game within extra points', () => {
        const points = 15;
        game.players[playerIndex] = 10;
        game.throw(points, 1, playerIndex);
        expect(game.players[playerIndex]).to.equal(10);
        expect(game.isFinished).to.be.false;
    });

    it('should end game within double', () => {
        const points = 10;
        game.players[playerIndex] = 20;
        game.throw(points, 2, playerIndex);
        expect(game.players[playerIndex]).to.equal(0);
        expect(game.isFinished).to.be.true;
    });
});