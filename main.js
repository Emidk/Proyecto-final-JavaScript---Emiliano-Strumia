// Simulamos una API con localStorage
const API = {
    guardarPedido: async function (pedido) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                pedidos.push(pedido);
                localStorage.setItem('pedidos', JSON.stringify(pedidos));
                resolve();
            }, 1000);
        });
    },
    obtenerPedidos: async function () {
        return new Promise((resolve) => {
            setTimeout(() => {
                let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                resolve(pedidos);
            }, 1000);
        });
    }
};

function calcularCostoEnvio(valorCompra, distanciaKM) {
    if (valorCompra >= 1000) {
        return { costo: 0, detalles: "Envio gratis" };
    } else if (distanciaKM > 200) {
        return { costo: 100, detalles: "Costo de envio de $100 para distancias mayores a 200km" };
    } else {
        return { costo: 50, detalles: "Costo de envio de $50 para distancias de 200km" };
    }
}

function calcularDescuento(valor, metodoPago) {
    return metodoPago === "tarjeta" ? valor * 0.15 : 0;
}

function Pedido(numero, metodoPago) {
    this.numero = numero;
    this.metodoPago = metodoPago;
}

async function mostrarPedidos() {
    let pedidos = await API.obtenerPedidos();
    let contenedorPedidos = document.getElementById('lista-pedidos');
    contenedorPedidos.innerHTML = '';

    let totalEnvios = 0;
    let totalCompras = 0;

    pedidos.forEach((pedido, index) => {
        let elementoPedido = document.createElement('div');
        elementoPedido.className = 'pedido-box'; // Añadimos la clase para aplicar estilos
        elementoPedido.innerHTML = `
        <strong>Pedido ${index + 1}</strong><br>
        Distancia: ${pedido.distanciaKM}km<br>
        Valor: ${(pedido.valorCompra - pedido.descuento).toFixed(2)}$<br>
        Método de Pago: ${pedido.metodoPago}<br>
        Costo de envio: ${pedido.costoEnvio.toFixed(2)}$ (${pedido.detallesEnvio})
      `;
        contenedorPedidos.appendChild(elementoPedido);
        totalEnvios += pedido.costoEnvio;
        totalCompras += pedido.valorCompra - pedido.descuento;

    });
    document.getElementById('total-envios').textContent = totalEnvios.toFixed(2);
    document.getElementById('total-compras').textContent = totalCompras.toFixed(2);
    document.getElementById('total-general').textContent = (totalEnvios + totalCompras).toFixed(2);

}

document.addEventListener('DOMContentLoaded', mostrarPedidos);

document.getElementById('formulario-pedido').addEventListener('submit', async function (e) {
    e.preventDefault();

    let numero = JSON.parse(localStorage.getItem('pedidos')) ? JSON.parse(localStorage.getItem('pedidos')).length + 1 : 1;
    let metodoPago = document.getElementById('metodoPago').value;
    let distanciaKM = document.getElementById('distanciaKM').value;
    let valorCompra = document.getElementById('valorCompra').value;

    let pedido = new Pedido(numero, metodoPago);
    pedido.distanciaKM = parseInt(distanciaKM);
    pedido.valorCompra = parseFloat(valorCompra);
    pedido.descuento = calcularDescuento(pedido.valorCompra, pedido.metodoPago);
    const { costo, detalles } = calcularCostoEnvio(pedido.valorCompra, pedido.distanciaKM);
    pedido.costoEnvio = costo;
    pedido.detallesEnvio = detalles;

    let mensajeCargando = document.createElement('div');
    mensajeCargando.textContent = "Cargando...";
    document.getElementById('form-section').appendChild(mensajeCargando);

    await API.guardarPedido(pedido);
    mostrarPedidos();

    mensajeCargando.remove();
});
