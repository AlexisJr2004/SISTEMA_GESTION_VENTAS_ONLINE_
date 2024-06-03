class Sale {
  constructor() {
    // El resto de tu constructor aquí
    this.fechaInput = document.getElementById('fecha');
    this.horaInput = document.getElementById('hora');
    this.actualizarFechaYHora(); // Llamar a la función inicialmente para establecer la fecha y hora al cargar la página
    this.calcularSubtotal();
    this.calcularTotal();
    this.obtenerNumeroFactura();
    setInterval(() => this.actualizarFechaYHora(), 1000); // Actualizar la fecha y hora cada segundo
    const cantidadInput = document.querySelector('input[name="cantidad"]');
    cantidadInput.addEventListener('input', (event) => this.validarCantidad(event));

  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.configurarEventListeners();
    });
  }

  configurarEventListeners() {
    const idInput = document.getElementById('id');
    if (idInput) {
      idInput.addEventListener('input', () => this.verificarId());
    } else {
      console.error("El elemento con el ID 'id' no se encontró en el DOM.");
    }
  }

  buscarProductoPorId(input) {
    const id = input.value;
    const row = input.closest('.row');
    fetch('/json/products.json')
      .then(response => response.json())
      .then(data => {
        const productoEncontrado = data.find(producto => producto.id === parseInt(id));
        if (productoEncontrado) {
          row.querySelector('[name="producto"]').value = productoEncontrado.descripcion;
          row.querySelector('[name="precio"]').value = productoEncontrado.precio;
          row.querySelector('[name="stock"]').value = productoEncontrado.stock;
        } else {
          row.querySelector('[name="producto"]').value = '';
          row.querySelector('[name="precio"]').value = '';
          row.querySelector('[name="stock"]').value = '';
          Swal.fire({
            icon: 'error',
            title: 'Producto no encontrado',
            text: 'El producto no se encuentra registrado en la base de datos.',
          });
          input.value = '';
        }
      })
      .catch(error => console.error('Error al buscar producto:', error));
  }

  verificarId() {
    const id = document.getElementById('id').value;
    if (id) {
      this.buscarProductoPorId({ value: id }); // Llama al método buscarProductoPorId de esta clase con el valor del ID
    } else {
      document.getElementById('producto').value = '';
      document.getElementById('precio').value = '';
    }
  }

  actualizarFechaYHora() {
    const fechaActual = new Date().toISOString().slice(0, 10); // Obtener la fecha actual en formato YYYY-MM-DD
    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Obtener la hora actual en formato HH:MM

    // Asignar los valores obtenidos a los elementos de fecha y hora
    this.fechaInput.value = fechaActual;
    this.horaInput.value = horaActual;
  }

  agregarProducto() {
    const productInputs = document.getElementById('product-inputs');
    const newRow = `
      <div class="row">
        <div class="col-md-3">
          <div class="mb-3">
            <label for="id" class="form-label">ID:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-barcode"></i></span>
              <input type="number" class="form-control" name="id" required onchange="sale.buscarProductoPorId(this)">
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="mb-3">
            <label for="producto" class="form-label">Producto:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-box"></i></span>
              <input type="text" class="form-control" name="producto" required readonly>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="mb-3">
            <label for="precio" class="form-label">Precio:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-money-check-dollar"></i></span>
              <input type="number" class="form-control" name="precio" readonly required>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="mb-3">
            <label for="stock" class="form-label">Stock:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-dolly"></i></span>
              <input type="number" class="form-control" id="stock" name="stock" readonly>
            </div>
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-md-3">
            <div class="mb-3">
              <label for="cantidad" class="form-label">Cantidad:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-people-carry-box"></i></span>
                <input type="number" class="form-control" name="cantidad" required onchange="sale.calcularSubtotal()">
              </div>
            </div>
          </div>
          </div>
          <div class="col-mb-3 text-center"> <!-- Coloca aquí el tamaño que desees -->
            <button type="button" class="btn delete-button" onclick="sale.eliminarFila(this)">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div style="margin-top: 50px;">
          </div>
        </div>
      </div>
    `;
    productInputs.insertAdjacentHTML('beforeend', newRow);
    this.adjuntarEventos();
  }

  adjuntarEventos() {
    const cantidadInputs = document.querySelectorAll('input[name="cantidad"]');
    cantidadInputs.forEach(input => {
      input.addEventListener('input', (event) => this.validarCantidad(event));
    });
  }

  calcularSubtotal() {
    const precioInputs = document.querySelectorAll('input[name="precio"]');
    const cantidadInputs = document.querySelectorAll('input[name="cantidad"]');
    let subtotal = 0;
    precioInputs.forEach((precioInput, index) => {
      const precio = parseFloat(precioInput.value || 0);
      const cantidad = parseInt(cantidadInputs[index].value || 0);
      subtotal += precio * cantidad;
    });
    // Mostrar el subtotal en su campo correspondiente
    document.getElementById('subtotal').value = subtotal;
    // Recalcular el total con el descuento aplicado
    this.calcularTotal();
  }

  calcularTotal() {
    const subtotal = parseFloat(document.getElementById('subtotal').value || 0);
    const descuento = parseFloat(document.getElementById('descuento').value || 0);
    const iva = parseFloat(document.getElementById('iva').value || 0);

    // Calcular el total según la fórmula dada
    const total = Math.round((subtotal + iva - descuento) * 100) / 100;

    // Mostrar el total en su campo correspondiente
    document.getElementById('total').value = total.toFixed(2);
  }

  obtenerNumeroFactura() {
    fetch('/sales/highestInvoiceNumber')
      .then(response => response.json())
      .then(data => {
        const highestInvoiceNumber = data.highestInvoiceNumber;
        const nextInvoiceNumber = highestInvoiceNumber + 1;
        document.getElementById('factura').value = nextInvoiceNumber;
      })
      .catch(error => console.error('Error al obtener el número de factura:', error));
  }

  create(event) {
    console.log("Comenzando proceso de creación de venta...");
  
    // Recolectar la información de la venta
    const factura = document.getElementById('factura').value;
    console.log("Factura:", factura);
    const fecha = document.getElementById('fecha').value;
    console.log("Fecha:", fecha);
    const hora = document.getElementById('hora').value;
    console.log("Hora:", hora);
    const cliente = document.getElementById('cliente').value;
    console.log("Cliente:", cliente);
    const subtotal = parseFloat(document.getElementById('subtotal').value);
    console.log("Subtotal:", subtotal);
    const descuento = parseFloat(document.getElementById('descuento').value);
    console.log("Descuento:", descuento);
    const iva = parseFloat(document.getElementById('iva').value);
    console.log("IVA:", iva);
    const total = parseFloat(document.getElementById('total').value);
    console.log("Total:", total);
  
    // Recolectar la información de los productos
    const productos = [];
    const productInputRows = document.querySelectorAll('#product-inputs .row');
    productInputRows.forEach((row) => {
      const productoInput = row.querySelector('input[name="producto"]');
      const precioInput = row.querySelector('input[name="precio"]');
      const cantidadInput = row.querySelector('input[name="cantidad"]');
      
      // Verificar si los elementos existen antes de acceder a sus valores
      if (productoInput && precioInput && cantidadInput) {
        const producto = productoInput.value;
        console.log("Producto:", producto);
        const precio = parseFloat(precioInput.value);
        console.log("Precio:", precio);
        const cantidad = parseInt(cantidadInput.value);
        console.log("Cantidad:", cantidad);
        productos.push({ producto, precio, cantidad });
      }
    });
  
    // Crear objeto de venta
    const venta = {
      factura,
      fecha,
      hora,
      cliente,
      subtotal,
      descuento,
      iva,
      total,
      detalle: productos
    };
  
    console.log("Venta a guardar:", venta);

    // Mostrar la ventana de confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Su venta se registrará exitosamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviar la venta al servidor
        fetch('/sales/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venta),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Venta registrada:', data);
          })
          .catch((error) => {
            console.error('Error al registrar la venta:', error);
          })
          .finally(() => {
            // Mostrar la alerta de éxito
            Swal.fire({
              icon: 'success',
              title: '¡Venta registrada correctamente!',
              text: '¡Su venta se ha registrado con éxito!',
            }).then(() => {
              // Recargar la página después de hacer clic en Aceptar en la alerta
              location.reload();
            });
          });
      }
    });
  }
  
  verificarCedula() {
    const cedula = document.getElementById('ci').value;
    if (cedula) {
      this.buscarClientePorCedula(cedula); // Llama al método para buscar el cliente
    } else {
      document.getElementById('cliente').value = '';
      document.getElementById('descuento').value = ''; // Limpiar el campo de descuento si la cédula está vacía
    }
  }

  buscarClientePorCedula(cedula) {
    fetch(`/clients/discount/${cedula}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Cliente no encontrado');
        }
        return response.json();
      })
      .then(data => {
        // Manejar la respuesta exitosa aquí
        document.getElementById('descuento').value = data.descuento;
        document.getElementById('descuento').setAttribute('readonly', 'true');
        document.getElementById('cliente').value = data.cliente; // Asignar el nombre y apellido del cliente
      })
      .catch(error => {
        // Manejar el error aquí
        console.error('Error al buscar cliente:', error);
        // Mostrar un mensaje de error al usuario o realizar otra acción si no se encuentra el cliente
        // Por ejemplo:
        document.getElementById('descuento').value = ''; // Limpiar el campo de descuento
        document.getElementById('descuento').removeAttribute('readonly');
        document.getElementById('cliente').value = ''; // Limpiar el campo de cliente
      });
    }
    
  validarCantidad(event) {
    const input = event.target;
    if (!Validaciones.soloNumeros(input.value)) {
      input.value = input.value.replace(/[^\d]/g, '');
    }
    const cantidad = parseInt(input.value);
    const stockDisponible = parseInt(document.querySelector('input[name="stock"]').value);

    if (cantidad > stockDisponible) {
      Swal.fire({
        icon: 'error',
        title: '¡Cantidad excedida!',
        text: 'Por favor, ingrese una cantidad menor o igual al stock disponible.',
      });
      input.value = '';
    }
  }  

  eliminarFila(button) {
    const row = button.closest('.row');
    row.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sale = new Sale();
  sale.init();
});