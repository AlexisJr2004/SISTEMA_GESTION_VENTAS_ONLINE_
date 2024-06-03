// Saldra siempre
function mostrarEsperaAutomatica() {
  document.addEventListener('DOMContentLoaded', function() {
    Swal.fire({
        title: 'Espera un momento...',
        text: 'Realizando la operación...',
        icon: 'info',
        showConfirmButton: false,
        timer: 1000 // tiempo en milisegundos (1 segundo)
    });
  });
}

function mostrarError(mensaje) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
    confirmButtonText: 'Aceptar'
  });
}

// ------------------ CREACION DE CLIENTES ------------------
async function validarFormulario(event) {
  event.preventDefault(); // Detiene el envío del formulario
  const dni = document.getElementById('dni').value;
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const valor = document.getElementById('valor').value;
  const numeroTarjeta = document.getElementById('numeroTarjeta').value;

  try {
    if (!Validaciones.esCedulaValida(dni)) {
      mostrarError('El formato del DNI es inválido. Por favor, inténtelo de nuevo.');
    } else if (await Validaciones.dniExistente(dni)) {
      mostrarError('El DNI ya está registrado. Por favor, inténtelo de nuevo.');
    } else if (!Validaciones.soloLetras(nombre) || !Validaciones.soloLetras(apellido)) {
      mostrarError('El formato del nombre o apellido es inválido. Por favor, inténtelo de nuevo.');
    } else {
      Swal.fire({
        title: '¡Cliente agregado!',
        text: 'El cliente se ha agregado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        window.location.reload(); // Después de aceptar el mensaje de éxito, recargar la página
        event.target.submit(); // Envía el formulario si todas las validaciones pasan
      });
    }
  } catch (error) {
    console.error('Error al validar el formulario:', error);
    mostrarError('Hubo un error al validar el formulario. Por favor, inténtelo de nuevo.');
  }
}

function confirmarEliminacion(clientId) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¡Una vez eliminado, no podrás recuperar este cliente!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Si el usuario confirma la eliminación, realiza la solicitud al servidor para eliminar el cliente
      fetch(`/clients/delete/${clientId}`, {
        method: 'GET'
      }).then(response => {
        // Verifica si la eliminación fue exitosa
        if (response.ok) {
          Swal.fire({ // Mensaje  de éxito
            title: 'Cliente eliminado',
            text: 'La eliminación del cliente se ha realizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then((result) => {
            if (result.isConfirmed) {
              location.reload(); // Recargar la página
            }
          });
        } else {
          // Si hubo un error al eliminar el cliente, muestra un mensaje de error
          mostrarError('Hubo un error al eliminar el cliente. Por favor, inténtalo de nuevo.');
        }
      }).catch(error => {
        // Si hubo un error en la solicitud, muestra un mensaje de error
        mostrarError('Hubo un error al eliminar el cliente. Por favor, inténtalo de nuevo.');
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Si el usuario cancela la eliminación, muestra el Sweet Alert de cancelación
      Swal.fire({
        title: 'Eliminación cancelada',
        text: 'La eliminación del cliente ha sido cancelada.',
        icon: 'info',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload(); // Recargar la página
        }
      });
    }
  });
}

function mostrarFormularioActualizacion(clientId) {
  // Realizar una solicitud GET al servidor para obtener los datos actuales del cliente
  fetch(`/clients/consult/${clientId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error al obtener los datos del cliente');
      }
    })
    .then(clientData => {
      // Extraer los datos del cliente
      const { nombre, apellido, imagen, valor, tipo, dni, tarjeta, numeroTarjeta } = clientData; // Se agrega 'dni', 'tarjeta' y 'numeroTarjeta' aquí
      // Mostrar el Sweet Alert con los datos actuales del cliente en los campos del formulario
      Swal.fire({
        title: 'Actualizar Cliente',
        html: `
      <div class="card card-body" style="overflow-x: hidden;">
        <label class="form-label">DNI:</label>
        <input id="dni" class="form-control mb-3" value="${dni}" disabled>
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">Nombre:</label>
            <input id="newNombre" class="form-control mb-3" placeholder="Nuevo Nombre" value="${nombre}">
          </div>
          <div class="col-md-6">
            <label class="form-label">Apellido:</label>
            <input id="newApellido" class="form-control mb-3" placeholder="Nuevo Apellido" value="${apellido}">
          </div>
        </div>
        <label class="form-label">Imagen:</label>
        <input id="newImagen" class="form-control mb-3" placeholder="Nueva Imagen" value="${imagen}">
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">Descuento:</label>
            <input id="newValor" class="form-control mb-3" placeholder="Nuevo Valor" value="${tarjeta === 'si' ? '0.10' : ''}" ${tarjeta === 'si' ? 'disabled' : ''}>
          </div>
          <div class="col-md-6">
            <label class="form-label">Tipo:</label>
            <select id="newTipo" class="form-select mb-3">
              <option value="Regular" ${tipo === 'Regular' ? 'selected' : ''}>Regular</option>
              <option value="VIP" ${tipo === 'VIP' ? 'selected' : ''}>VIP</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">Tarjeta:</label >
            <select id="newTarjeta" class="form-select mb-3">
              <option value="no" ${tarjeta === 'no' ? 'selected' : ''}>No</option>
              <option value="si" ${tarjeta === 'si' ? 'selected' : ''}>Sí</option>
            </select>
          </div>
          <div class="col-md-6" id="numeroTarjetaContainer" style="${tarjeta === 'si' ? 'display: block;' : 'display: none;'}">
            <label class="form-label">Número de tarjeta:</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-credit-card"></i></span>
              <input type="text" class="form-control" id="newNumeroTarjeta" maxlength="19">
            </div>
          </div>
        </div>
      </div>
      `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
          // Configurar el evento change para el campo "Tarjeta"
          document.getElementById('newTarjeta').addEventListener('change', function (e) {
            const tarjetaSeleccionada = e.target.value;
            const descuentoInput = document.getElementById('newValor');
            const numeroTarjetaContainer = document.getElementById('numeroTarjetaContainer');
            if (tarjetaSeleccionada === 'si') {
              descuentoInput.value = '0.10';
              numeroTarjetaContainer.style.display = 'block';
            } else {
              descuentoInput.value = '0';
              descuentoInput.removeAttribute('disabled'); // Habilitar el campo de descuento si se selecciona "No"
              numeroTarjetaContainer.style.display = 'none';
            }
          });
        
          // Configurar el evento input para el campo "Número de tarjeta"
          document.getElementById('newNumeroTarjeta').addEventListener('input', function (e) {
            var inputValue = e.target.value.replace(/\D/g, '').substring(0, 16); // Elimina cualquier caracter que no sea un dígito y limita la longitud a 16 dígitos
            var newValue = '';
            for (var i = 0; i < inputValue.length; i++) {
              if (i % 4 === 0 && i > 0) {
                newValue += '-'; // Agrega un espacio cada 4 dígitos para simular el formato de una tarjeta de crédito
              }
              newValue += inputValue[i];
            }
            e.target.value = newValue;
          });
        
          // Obtener el valor inicial del campo "Tarjeta" y actualizar la visibilidad del campo "Número de tarjeta" según corresponda
          const tarjetaSeleccionada = document.getElementById('newTarjeta').value;
          const numeroTarjetaContainer = document.getElementById('numeroTarjetaContainer');
          if (tarjetaSeleccionada === 'si') {
            numeroTarjetaContainer.style.display = 'block';
          } else {
            numeroTarjetaContainer.style.display = 'none';
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const dni = document.getElementById('dni').value;
          const newNombre = document.getElementById('newNombre').value;
          const newApellido = document.getElementById('newApellido').value;
          const newImagen = document.getElementById('newImagen').value;
          const newTipo = document.getElementById('newTipo').value;
          const newValor = document.getElementById('newValor').value;
          const newTarjeta = document.getElementById('newTarjeta').value;
          const newNumeroTarjeta = document.getElementById('newNumeroTarjeta').value;
          // Validar los nuevos datos
          if (!Validaciones.soloLetras(newNombre) || !Validaciones.soloLetras(newApellido)) {
            mostrarError('El formato del nombre o apellido es inválido. Por favor, inténtelo de nuevo.');
          } else {
            // Realizar la solicitud al servidor para actualizar el cliente
            fetch(`/clients/update/${clientId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                dni,
                nombre: newNombre,
                apellido: newApellido,
                imagen: newImagen,
                valor: newValor,
                tipo: newTipo,
                tarjeta: newTarjeta,
                numeroTarjeta: newNumeroTarjeta
              })
            }).then(response => {
              // Verificar si la actualización fue exitosa
              if (response.ok) {
                // Muestra el Sweet Alert de éxito
                Swal.fire({
                  title: '¡Cliente actualizado!',
                  text: 'El cliente se ha actualizado correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar'
                }).then(() => {
                  // Después de aceptar el mensaje de éxito, recargar la página
                  window.location.reload();
                });
              } else {
                // Si hubo un error al actualizar el cliente, muestra un mensaje de error
                mostrarError('Hubo un error al actualizar el cliente. Por favor, inténtalo de nuevo.');
              }
            }).catch(error => {
              // Si hubo un error en la solicitud, muestra un mensaje de error
              mostrarError('Hubo un error al actualizar el cliente. Por favor, inténtalo de nuevo.');
            });
          }
        };
      });
  });
};

// ------------------ CREACION DE PRODUCTOS ------------------
async function validarFormularioProductos(event) {
  event.preventDefault(); // Detiene el envío del formulario
  const id = document.getElementById('id').value;
  const precio = document.getElementById('precio').value;
  const stock = document.getElementById('stock').value;

  try {
    if (!Validaciones.soloDecimales(precio)) {
      mostrarError('El precio debe ser un número entero o decimal. Por favor, inténtelo de nuevo.');
    } else if (!Validaciones.soloNumeros(stock)) {
      mostrarError('La cantidad debe ser un número entero y positivo. Por favor, inténtelo de nuevo.');
    } else if (!Validaciones.soloNumeros(id)) {
      mostrarError('El ID debe ser un número entero y positivo. Por favor, inténtelo de nuevo.');
    } else {
      Swal.fire({
        title: 'Producto agregado!',
        text: 'El producto se ha agregado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        window.location.reload(); // Después de aceptar el mensaje de éxito, recargar la página
        event.target.submit(); // Envía el formulario si todas las validaciones pasan
      });
    }
  } catch (error) {
    console.error('Error al validar el formulario:', error);
    mostrarError('Hubo un error al validar el formulario. Por favor, inténtelo de nuevo.');
  }
}

function mostrarFormularioActualizacionProductos(productId) {
  // Realizar una solicitud GET al servidor para obtener los datos actuales del producto
  fetch(`/products/consult/${productId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error al obtener los datos del producto');
      }
    })
    .then(productData => {
      // Extraer los datos del producto
      const {id, descripcion, precio, stock, imagen } = productData;
      // Mostrar el Sweet Alert con los datos actuales del producto en los campos del formulario
      Swal.fire({
        title: 'Actualizar Producto',
        html: `
          <div class="card card-body" style="overflow-x: hidden;">
            <label class="form-label">ID:</label>
            <input id="dni" class="form-control mb-3" value="${id}" disabled>
            <div class="form-group">
              <label class="form-label">Descripción:</label>
              <input id="newDescripcion" class="form-control mb-3" placeholder="Nueva Descripción" value="${descripcion}">
            </div>
            <div class="form-group">
              <label class="form-label">Precio:</label>
              <input type="text" id="newPrecio" class="form-control mb-3" placeholder="Nuevo Precio" value="${precio}" required step="0.01">
            </div>
            <div class="form-group">
              <label class="form-label">Stock:</label>
              <input type="number" id="newStock" class="form-control mb-3" placeholder="Nuevo Stock" value="${stock}">
            </div>
            <div class="form-group">
              <label class="form-label">URL de la imagen:</label>
              <input id="newImagen" class="form-control mb-3" placeholder="Nueva Imagen" value="${imagen}">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const newDescripcion = document.getElementById('newDescripcion').value;
          const newPrecio = document.getElementById('newPrecio').value;
          const newStock = document.getElementById('newStock').value;
          const newImagen = document.getElementById('newImagen').value;

          // Validar los nuevos datos
          if (!Validaciones.soloDecimales(newPrecio)) {
            mostrarError('El precio debe ser un número entero o flotante. Por favor, inténtelo de nuevo.');
          } else if (!Validaciones.soloNumeros(newStock)) {
            mostrarError('La cantidad debe ser un número entero y positivo. Por favor, inténtelo de nuevo.');
          } else {
            // Realizar la solicitud al servidor para actualizar el producto
            fetch(`/products/update/${productId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: id,
                descripcion: newDescripcion,
                precio: newPrecio,
                stock: newStock,
                imagen: newImagen
              })
            }).then(response => {
              // Verificar si la actualización fue exitosa
              if (response.ok) {
                // Muestra el Sweet Alert de éxito
                Swal.fire({
                  title: '¡Producto actualizado!',
                  text: 'El producto se ha actualizado correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar'
                }).then(() => {
                  // Después de aceptar el mensaje de éxito, recargar la página
                  window.location.reload();
                });
              } else {
                // Si hubo un error al actualizar el producto, muestra un mensaje de error
                mostrarError('Hubo un error al actualizar el producto. Por favor, inténtalo de nuevo.');
              }
            }).catch(error => {
              // Si hubo un error en la solicitud, muestra un mensaje de error
              mostrarError('Hubo un error al actualizar el producto. Por favor, inténtalo de nuevo.');
            });
          }
        };
      });
  });
};

function confirmarEliminacionProducto(productId) {
  Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Una vez eliminado, no podrás recuperar este producto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
  }).then((result) => {
      if (result.isConfirmed) {
          // Realiza la solicitud al servidor para eliminar el producto
          fetch(`/products/delete/${productId}`, {
              method: 'GET'
          }).then(response => {
              // Verifica si la eliminación fue exitosa
              if (response.ok) {
                  Swal.fire({ // Mensaje de éxito
                      title: '¡Producto eliminado!',
                      text: 'La eliminación del producto se ha realizado correctamente.',
                      icon: 'success',
                      confirmButtonText: 'Aceptar'
                  }).then((result) => {
                      if (result.isConfirmed) {
                        window.location.href = '/products/consult';
                      }
                  });
              } else {
                  // Si hubo un error al eliminar el producto, muestra un mensaje de error
                  mostrarError('Hubo un error al eliminar el producto. Por favor, inténtalo de nuevo.');
              }
          }).catch(error => {
              // Si hubo un error en la solicitud, muestra un mensaje de error
              mostrarError('Hubo un error al eliminar el producto. Por favor, inténtalo de nuevo.');
          });
      }
  });
}

function mostrarInformacion(nombreCompleto) {
  // Realizar una solicitud GET al servidor para obtener la información de ventas del cliente
  fetch(`/clients/get_information_sales/${nombreCompleto}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('No se pudo obtener la información de ventas del cliente');
          }
          return response.json();
      })
      .then(data => {
          console.log('Información de ventas del cliente:', data);
          if (data.clientSales.length === 0) {
              Swal.fire({
                  title: 'Información de ventas',
                  text: 'El cliente no tiene compras',
                  icon: 'warning',
                  confirmButtonText: 'Aceptar'
              });
          } else {
              Swal.fire({
                  title: 'INFORMACIÓN ADICIONAL',
                  html: `
                      <p><strong>Total de facturas:</strong> <br>${data.totalFacturas}</p>
                      <p><strong>Suma total de facturas:</strong> <br>${data.sumaTotalFacturas}</p>
                      <p><strong>Factura más costosa:</strong> <br><strong>Factura:</strong> ${data.facturaMaxima.factura}<br><strong>Fecha:</strong> ${data.facturaMaxima.fecha} ${data.facturaMaxima.hora}<br><strong>Detalles:</strong><br> ${data.facturaMaxima.detalle.map(producto => `${producto.producto} - ${producto.cantidad} - ${producto.precio}`).join('<br>')}<br><strong>Total:</strong> ${data.facturaMaxima.total}</p>
                      <p><strong>Factura menos costosa:</strong> <br><strong>Factura:</strong> ${data.facturaMinima.factura}<br><strong>Fecha:</strong> ${data.facturaMinima.fecha} ${data.facturaMinima.hora}<br><strong>Detalles:</strong><br> ${data.facturaMinima.detalle.map(producto => `${producto.producto} - ${producto.cantidad} - ${producto.precio}`).join('<br>')}<br><strong>Total:</strong> ${data.facturaMinima.total}</p>
                  `,
                  confirmButtonText: 'Aceptar'
              });
          }
      })
      .catch(error => {
          // Manejar errores en caso de que la solicitud al servidor falle
          console.error('Error al obtener la información de ventas del cliente:', error);
          Swal.fire({
              title: 'Error',
              text: 'No se pudo obtener la información de ventas del cliente',
              icon: 'error',
              confirmButtonText: 'Aceptar'
          });
      });
}

// sweets_alerts.js
function confirmarEliminacionFactura() {
  $('.delete-button').click(function() {
    var factura = $(this).data('factura');
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la factura número ' + factura + '... No podrás recuperarla.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: '/sales/delete/' + factura,
          type: 'DELETE',
          success: function(response) {
            Swal.fire(
              '¡Eliminado!',
              'La factura ha sido eliminada correctamente.',
              'success'
            ).then(() => {
              location.reload();
            });
          },
          error: function(error) {
            Swal.fire(
              'Error',
              'Ocurrió un error al eliminar la factura.',
              'error'
            );
          }
        });
      }
    });
  });
}
