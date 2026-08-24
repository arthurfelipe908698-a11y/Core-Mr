// Script para ativar a câmera traseira do celular (Realidade Mista / Passthrough)
document.addEventListener('DOMContentLoaded', () => {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Solicita a câmera traseira
    })
    .then((stream) => {
        // Cria um elemento de vídeo para exibir a câmera em tempo real
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // Estiliza o vídeo para cobrir toda a tela e ficar no fundo (atrás da cena 3D)
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.zIndex = '-1'; 
        
        document.body.prepend(video);
        console.log("Câmera traseira ativada para Realidade Mista com sucesso!");
    })
    .catch((err) => {
        console.log("Erro ao acessar a câmera (verifique as permissões do navegador): ", err);
    });
});
