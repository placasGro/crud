import * as bootstrap from 'bootstrap';

document
.getElementById('saveBtn')
.addEventListener('click', () => {
    saveAlumno() 
})

document.getElementById('closeModal').addEventListener('click', () => {
    modal.hide();
    document.querySelector(".qr-code").innerHTML = "";
})

document.getElementById('crossModal').addEventListener('click', () => {
    modal.hide();
    document.querySelector(".qr-code").innerHTML = "";
})

const modal = new bootstrap.Modal(document.getElementById('successModal'))

const API_URL = 'https://api.guerrero-mx.com/api-create.php'
const QR_URL = 'https://esefina-ingresos-2023.guerrero-mx.com/Tenencia/ModuloExterno'

const clase = document.getElementById('clase')
const placa = document.getElementById('placa')
const modelo = document.getElementById('modelo')
const precioFactura = document.getElementById('precioFactura')
const noCilindros = document.getElementById('noCilindros')
const procedencia = document.getElementById('procedencia')
const descripcion = document.getElementById('descripcion')
const noSerie = document.getElementById('noSerie')

async function saveAlumno() {
    if (!validate()) return alert('Todos los campos son obligatorios.'); 
    const body = { clase: clase.value, placa: placa.value,
    modelo: modelo.value, precioFactura: precioFactura.value,
    noCilindros: noCilindros.value, procedencia: procedencia.value, 
    descripcion: descripcion.value, noSerie: noSerie.value };
    console.log(JSON.stringify(body));
    fetchPOST(body)
    
}

async function fetchPOST(body = '') {
    let status = false
    await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(body)
    }).then(res => res.json()).then(r => status = r.status)
    .catch(error => console.error(error))
    if (status) {
        console.log(modal);
        generate()   
        modal.show()
        clearInputs()
    } else {
        alert('Hubo un error. Intenta nuevamente o comunicate con el administrador')
    }
}

function validate() {
    if (clase.value !== '' && placa.value !== '' &&
    modelo.value !== '', precioFactura.value !== '' &&
    noCilindros.value !== '' && procedencia.value !== '' &&
    procedencia.value !== '' && descripcion.value !== '' &&
    noSerie.value !== '') {
        return true;
    } else {
        return false;
    }
}

function clearInputs() {
    const inputs = [...document.querySelectorAll('input[type=text]')]
    inputs.map(e => e.value = '')
}

function generate(){
    let qrcode = ''
    document.querySelector(".qr-code").style = "";

    qrcode = new QRCode(document.querySelector(".qr-code"), {
        text: `${QR_URL}?placa=${placa.value} &serie=${noSerie.value}`,
        width: 180, //128
        height: 180,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    console.log(qrcode);

    let download = document.createElement("button");
    document.querySelector(".qr-code").appendChild(download);

    let download_link = document.createElement("a");
    download_link.setAttribute("download", "qr_code_linq.png");
    download_link.innerText = "Download";

    download.appendChild(download_link);

    if(document.querySelector(".qr-code img").getAttribute("src") == null){
        setTimeout(() => {
            download_link.setAttribute("href", `${document.querySelector("canvas").toDataURL()}`);
        }, 300);
    } else {
        setTimeout(() => {
            download_link.setAttribute("href", `${document.querySelector(".qr-code img").getAttribute("src")}`);
        }, 300);
    }
}