const { log } = require('console');
const {Router} = require('express');
const router = Router(); 
const fs = require('fs');
const path = require('path'); // Importa el módulo 'path' de Node.js
const rutaArchivo = path.join(__dirname, '..', 'json', 'clients.json');
const rutaArchivoProductos = path.join(__dirname, '..', 'json', 'products.json');
const rutaArchivoVentas= path.join(__dirname, '..', 'json', 'sales.json');

const uuid = require('uuid');

const json_clients = fs.readFileSync(rutaArchivo, 'utf-8')
let clients = JSON.parse(json_clients);


// RUTAS PRINCIPALES 
router.get('/', (req, res) => {
    res.render('index', {clients});
});

router.get('/gestion_clientes', (req, res) => {
    res.render('gestion_clientes', {clients});
});

router.get('/gestion_productos', (req, res) => {
    res.render('gestion_productos', {clients});
});

router.get('/gestion_ventas', (req, res) => {
    res.render('gestion_ventas', {clients});
});

router.get('/login', (req, res) => {
    res.render('login', {clients});
});

router.get('/exit', (req, res) => {
    res.render('exit', {clients});
});

// RUTAS DE MODULOS 
// ----------------MODULO DE CLIENTES----------------
router.get('/clients', (req, res) => {
  fs.readFile(rutaArchivo, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const clients = JSON.parse(data);
    res.json(clients);
  });
});

//---------------- CREAR CLIENTES ----------------
router.get('/clients/create', (req, res) => {
    res.render('clients/create_clients');
});

router.post('/clients/create', async (req, res) => {
    const { dni, nombre, apellido, imagen, tipo, valor, tarjeta, numeroTarjeta } = req.body;
    let valorFloat = parseFloat(valor);
    
    const tieneTarjeta = tarjeta === 'si'; // Convertir el valor de 'tarjeta' a booleano

    let newClient = {
        id: uuid.v4(),
        dni, 
        nombre, 
        apellido, 
        imagen,
        valor: valorFloat,
        tipo,
        tarjeta: tieneTarjeta, 
        numeroTarjeta,
    };
    
    clients.push(newClient);
    const json_clients = JSON.stringify(clients);
    fs.writeFileSync(rutaArchivo, json_clients, 'utf-8');
    res.redirect('/clients/create');
});

//---------------- ACTUALIZAR CLIENTES ----------------
router.get('/clients/update', (req, res) => {
    res.render('clients/update_clients', {clients});
});

router.post('/clients/update/:id', (req, res) => {
    const clientId = req.params.id;
    const {dni, nombre, apellido, imagen, valor, tipo, tarjeta, numeroTarjeta} = req.body;
    const valorFloat = parseFloat(valor);

    // Buscar el cliente por su ID en el array 'clients'
    const clientIndex = clients.findIndex(client => client.id === clientId);
    const tieneTarjeta = tarjeta === 'si';

    if (clientIndex !== -1) {
        // Actualizar los datos del cliente encontrado
        clients[clientIndex] = {
            id: clientId,
            dni, 
            nombre, 
            apellido, 
            imagen,
            valor: valorFloat,
            tipo,
            tarjeta: tieneTarjeta, // Agregar el campo 'tarjeta'
            numeroTarjeta // Agregar el campo 'numeroTarjeta'
        };

        // Actualizar el archivo JSON con los datos actualizados
        const json_clients = JSON.stringify(clients);
        fs.writeFileSync(rutaArchivo, json_clients, 'utf-8');

        // Responder con un mensaje de éxito
        res.status(200).json({ message: 'Cliente actualizado correctamente' });
    } else {
        // Si no se encuentra el cliente, responder con un error 404
        res.status(404).json({ error: 'Cliente no encontrado' });
    }
});

//---------------- CONSULTAR CLIENTES ----------------
router.get('/clients/consult', (req, res) => {
    res.render('clients/consult_clients', {clients});
});

router.get('/clients/consult/json', (req, res) => {
    res.json(clients);
});

router.get('/clients/consult/:id', (req, res) => {
    const clientId = req.params.id;

    // Buscar el cliente por su ID en el array 'clients'
    const client = clients.find(client => client.id === clientId);

    if (client) {
        // Si se encuentra el cliente, enviar sus datos como respuesta
        res.status(200).json(client);
    } else {
        // Si no se encuentra el cliente, responder con un error 404
        res.status(404).json({ error: 'Cliente no encontrado' });
    }
});

//---------------- CONSULTAR CLIENTES: MAS INFORMACION ----------------
router.get('/clients/get_information_sales/:clientId', (req, res) => {
    const clientId = req.params.clientId;

    // Leer los datos del archivo JSON de ventas
    const sales = JSON.parse(fs.readFileSync(rutaArchivoVentas, 'utf-8'));

    // Filtrar las ventas para obtener solo las ventas asociadas al cliente seleccionado
    const clientSales = sales.filter(sale => {
        // Comparar el nombre completo del cliente almacenado en el archivo sales.json con el clientId (nombre y apellido)
        return sale.cliente === clientId;
    });

    // Verificar si se encontraron ventas para el cliente seleccionado
    if (clientSales.length > 0) {
        // Calcular la suma total de facturas por cliente
        const sumaTotalFacturas = clientSales.reduce((total, sale) => total + sale.total, 0);

        // Encontrar la factura más costosa con sus datos
        const facturaMaxima = clientSales.reduce((max, sale) => sale.total > max.total ? sale : max, clientSales[0]);

        // Encontrar la factura menos costosa con sus datos
        const facturaMinima = clientSales.reduce((min, sale) => sale.total < min.total ? sale : min, clientSales[0]);

        // Responder con la información de ventas del cliente y los datos adicionales
        res.status(200).json({
            clientSales: clientSales,
            totalFacturas: clientSales.length,
            sumaTotalFacturas: sumaTotalFacturas,
            facturaMaxima: facturaMaxima,
            facturaMinima: facturaMinima
        });
    } else {
        // Si no se encontraron ventas, responder con un mensaje indicando que el cliente no tiene compras
        res.status(200).json({ message: 'El cliente no tiene compras' });
    }
});

//---------------- ELIMINAR CLIENTES ----------------
router.get('/clients/delete', (req, res) => {
    res.render('clients/delete_clients', {clients});
});

router.get('/clients/delete/:id', (req, res) => {
    // Filtra y elimina el cliente con el ID proporcionado de la lista de clientes
    clients = clients.filter(client => client.id !== req.params.id);

    // Guarda la lista actualizada de clientes en el archivo JSON
    const json_clients = JSON.stringify(clients);
    fs.writeFileSync(rutaArchivo, json_clients, 'utf-8');

    router.get('/clients/create', (req, res) => {
        res.render('clients/create_clients');
    });
    res.redirect('/');
});

//---------------- CREAR PRODUCTOS----------------
router.get('/products/create', (req, res) => {
    // Lee los productos del archivo JSON
    const json_products = fs.readFileSync(rutaArchivoProductos, 'utf-8');
    const products = JSON.parse(json_products);

    // Obtener el último ID y sumarle 1
    const lastProductId = products.length > 0 ? products[products.length - 1].id : 0;
    const newId = lastProductId + 1;

    // Renderizar la vista y pasar el nuevo ID y los productos como contexto
    res.render('products/create_products', { newId, products });
});

router.post('/products/create', async (req, res) => {
    let { id, descripcion, precio, stock, imagen } = req.body;
    // Convertir id a número entero
    id = parseInt(id);

    // Verifica si falta algún dato
    if (!id || !descripcion || !precio || !stock) {
        res.status(400).send('Faltan datos');
        return;
    }
    // Lee los productos del archivo JSON
    const json_products = fs.readFileSync(rutaArchivoProductos, 'utf-8');
    const products = JSON.parse(json_products);
    // Verificar si el producto ya existe por su descripción
    const existeProducto = products.some(producto => producto.descripcion === descripcion);
    if (existeProducto) {
        // Llamar a la función para mostrar el SweetAlert
        res.status(400).send('El producto ya existe');
        return;
    }
    // Genera un nuevo ID único
    const lastProductId = products.length > 0 ? products[products.length - 1].id : 0;
    const newId = lastProductId + 1;
    const newProduct = {
        id: newId,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen
    };
    products.push(newProduct);
    const json_updated_products = JSON.stringify(products);
    fs.writeFileSync(rutaArchivoProductos, json_updated_products, 'utf-8');
    res.redirect(`/products/create?id=${newId}`);
});

//---------------- ACTUALIZAR PRODUCTOS----------------
router.get('/products/update', (req, res) => {
    const products = JSON.parse(fs.readFileSync(rutaArchivoProductos, 'utf-8'));
    res.render('products/update_products', { products });
});

router.post('/products/update/:id', (req, res) => {
    const productId = req.params.id;
    const { descripcion, precio, stock, imagen } = req.body;

    // Leer los datos del archivo JSON
    let products = JSON.parse(fs.readFileSync(rutaArchivoProductos, 'utf-8'));

    // Buscar el producto por su ID en el array 'products'
    const productIndex = products.findIndex(product => product.id === parseInt(productId));

    if (productIndex !== -1) {
      // Actualizar los datos del producto encontrado
      products[productIndex] = {
        id: parseInt(productId),
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen
      };

      // Actualizar el archivo JSON con los datos actualizados
      const jsonProducts = JSON.stringify(products);
      fs.writeFileSync(rutaArchivoProductos, jsonProducts, 'utf-8');

      // Redirigir a la página de consulta de productos después de la actualización
      res.redirect('/products/update');
    } else {
      // Si no se encuentra el producto, responder con un error 404
      res.status(404).json({ error: 'Producto no encontrado' });
    }
});

router.get('/json/sales.json', (req, res) => {
    fs.readFile(rutaArchivoVentas, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }
      res.json(JSON.parse(data));
    });
  });
  
//---------------- CONSULTAR PRODUCTOS----------------
router.get('/products/consult', (req, res) => {
    // Leer el archivo JSON de productos
    const json_products = fs.readFileSync(rutaArchivoProductos, 'utf-8');
    const products = JSON.parse(json_products);

    // Calcular los productos más caros, más baratos, con menos stock y con más stock
    const mostExpensiveProduct = products.length > 0 ? products.reduce((max, product) => (product.precio > max.precio ? product : max), products[0]) : null;
    const cheapestProduct = products.length > 0 ? products.reduce((min, product) => (product.precio < min.precio ? product : min), products[0]) : null;
    const lowestStockProduct = products.length > 0 ? products.reduce((min, product) => (product.stock < min.stock ? product : min), products[0]) : null;
    const highestStockProduct = products.length > 0 ? products.reduce((max, product) => (product.stock > max.stock ? product : max), products[0]) : null;
    
    // Calcular la ganancia estimada total
    const totalProfit = products.reduce((total, product) => total + (product.precio * product.stock), 0);

    // Renderizar la plantilla 'consult_products' y pasarle las variables necesarias
    res.render('products/consult_products', {
        products,
        mostExpensiveProduct,
        cheapestProduct,
        lowestStockProduct,
        highestStockProduct,
        totalProfit
    });
});

router.get('/products/consult/:id', (req, res) => {
    const productId = req.params.id;

    // Leer los datos del archivo JSON
    const products = JSON.parse(fs.readFileSync(rutaArchivoProductos, 'utf-8'));

    // Buscar el producto por su ID
    const product = products.find(product => product.id === parseInt(productId));

    if (product) {
        // Si se encuentra el producto, responder con los datos del producto
        res.json(product);
    } else {
        // Si el producto no se encuentra, responder con un error 404
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

//---------------- ELIMINAR PRODUCTOS----------------
router.get('/products/delet', (req, res) => {
    // Leer el archivo JSON de productos
    const json_products = fs.readFileSync(rutaArchivoProductos, 'utf-8');
    const products = JSON.parse(json_products);

    // Renderizar la plantilla 'delete_products' y pasarle la variable 'products'
    res.render('products/delete_products', { products: products });
});

router.get('/products/delete/:id', (req, res) => {
    const idToDelete = parseInt(req.params.id);

    const json_products = fs.readFileSync(rutaArchivoProductos, 'utf-8');
    let products = JSON.parse(json_products);

    // Filtrar y eliminar el producto con el ID proporcionado de la lista de productos
    products = products.filter(product => parseInt(product.id) !== idToDelete);
    console.log('Productos después de la eliminación:', products); // Agregar esta línea para depurar

    // Guardar la lista actualizada de productos en el archivo JSON
    fs.writeFileSync(rutaArchivoProductos, JSON.stringify(products), 'utf-8');

    res.redirect('/products/delet');
});

//---------------- CREAR VENTAS----------------
router.get('/sales/create', (req, res) => {
    const numberOfRows = 1; // Definir el número de filas deseado
    res.render('sales/create_sale', { numberOfRows }); // Pasar numberOfRows a la plantilla
});

// Ruta para procesar la creación de una nueva venta
router.post('/sales/create', (req, res) => {
    const venta = req.body;

    // Leer el archivo sales.json existente o crear uno nuevo si no existe
    let ventas = [];
    try {
        const fileData = fs.readFileSync(rutaArchivoVentas, 'utf8');
        ventas = JSON.parse(fileData);
    } catch (err) {
        // El archivo no existe, no hay problema
    }

    // Agregar el nombre del cliente al objeto venta
    venta.cliente = req.body.cliente; // Esto asume que el nombre del cliente está presente en el cuerpo de la solicitud

    // Agregar la nueva venta al array de ventas
    ventas.push(venta);

    // Escribir el array de ventas actualizado en el archivo sales.json
    fs.writeFileSync(rutaArchivoVentas, JSON.stringify(ventas, null, 2));

    // Leer el archivo products.json para obtener los datos de los productos
    let productos = [];
    try {
        const fileData = fs.readFileSync(rutaArchivoProductos, 'utf8');
        productos = JSON.parse(fileData);
    } catch (err) {
        // El archivo no existe, no hay problema
    }

    // Actualizar el stock de los productos vendidos
    // Actualizar el stock de los productos vendidos
    venta.detalle.forEach(item => {
        const producto = productos.find(p => p.descripcion === item.producto); // Buscar el producto por su nombre
        if (producto) {
            producto.stock -= item.cantidad; // Actualizar el stock del producto
        }
    });
    // Escribir el array de productos actualizado en el archivo products.json
    fs.writeFileSync(rutaArchivoProductos, JSON.stringify(productos, null, 2));

    // Enviar una respuesta JSON indicando que la venta se ha registrado correctamente
    res.json({ success: true, message: 'Venta registrada correctamente' });
});

// Ruta para obtener el número de factura más alto
router.get('/sales/highestInvoiceNumber', (req, res) => {

    let ventas = [];
    try {
        const fileData = fs.readFileSync(rutaArchivoVentas, 'utf8');
        ventas = JSON.parse(fileData);
    } catch (err) {
        // El archivo no existe o está vacío, no hay problema
    }
    // Obtener el número de factura más alto
    const highestInvoiceNumber = ventas.reduce((max, venta) => Math.max(max, venta.factura), 0);
    res.json({ highestInvoiceNumber });
});

// Agrega esta ruta para obtener el descuento del cliente por su número de cédula
router.get('/clients/discount/:cedula', (req, res) => {
    const { cedula } = req.params;
    const clientsFilePath = path.join(__dirname, '..', 'json', 'clients.json');

    fs.readFile(clientsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de clientes:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        try {
            const clientes = JSON.parse(data);
            const clienteEncontrado = clientes.find(cliente => cliente.dni === cedula);
            if (clienteEncontrado) {
                // Si se encuentra el cliente, enviar el descuento y el nombre del cliente
                res.json({ descuento: clienteEncontrado.valor, cliente: `${clienteEncontrado.nombre} ${clienteEncontrado.apellido}` });
            } else {
                // Si no se encuentra el cliente, enviar un mensaje de error al cliente
                res.status(404).json({ error: 'Cliente no encontrado' });
            }
        } catch (error) {
            console.error('Error al analizar los datos del archivo de clientes:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

router.get('/json/products.json', (req, res) => {
  fs.readFile(rutaArchivoProductos, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Definir la función para cargar las ventas desde el archivo JSON
function cargarVentas() {
    try {
        const fileData = fs.readFileSync(rutaArchivoVentas, 'utf8');
        return JSON.parse(fileData);
    } catch (err) {
        console.error('Error al cargar los datos de ventas:', err);
        return []; // Si hay un error al cargar el archivo, devuelve un arreglo vacío
    }
}

// Cargar los datos de ventas en una variable global
let sales = cargarVentas();

//---------------- ACTUALIZAR VENTAS----------------
router.get('/sales/update', (req, res) => {
    res.render('sales/update_sales', { sales });
});

// Ruta para manejar la actualización de una venta específica
router.post('/sales/update/:factura', (req, res) => {
    const salesFactura = req.params.factura;
    const { fecha, hora, cliente, subtotal, descuento, iva, total, detalle } = req.body;

    // Leer los datos del archivo JSON de ventas
    let ventas = [];
    try {
        const fileData = fs.readFileSync(rutaArchivoVentas, 'utf8');
        ventas = JSON.parse(fileData);
    } catch (err) {
        // El archivo no existe o está vacío, no hay problema
    }

    // Buscar la venta por su número de factura en el array 'ventas'
    const ventaIndex = ventas.findIndex(venta => venta.factura === salesFactura);

    if (ventaIndex !== -1) {
        // Obtener la venta original antes de la actualización
        const ventaOriginal = ventas[ventaIndex];

        // Actualizar los datos de la venta encontrada
        ventas[ventaIndex] = {
            factura: salesFactura,
            fecha,
            hora,
            cliente,
            subtotal: parseFloat(subtotal),
            descuento: parseFloat(descuento),
            iva: parseFloat(iva),
            total: parseFloat(total),
            detalle: detalle // Asegúrate de que 'detalle' contenga el nuevo detalle de la venta
        };

        // Actualizar el archivo JSON con los datos actualizados de ventas
        const jsonVentas = JSON.stringify(ventas);
        fs.writeFileSync(rutaArchivoVentas, jsonVentas, 'utf-8');

        // Leer los datos del archivo JSON de productos
        let productos = [];
        try {
            const fileData = fs.readFileSync(rutaArchivoProductos, 'utf8');
            productos = JSON.parse(fileData);
        } catch (err) {
            // El archivo no existe o está vacío, no hay problema
        }

        // Iterar sobre los productos vendidos y ajustar su stock
        detalle.forEach(item => {
            const producto = productos.find(p => p.descripcion === item.producto); // Buscar el producto por su nombre
            if (producto) {
                // Obtener la cantidad original y la cantidad nueva
                const cantidadOriginal = ventaOriginal.detalle.find(d => d.producto === item.producto)?.cantidad || 0;
                const cantidadNueva = item.cantidad;
                
                // Calcular la diferencia entre la cantidad nueva y la cantidad original
                const diferencia = cantidadNueva - cantidadOriginal;

                // Restar la diferencia del stock del producto
                producto.stock -= diferencia;
            }
        });

        // Identificar los productos eliminados y restaurar su stock correspondiente
        ventaOriginal.detalle.forEach(itemOriginal => {
            const productoEliminado = detalle.find(itemNuevo => itemNuevo.producto === itemOriginal.producto);
            if (!productoEliminado) {
                const producto = productos.find(p => p.descripcion === itemOriginal.producto);
                if (producto) {
                    producto.stock += itemOriginal.cantidad; // Restaurar el stock del producto eliminado
                }
            }
        });

        // Escribir el array de productos actualizado en el archivo products.json
        fs.writeFileSync(rutaArchivoProductos, JSON.stringify(productos, null, 2));

        // Responder con un mensaje de éxito
        res.status(200).json({ message: 'Venta actualizada correctamente' });
    } else {
        // Si no se encuentra la venta, responder con un error 404
        res.status(404).json({ error: 'Venta no encontrada' });
    }
});


router.get('/sales/update_specific/:factura', (req, res) => {
    const numberOfRows = 1;
    const saleFactura = req.params.factura;
    const sale = sales.find(sale => sale.factura === saleFactura);
    if (!sale) {
        return res.status(404).send('Venta no encontrada'); // Si no se encuentra la venta, devolver un error o redirigir a una página de error
    }
    res.render('sales/update_sales_specific', { clients, sale, numberOfRows });
});

//---------------- CONSULTAR VENTAS----------------
router.get('/sales/consult', (req, res) => {
    // Leer el archivo JSON de productos
    const json_sales = fs.readFileSync(rutaArchivoVentas, 'utf-8');
    const sales = JSON.parse(json_sales);
    // Renderizar la plantilla 'consult_products' y pasarle la variable 'products'
    res.render('sales/consult_sales', { sales: sales });
});

router.get('/sales/consult/:factura', (req, res) => {
    const salesFactura = req.params.factura;

    // Leer los datos del archivo JSON
    const sales = JSON.parse(fs.readFileSync(rutaArchivoVentas, 'utf-8'));

    // Buscar el producto por su ID
    const sale = sales.find(sale => sale.factura === parseInt(salesFactura));

    if (sale) {
        // Si se encuentra el producto, responder con los datos del producto
        res.json(sale);
    } else {
        // Si el producto no se encuentra, responder con un error 404
        res.status(404).json({ error: 'factura no encontrada' });
    }
});

//----------------ELIMINAR VENTAS----------------
router.get('/sales/delete', (req, res) => {
    const json_sales = fs.readFileSync(rutaArchivoVentas, 'utf-8');
    const sales = JSON.parse(json_sales);
    res.render('sales/delete_sales', { sales });
});

// Ruta para manejar la eliminación de una venta específica
router.delete('/sales/delete/:factura', (req, res) => {
    const salesFactura = req.params.factura;
    // Leer los datos del archivo JSON
    const sales = JSON.parse(fs.readFileSync(rutaArchivoVentas, 'utf-8'));

    // Buscar el índice de la venta a eliminar
    const index = sales.findIndex(sale => sale.factura === salesFactura);

    if (index !== -1) {
        // Si se encuentra la venta, eliminarla del array
        sales.splice(index, 1);

        // Guardar los cambios en el archivo JSON
        fs.writeFileSync(rutaArchivoVentas, JSON.stringify(sales, null, 2));

        res.status(200).json({ message: 'Factura eliminada correctamente' });
    } else {
        res.status(404).json({ error: 'Factura no encontrada' });
    }
});

module.exports = router;