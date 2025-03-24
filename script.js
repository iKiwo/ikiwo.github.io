document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        alert('¡El enlace de descarga estará disponible pronto!');
    });
});