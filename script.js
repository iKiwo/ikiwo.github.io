// Cargar addons desde el archivo addonlist.json
async function loadAddons() {
    const response = await fetch('https://raw.githubusercontent.com/iKiwo/ikieo.github.io/main/addonlist.json');
    const addonlist = await response.json();
    const addonsList = document.getElementById('addons-list');

    addonsList.innerHTML = ''; // Limpiar la lista antes de cargar

    for (const repoUrl of addonlist) {
        const repoInfo = await getRepoInfo(repoUrl);
        const addonElement = document.createElement('div');
        addonElement.className = 'addon';
        addonElement.innerHTML = `
            <h2>${repoInfo.name}</h2>
            <p>${repoInfo.description}</p>
            <img src="${repoInfo.image}" alt="${repoInfo.name}" style="width:100%;">
            <a href="${repoInfo.download}" target="_blank">Descargar</a>
        `;
        addonsList.appendChild(addonElement);
    }
}

// Obtener información del repositorio de GitHub
async function getRepoInfo(repoUrl) {
    const [owner, repo] = repoUrl.split('/').slice(-2);
    const repoData = await fetch(`https://api.github.com/repos/${owner}/${repo}`).then(res => res.json());
    const releases = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`).then(res => res.json());

    return {
        name: repoData.name,
        description: repoData.description,
        image: `https://raw.githubusercontent.com/${owner}/${repo}/master/images/icon.png`, // Ajusta la ruta de la imagen según tu repositorio
        download: releases[0].assets[0].browser_download_url
    };
}

// Buscar addons
document.getElementById('search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const addons = document.querySelectorAll('.addon');
    
    addons.forEach(addon => {
        const title = addon.querySelector('h2').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            addon.style.display = 'block';
        } else {
            addon.style.display = 'none';
        }
    });
});

// Ventana modal para publicar addons
const modal = document.getElementById('modal');
const addAddonBtn = document.getElementById('add-addon');
const closeBtn = document.querySelector('.close');

addAddonBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Formulario para publicar addons
document.getElementById('addon-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const repoUrl = document.getElementById('repo-url').value;

    try {
        // Validar el repositorio
        const [owner, repo] = repoUrl.split('/').slice(-2);
        const repoData = await fetch(`https://api.github.com/repos/${owner}/${repo}`).then(res => res.json());
        const releases = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`).then(res => res.json());

        if (!repoData || !releases.length) {
            throw new Error('El repositorio no tiene releases válidas.');
        }

        // Enviar la URL del repositorio para actualizar addonlist.json
        await updateAddonList(repoUrl);
        alert('Addon publicado correctamente.');
        modal.style.display = 'none';
        loadAddons(); // Recargar la lista de addons
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Actualizar addonlist.json usando GitHub API
async function updateAddonList(repoUrl) {
    const token = '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'; // Reemplaza con tu token
    const owner = 'iKiwo'; // Reemplaza con tu usuario
    const repo = 'ikiwo.guthub.io'; // Reemplaza con tu repositorio

    // Obtener el contenido actual de addonlist.json
    const addonlistUrl = `https://api.github.com/repos/${owner}/${repo}/contents/docs/addonlist.json`;
    const addonlistResponse = await fetch(addonlistUrl, {
        headers: { 'Authorization': `token ${token}` }
    });
    const addonlistData = await addonlistResponse.json();
    const currentContent = JSON.parse(atob(addonlistData.content));

    // Agregar el nuevo repositorio
    if (!currentContent.includes(repoUrl)) {
        currentContent.push(repoUrl);
    }

    // Actualizar el archivo addonlist.json
    const updatedContent = JSON.stringify(currentContent, null, 2);
    const updateResponse = await fetch(addonlistUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Actualizar addonlist.json',
            content: btoa(updatedContent),
            sha: addonlistData.sha
        })
    });

    if (!updateResponse.ok) {
        throw new Error('Error al actualizar addonlist.json');
    }
}

// Cargar addons al iniciar la página
loadAddons();