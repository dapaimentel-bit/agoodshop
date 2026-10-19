// Esta clase solo gestiona datos y cálculos; no accede al DOM.
export class Carrito {
  constructor(datos) {
    this.currency = datos.currency;
    this.productos = datos.products.map(p => {
      const precio = Number(p.price);
      if (!p.SKU || !Number.isFinite(precio) || precio < 0) {
        throw new Error('Datos de producto incorrectos.');
      }
      return { sku: p.SKU, title: p.title, precioCentimos: Math.round(precio * 100), quantity: 0 };
    });
  }

  actualizarUnidades(sku, unidades) {
    const producto = this.productos.find(p => p.sku === sku);
    if (!producto) throw new Error('El producto no existe.');
    if (!Number.isSafeInteger(unidades) || unidades < 0 || unidades > 999) {
      throw new Error('Introduce una cantidad entera entre 0 y 999.');
    }
    producto.quantity = unidades;
  }

  obtenerInformacionProducto(sku) {
    const p = this.productos.find(p => p.sku === sku);
    if (!p) throw new Error('El producto no existe.');
    return { sku: p.sku, title: p.title, price: p.precioCentimos / 100,
      quantity: p.quantity, subtotal: p.precioCentimos * p.quantity / 100 };
  }

  obtenerCarrito() {
    const seleccionados = this.productos.filter(p => p.quantity > 0);
    return {
      total: seleccionados.reduce((suma, p) => suma + p.precioCentimos * p.quantity, 0) / 100,
      currency: this.currency,
      products: seleccionados.map(p => this.obtenerInformacionProducto(p.sku))
    };
  }
}
