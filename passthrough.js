// Script refinado para ligar a câmera traseira em celulares para Realidade Mista
document.addEventListener('DOMContentLoaded', () => {
    // Tenta acessar a câmera traseira priorizando resoluções mobile
    const constraints = {
        video: { 
            facingMode: { exact: "environment" } // Força a câmera traseira principal
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        iniciarVideoPassthrough(stream);
    })
    .catch((err) => {
        console.log("Câmera 'environment' exata não encontrada, tentando modo flexível...", err);
        // Fallback caso o celular não suporte o parâmetro exato
        return navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    })
    .then((stream) => {
        if (stream) iniciarVideoPassthrough(stream);
    })
    .catch((err) => {
        console.log("Erro crítico ao acessar a câmera do celular: ", err);
    });
});

function iniciarVideoPassthrough(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.play();
    
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'cover';
    video.style.zIndex = '-10'; // Mantém estritamente atrás de tudo do A-Frame
    
    document.body.prepend(video);
    console.log("Passthrough (Realidade Mista) ativado com sucesso!");
}
