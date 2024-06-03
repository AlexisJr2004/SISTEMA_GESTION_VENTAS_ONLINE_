class Product {
  static next = 0;

  constructor(id=0, descrip="Ninguno", preci=0, stock=0) {
    Product.next += 1;
    this.__id = id;
    this.descrip = descrip;
    this.preci = preci;
    this.__stock = stock;
  }

  get id() {
    return this.__id;
  }

  get stock() {
    return this.__stock;
  }

  toString() {
    return `Producto: ${this.__id} ${this.descrip} ${this.preci} ${this.stock}`;
  }

  getJson() {
    return {"id": this.__id, "descripcion": this.descrip, "precio": this.preci, "stock": this.stock};
  }

  show() {
    console.log(`${this.__id} ${this.descrip.padEnd(20)} ${this.preci} ${this.stock}`);
  }
}
