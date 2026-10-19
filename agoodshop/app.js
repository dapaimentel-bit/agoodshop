import { Carrito } from './carrito.js';

// Recurso JSON servido por HTTP. Se puede sustituir por una URL de JSONBlob.
const API_URL = 'https://jsonblob.com/api/jsonBlob/01a1534b-fda6-757e-b456-4f917fc31565';
const listado = document.querySelector('#productos');
const resumen = document.querySelector('#resumen');
const estado = document.querySelector('#estado');
const reintentar = document.querySelector('#reintentar');
let carrito;
const subtotales = new Map();

function dinero(valor) {
  return `${valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${carrito.currency}`;
}

function actualizarResumen() {
  const datos = carrito.obtenerCarrito();
  resumen.replaceChildren();
  if (!datos.products.length) {
    const item = document.createElement('li');
    item.textContent = 'Todavía no has seleccionado productos.';
    resumen.append(item);
  }
  for (const p of datos.products) {
    const item = document.createElement('li');
    item.textContent = `${p.title} × ${p.quantity}: ${dinero(p.subtotal)}`;
    resumen.append(item);
  }
  document.querySelector('#total').textContent = dinero(datos.total);
}

function mostrarProductos(datos) {
  listado.replaceChildren();
  subtotales.clear();
  for (const p of datos.products) {
    const fila = document.createElement('tr');
    const descripcion = document.createElement('td');
    const titulo = document.createElement('strong');
    titulo.textContent = p.title;
    const codigo = document.createElement('small');
    codigo.textContent = `SKU: ${p.SKU}`;
    descripcion.append(titulo, codigo);
    const cantidad = document.createElement('td');
    const controles = document.createElement('div');
    controles.className = 'controles';
    const menos = document.createElement('button');
    menos.type = 'button';
    menos.textContent = '−';
    menos.setAttribute('aria-label', `Restar una unidad de ${p.title}`);
    const entrada = document.createElement('input');
    entrada.type = 'number';
    entrada.min = '0';
    entrada.max = '999';
    entrada.step = '1';
    entrada.value = '0';
    entrada.setAttribute('aria-label', `Cantidad de ${p.title}`);
    const mas = document.createElement('button');
    mas.type = 'button';
    mas.textContent = '+';
    mas.setAttribute('aria-label', `Añadir una unidad de ${p.title}`);
    const precio = document.createElement('td');
    precio.textContent = dinero(carrito.obtenerInformacionProducto(p.SKU).price);
    const subtotal = document.createElement('td');
    subtotal.textContent = dinero(0);
    subtotales.set(p.SKU, subtotal);

    function cambiar(unidades) {
      try {
        carrito.actualizarUnidades(p.SKU, unidades);
        entrada.value = unidades;
        menos.disabled = unidades === 0;
        mas.disabled = unidades === 999;
        subtotales.get(p.SKU).textContent = dinero(carrito.obtenerInformacionProducto(p.SKU).subtotal);
        estado.textContent = '';
        actualizarResumen();
      } catch (error) {
        entrada.value = carrito.obtenerInformacionProducto(p.SKU).quantity;
        estado.textContent = error.message;
      }
    }
    menos.disabled = true;
    menos.addEventListener('click', () => cambiar(carrito.obtenerInformacionProducto(p.SKU).quantity - 1));
    mas.addEventListener('click', () => cambiar(carrito.obtenerInformacionProducto(p.SKU).quantity + 1));
    entrada.addEventListener('change', () => cambiar(entrada.value.trim() === '' ? NaN : Number(entrada.value)));
    controles.append(menos, entrada, mas);
    cantidad.append(controles);
    fila.append(descripcion, cantidad, precio, subtotal);
    listado.append(fila);
  }
  actualizarResumen();
}

async function cargarProductos() {
  estado.textContent = 'Cargando productos…';
  reintentar.hidden = true;
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    if (!Array.isArray(datos.products) || typeof datos.currency !== 'string') {
      throw new Error('Formato de respuesta incorrecto.');
    }
    carrito = new Carrito(datos);
    mostrarProductos(datos);
    estado.textContent = datos.products.length ? '' : 'No hay productos disponibles.';
  } catch (error) {
    estado.textContent = 'No se pudieron cargar los productos. Comprueba la conexión y abre el proyecto con un servidor local.';
    reintentar.hidden = false;
    console.error(error);
  }
}
reintentar.addEventListener('click', cargarProductos);
cargarProductos();
