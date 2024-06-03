class UpdateSales {
  constructor() {
    // Resto de tu constructor
    this.buscarProductosComprados();
    this.fechaInput = document.getElementById('newFecha');
    this.horaInput = document.getElementById('newHora');
    this.actualizarFechaYHora();
    this.calcularSubtotal();
    this.calcularTotal();
    this.update = this.update.bind(this);
    setInterval(() => this.actualizarFechaYHora(), 1000);
    const cantidadInput = document.querySelector('input[name="cantidad"]');
    cantidadInput.addEventListener('input', (event) => this.validarCantidad(event));
  
    // Llama al método para buscar los productos comprados
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.configurarEventListeners();
      this.agregarProducto();
      // Llamar a buscarProductoPorId con el valor inicial del primer producto
      const idInput = document.querySelector('[name="id"]');
      if (idInput) {
        this.buscarProductoPorId(idInput);
      } else {
        console.error("El elemento con el nombre 'id' no se encontró en el DOM.");
      }
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

  buscarProductosComprados() {
    fetch('/json/sales.json')
      .then(response => response.json())
      .then(data => {
        const facturaActual = document.getElementById('factura').value;
        const venta = data.find(venta => venta.factura === facturaActual);
        if (venta) {
          // Llama al método agregarProducto() una sola vez y pasa la lista de productos comprados
          this.agregarProducto(venta.detalle);
        } else {
          console.error('No se encontraron productos para la factura actual');
        }
      })
      .catch(error => {
        console.error('Error al buscar productos:', error);
        // Manejar el error, por ejemplo, mostrar un mensaje al usuario
      });
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
 
  agregarProducto(productos) {
    const productInputs = document.getElementById('product-inputs'); // Limpiar los productos antes de agregar los nuevos
    productInputs.innerHTML = '';
    productos.forEach(producto => {
      const newRow = `
        <div class="row">
          <div class="col-md-3">
            <div class="mb-3">
              <label for="id" class="form-label">ID:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-barcode"></i></span>
                <input type="number" class="form-control" name="id" required onchange="updateSales.buscarProductoPorId(this)" ${producto && producto.id ? `value="${producto.id}"` : ''}>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="mb-3">
              <label for="producto" class="form-label">Producto:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-box"></i></span>
                <input type="text" class="form-control" name="producto" required readonly ${producto && producto.producto ? `value="${producto.producto}"` : ''}>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="mb-3">
              <label for="precio" class="form-label">Precio:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-money-check-dollar"></i></span>
                <input type="number" class="form-control" name="precio" readonly required placeholder="$" ${producto && producto.precio ? `value="${producto.precio}"` : ''} onchange="updateSales.calcularSubtotal()">
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="mb-3">
              <label for="stock" class="form-label">Stock:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-dolly"></i></span>
                <input type="number" class="form-control" name="stock" readonly value="${producto && producto.stock ? producto.stock : ''}">
              </div>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-md-3">
              <div class="mb-3">
                <label for="cantidad" class="form-label">Cantidad:</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fa-solid fa-people-carry-box"></i></span>
                  <input type="number" class="form-control" name="cantidad" required onchange="updateSales.calcularSubtotal()">
                </div>
              </div>
            </div>
          </div>
          <div class="col-mb-3 text-center"> <!-- Coloca aquí el tamaño que desees -->
            <button type="button" class="btn delete-button" onclick="updateSales.eliminarFila(this)">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div style="margin-top: 50px;">
          </div>
        </div>
      `;
      productInputs.insertAdjacentHTML('beforeend', newRow);
    })
    this.adjuntarEventos();
  }

  adjuntarEventos() {
    const cantidadInputs = document.querySelectorAll('input[name="cantidad"]');
    cantidadInputs.forEach(input => {
      input.addEventListener('input', (event) => this.validarCantidad(event));
    });
  }

  agregarFilaProducto() {
    const productInputs = document.getElementById('product-inputs');
    const newRow = `
      <div class="row">
        <div class="col-md-3">
          <div class="mb-3">
            <label for="id" class="form-label">ID:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-barcode"></i></span>
              <input type="number" class="form-control" name="id" required onchange="updateSales.buscarProductoPorId(this)">
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
              <input type="number" class="form-control" name="precio" readonly required placeholder="$" onchange="updateSales.calcularSubtotal()">
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="mb-3">
            <label for="stock" class="form-label">Stock:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-dolly"></i></span>
              <input type="number" class="form-control" name="stock" readonly>
            </div>
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-md-3">
            <div class="mb-3">
              <label for="cantidad" class="form-label">Cantidad:</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-people-carry-box"></i></span>
                <input type="number" class="form-control" name="cantidad" required onchange="updateSales.calcularSubtotal()">
              </div>
            </div>
          </div>
        </div>
        <div class="col-mb-3 text-center"> <!-- Coloca aquí el tamaño que desees -->
          <button type="button" class="btn delete-button" onclick="updateSales.eliminarFilaProducto(this)">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div style="margin-top: 50px;">
        </div>
      </div>
    `;
    productInputs.insertAdjacentHTML('beforeend', newRow);
    this.adjuntarEventos();
  }
  
  eliminarFilaProducto(button) {
    const row = button.closest('.row');
    row.remove();
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

  update(event) {
    // Recolectar la información de la venta
    const factura = document.getElementById('factura').value;
    const fecha = document.getElementById('newFecha').value;
    const hora = document.getElementById('newHora').value;
    const cliente = document.getElementById('newCliente').value;
    const subtotal = parseFloat(document.getElementById('subtotal').value);
    const descuento = parseFloat(document.getElementById('descuento').value);
    const iva = parseFloat(document.getElementById('iva').value);
    const total = parseFloat(document.getElementById('total').value);
    // Recolectar la información de los productos
    const productos = [];
    const productInputRows = document.querySelectorAll('#product-inputs .row');
    productInputRows.forEach((row) => {
      const productoInput = row.querySelector('input[name="producto"]');
      const precioInput = row.querySelector('input[name="precio"]');
      const cantidadInput = row.querySelector('input[name="cantidad"]');
      if (productoInput && precioInput && cantidadInput) {
        const producto = productoInput.value;
        const precio = parseFloat(precioInput.value);
        const cantidad = parseInt(cantidadInput.value);
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

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas actualizar esta venta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviar la venta actualizada al servidor
        fetch(`/sales/update/${factura}`, { // Usar la ruta adecuada para la actualización
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venta),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Venta actualizada:', data);
          })
          .catch((error) => {
            console.error('Error al actualizar la venta:', error);
          })
          .finally(() => {
            // Mostrar la alerta de éxito
            Swal.fire({
              icon: 'success',
              title: '¡Venta actualizada correctamente!',
              text: '¡La venta ha sido actualizada con éxito!',
            }).then(() => {
              // Recargar la página después de hacer clic en Aceptar en la alerta
              window.location.href = '/sales/update';
            });
          });
      }
    });
    // Evitar que se envíe el formulario por defecto
    event.preventDefault();
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
        document.getElementById('descuento').value = data.descuento;
        document.getElementById('descuento').setAttribute('readonly', 'true');
        const clienteInput = document.getElementById('newCliente');
        if (data.cliente) {
          clienteInput.value = data.cliente;
        } else {
          clienteInput.value = ''; // Limpiar el campo si el cliente está vacío
        }
      })
      .catch(error => {
        console.error('Error al buscar cliente:', error);
        // Mostrar un mensaje de error al usuario o realizar otra acción si no se encuentra el cliente
      });
  }

  eliminarFila(button) {
    const row = button.closest('.row');
    row.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const updateSales = new UpdateSales();
  updateSales.init();
});