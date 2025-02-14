export namespace perlin {
    export type Vector = {x: number, y: number};

    export class CacheGrid<T> {

        constructor(private _generator: (x: number, y: number) => T) {
            this._data = new Map();
        }

        public get(x: number, y: number): T {
            let row = this._data.get(y);
            if (row === undefined) {
                row = new Map();
                this._data.set(y, row);
            }
            let value = row.get(x);
            if (value === undefined) {
                value = this._generator(x, y);
                row.set(x, value);
            }
            return value;
        }

        private _data: Map<number, Map<number, T>>;
    }
}

export class Perlin {

    constructor() {
        this._gradients = new perlin.CacheGrid((_x, _y) => {
            let t = 2 * Math.PI * Math.random();
            return {x: Math.cos(t), y: Math.sin(t)};
        });
        this._memory = new perlin.CacheGrid((x, y) => {
            let xf = Math.floor(x);
            let yf = Math.floor(y);
            let tl = this._productGrid(x, y, xf, yf);
            let tr = this._productGrid(x, y, xf + 1, yf);
            let bl = this._productGrid(x, y, xf, yf + 1);
            let br = this._productGrid(x, y, xf + 1, yf + 1);
            let xt = this._interpolate(x - xf, tl, tr);
            let xb = this._interpolate(x - xf, bl, br);
            return this._interpolate(y - yf, xt, xb);
        });
    }

    public get(x: number, y: number): number {
        return this._memory.get(x, y);
    }

    private _gradients: perlin.CacheGrid<perlin.Vector>;
    private _memory: perlin.CacheGrid<number>;

    private _interpolate(x: number, a: number, b: number): number {
        return a + (b - a) * this._smooth(x);
    }

    private _productGrid(x: number, y: number, vx: number, vy: number): number {
        let offset: perlin.Vector = {x: x - vx, y: y - vy};
        let gradient = this._gradients.get(vx, vy);
        return offset.x * gradient.x + offset.y * gradient.y;
    }

    private _smooth(x: number): number {
        return x ** 2 * (3 - 2 * x);
    }
}
