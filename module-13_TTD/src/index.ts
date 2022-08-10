const START_VALUE = 301;

export class Game {
    constructor(playersNumber: number) {
        this.players = new Array(playersNumber);
        this.players.fill(START_VALUE, 0);
    }

    isStarted: boolean = false;
    isFinished: boolean = false;
    players: number[];

    throw(sectorNumber, multiplier, playerIndex): void {
        if(this.isFinished) {
            throw new Error('The game is finished');
        }

        if(!this.isStarted && multiplier !== 2) {
            return;
        }

        sectorNumber = this.checkEye(sectorNumber);
        const result = this.players[playerIndex] - (sectorNumber * multiplier)
        if(result === 0 && multiplier === 2) {
            this.players[playerIndex] = result;
            this.isFinished = true;
            return;
        }

        if(result < 2 && result !== 0) {
            return;
        }

        this.players[playerIndex] = result;
    }

    score(playerIndex: number): number {
        return this.players[playerIndex];
    }

    private checkEye(number: number): number {
        return number === 0 ? 25 : number;
    }
}
