import * as bootstrap from 'bootstrap';

let idSearch

window.onload = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const idDelete = urlParams.get('delete')
    idSearch = urlParams.get('edit')
    if(urlParams.has('delete')) deletePOST(idDelete)
    if(urlParams.has('edit')) searchAlumno(idSearch)
}

document
    .getElementById('saveBtn')
    ?.addEventListener('click', () => {
        saveAlumno() 
})

document
    .getElementById('updateBtn')
    ?.addEventListener('click', () => {
        updateAlumno()
    })

document
    .getElementById('searchBtn')
    ?.addEventListener('click', () => {
        searchAlumno()
    })

const table = document.getElementById('tableResult')

document.getElementById('closeModal')?.addEventListener('click', () => {
    modal.hide();
    document.querySelector(".qr-code").innerHTML = "";
})

document.getElementById('closeEditModal')?.addEventListener('click', () => {
    modal.hide();
    document.querySelector(".qr-code").innerHTML = "";
    window.location.replace('./maintance.html')
})

document.getElementById('crossModal').addEventListener('click', () => {
    modal.hide();
    document.querySelector(".qr-code").innerHTML = "";
})

const modal = new bootstrap.Modal(document.getElementById('successModal'))

const API_URL = 'https://api.guerrero-mx.com/api-create.php'
const QR_URL = 'http://esefina-ingresos-2023.guerrero-mx.com/Tenencia/ModuloExterno'
let shorturl = ''

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
    const body = { clase: clase.value.trim(), placa: placa.value.trim(),
    modelo: modelo.value.trim(), precioFactura: precioFactura.value.trim(),
    noCilindros: noCilindros.value.trim(), procedencia: procedencia.value.trim(), 
    descripcion: descripcion.value.trim(), noSerie: noSerie.value.trim() };
    fetchPOST(body)    
}

async function updateAlumno() {
    let status = false;
    const body = {
        id: idSearch,
        clase: clase.value.trim(),
        placa: placa.value.trim(),
        modelo: modelo.value.trim(),
        precioFactura: precioFactura.value.trim(),
        noCilindros: noCilindros.value.trim(),
        procedencia: procedencia.value.trim(),
        descripcion: descripcion.value.trim(),
        noSerie: noSerie.value.trim()
    }
    await fetch('https://api.guerrero-mx.com/api-update.php', {
        method: 'PUT',
        body: JSON.stringify(body)
    }).then(res => res.json()).then(r => {
        status = r.status
        alert('Usuario actualizado con éxito')
    }).catch(error => console.error(error))
    if (status) {
        fetchShortUrl()
        modal.show()
        clearInputs()
    } else {
        alert('Hubo un error. Intenta nuevamente o comunicate con el administrador')
    }
}

async function searchAlumno(id) {
    const body = id !== undefined ? { id } : { placa: placa.value, noSerie: noSerie.value }
    if(id === undefined) {
        searchPOST(body, true)
    } else {
        searchPOST(body, false)
    }
}

async function fetchShortUrl() {
    const largeurl = `${QR_URL}?placa=${placa.value}&serie=${noSerie.value}`
    const URL = `https://guerrero-mx.com/yourls-api.php?` + new URLSearchParams({
        signature: 'caed1384a5',
        action: 'shorturl',
        format: 'json',
        url: largeurl
    })
    await fetch(URL, { 
        method: 'POST',
    })
    .then(response => response.json()).then(r => {
        shorturl = r.shorturl
    })
    generate()   
}

async function searchPOST(body = '', flag = false) {
    await fetch("https://api.guerrero-mx.com/api-search.php", {
        method: 'POST',
        body: JSON.stringify(body)
    }).then(res => res.json()).then(r => {
        if (!flag) {
            const user = r[0]
            clase.value = user.clase
            placa.value = user.placa
            modelo.value = user.modelo
            precioFactura.value = user.precioFactura
            noCilindros.value = user.noCilindros
            procedencia.value = user.procedencia
            descripcion.value = user.descripcion
            noSerie.value = user.noSerie
            return 
        }
        table.innerHTML = `<thead>
        <tr>
          <th scope="col">No Serie</th>
          <th scope="col">Placa</th>
          <th scope="col">Descripción</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${r.status === undefined ? r.map(user => `
            <tr>
                <td>${user.noSerie}</td>
                <td>${user.placa}</td>
                <td>${user.descripcion}</td>
                <td>
                    <button class='btn btn-primary btn-sm' onclick="window.location.replace('./edit.html?edit=${user.id}')">Editar</button>
                    <button class='btn btn-danger btn-sm' onclick="window.location.replace('./maintance.html?delete=${user.id}')">Eliminar</button>
                </td>
            </tr>
        `) : '<tr><td>Sin resultados</td></tr>'}
      </tbody>`
    })
}

async function deletePOST(id) {
    const canContinue = confirm('¿Estás seguro de querer eliminar este registro?')
    if(!canContinue) return window.location.replace('./maintance.html') 
    //let status = false
    const body = { id }
    await fetch("https://api.guerrero-mx.com/api-delete.php", {
        method: 'DELETE',
        body: JSON.stringify(body) 
    }).then(res => res.json()).then(r => {
        window.location.replace('./maintance.html')
    }).catch(error => console.error(error))
}

async function fetchPOST(body = '') {
    let status = false
    await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(body)
    }).then(res => res.json()).then(r => status = r.status)
    .catch(error => console.error(error))
    if (status) {
        fetchShortUrl()
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
        text: `${shorturl}`,
        width: 90, //128
        height: 90,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
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