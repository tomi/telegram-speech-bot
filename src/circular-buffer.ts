export default class CircularBuffer {
  private _buffer: any[];

  constructor(private _maxSize: number) {
    this._buffer = new Array();
  }

  get size() {
    return this._buffer.length;
  }

  get(start: number, end: number) {
    return this._buffer.slice(start, end);
  }

  push(item: any) {
    this._buffer.unshift(item);

    if (this.size > this._maxSize) {
      this._buffer.pop();
    }
  }

  findIndex(cb: any) {
    return this._buffer.findIndex(cb);
  }
}
