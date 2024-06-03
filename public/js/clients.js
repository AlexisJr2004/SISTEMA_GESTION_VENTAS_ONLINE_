class Client {
  constructor(first_name="Consumidor", last_name="Final", dni="9999999999", client_type="regular") {
    this.first_name = first_name;
    this.last_name = last_name;
    this.__dni = dni;
    this.client_type = client_type;
  }

  get dni() {
    return this.__dni;
  }

  set dni(value) {
    if (value.length === 10 || value.length === 13) {
      this.__dni = value;
    } else {
      this.__dni = "9999999999";
    }
  }

  toString() {
    return `Cliente: ${this.first_name} ${this.last_name}`;
  }

  fullName() {
    return this.first_name + ' ' + this.last_name;
  }

  returnDni() {
    return this.__dni;
  }
}

class RegularClient extends Client {
  constructor(first_name="Cliente", last_name="Final", dni="9999999999", card=false) {
    super(first_name, last_name, dni);
    this.__discount = card ? 0.10 : 0;
  }

  get discount() {
    return this.__discount;
  }

  toString() {
    return `Cliente: ${this.first_name} ${this.last_name} Descuento: ${this.discount}`;
  }

  show() {
    console.log(`Cliente Minorista: DNI: ${this.dni} Nombre: ${this.first_name} ${this.last_name} Descuento: ${this.discount * 100}%`);
  }

  getJson() {
    return {"dni": this.dni, "nombre": this.first_name, "apellido": this.last_name, "valor": this.discount};
  }
}

class VipClient extends Client {
  constructor(first_name="Consumidor", last_name="Final", dni="9999999999", card=false) {
    super(first_name, last_name, dni);
    this.__limit = 10000;
    this.__discount = card ? 0.10 : 0;
  }

  get discount() {
    return this.__discount;
  }

  get limit() {
    return this.__limit;
  }

  set limit(value) {
    this.__limit = (value < 10000 || value > 20000) ? 10000 : value;
  }

  toString() {
    return `Cliente: ${this.first_name} ${this.last_name} Cupo: ${this.limit}`;
  }

  show() {
    console.log(`Cliente Vip: DNI: ${this.dni} Nombre: ${this.first_name} ${this.last_name} Cupo: ${this.limit}`);
  }

  getJson() {
    return {"dni": this.dni, "nombre": this.first_name, "apellido": this.last_name, "valor": this.limit};
  }
}
