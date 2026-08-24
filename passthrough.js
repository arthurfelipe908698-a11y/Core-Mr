/* ============================================================================ */
/* ARQUIVO: passthrough.js                                                      */
/* DESCRIÇÃO: Script robusto responsável por capturar a câmera traseira do      */
/* dispositivo móvel em tempo real, injetando-a no plano de fundo da aplicação  */
/* para prover a Realidade Mista (Passthrough) ideal para o VR Box.             */
/* ============================================================================ */

"use strict";

class MobilePassthroughManager {
    constructor() {
        this.videoElement = null;
        this.mediaStream = null;
        this.isInitialized = false;
        this.currentFacingMode = "environment"; // Prioriza a câmera traseira principal
        
        // Inicializa o processo de montagem da câmera assim que a classe é instanciada
        this.init();
    }

    init() {
        if (typeof updateDebugLog === 'function') {
            updateDebugLog("Iniciando MobilePassthroughManager...");
        }

        // Verifica suporte a API de mídia do navegador
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn("[Passthrough]: API navigator.mediaDevices.getUserMedia não suportada neste navegador.");
            if (typeof updateDebugLog === 'function') {
                updateDebugLog("Erro: Câmera não suportada pelo navegador.");
            }
            return;
        }

        // Dispara a requisição de acesso à câmera do celular
        this.requestCameraAccess();
    }

    requestCameraAccess() {
        const constraintsList = [
            // Tentativa 1: Configuração estrito para câmera traseira em alta resolução mobile
            {
                video: {
                    facingMode: { exact: "environment" },
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 }
                },
                audio: false
            },
            // Tentativa 2: Configuração flexível para câmera traseira padrão
            {
                video: {
                    facingMode: "environment"
                },
                audio: false
            },
            // Tentativa 3: Qualquer câmera disponível no dispositivo como fallback de segurança
            {
                video: true,
                audio: false
            }
        ];

        this.attemptConstraintsSequence(constraintsList, 0);
    }

    attemptConstraintsSequence(constraintsArray, index) {
        if (index >= constraintsArray.length) {
            console.error("[Passthrough]: Todas as tentativas de acesso à câmera falharam.");
            if (typeof updateDebugLog === 'function') {
                updateDebugLog("Erro crítico: Permissão de câmera negada ou indisponível.");
            }
            this.criarFundoAlternativoDeSeguranca();
            return;
        }

        navigator.mediaDevices.getUserMedia(constraintsArray[index])
            .then((stream) => {
                this.handleSuccessfulStream(stream);
            })
            .catch((error) => {
                console.warn(`[Passthrough]: Falha na tentativa ${index + 1} de acesso à câmera:`, error);
                // Tenta a próxima regra de restrição recursivamente
                this.attemptConstraintsSequence(constraintsArray, index + 1);
            });
    }

    handleSuccessfulStream(stream) {
        this.mediaStream = stream;
        this.isInitialized = true;

        if (typeof updateDebugLog === 'function') {
            updateDebugLog("Câmera conectada com sucesso! Renderizando fundo...");
        }

        // Cria e configura o elemento de vídeo HTML5 em background
        this.setupVideoElement(stream);
    }

    setupVideoElement(stream) {
        // Remove elemento pré-existente caso haja duplicidade
        const existingVideo = document.getElementById('xr-passthrough-video');
        if (existingVideo) {
            existingVideo.remove();
        }

        this.videoElement = document.createElement('video');
        this.videoElement.id = 'xr-passthrough-video';
        this.videoElement.srcObject = stream;
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('muted', '');
        this.videoElement.muted = true;

        // Estilização agressiva via CSS Inline para garantir cobertura total de tela em background absoluto
        const styleProps = {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: '-9999', // Assegura que fique estritamente atrás de todas as camadas do A-Frame
            pointerEvents: 'none',
            transform: 'translateZ(0)',
            '-webkit-transform': 'translateZ(0)'
        };

        for (let property in styleProps) {
            this.videoElement.style[property] = styleProps[property];
        }

        // Insere o elemento de vídeo no início do corpo da página
        document.body.prepend(this.videoElement);

        // Executa a reprodução forçada com tratamento de promessa
        const playPromise = this.videoElement.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("[Passthrough]: Vídeo da câmera em reprodução contínua.");
            }).catch((error) => {
                console.warn("[Passthrough]: Autoplay bloqueado pelo navegador, tentando recuperar com clique/toque:", error);
                this.adicionarGatilhoDeToqueParaAudioVideo();
            });
        }

        // Ajusta dinamicamente caso ocorra redimensionamento da tela do celular
        window.addEventListener('resize', () => {
            this.reajustarDimensoesVideo();
        });
    }

    adicionarGatilhoDeToqueParaAudioVideo() {
        const unlockHandler = () => {
            if (this.videoElement) {
                this.videoElement.play().catch(e => console.log(e));
            }
            window.removeEventListener('touchstart', unlockHandler);
            window.removeEventListener('click', unlockHandler);
        };

        window.addEventListener('touchstart', unlockHandler, { once: true });
        window.addEventListener('click', unlockHandler, { once: true });
    }

    reajustarDimensoesVideo() {
        if (this.videoElement) {
            this.videoElement.style.width = window.innerWidth + 'px';
            this.videoElement.style.height = window.innerHeight + 'px';
        }
    }

    criarFundoAlternativoDeSeguranca() {
        // Cria um gradiente escuro de segurança caso a câmera não seja permitida pelo usuário
        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.position = 'fixed';
        fallbackDiv.style.top = '0';
        fallbackDiv.style.left = '0';
        fallbackDiv.style.width = '100vw';
        fallbackDiv.style.height = '100vh';
        fallbackDiv.style.background = 'radial-gradient(circle, #2c3e50 0%, #000000 100%)';
        fallbackDiv.style.zIndex = '-9999';
        document.body.prepend(fallbackDiv);
        
        if (typeof updateDebugLog === 'function') {
            updateDebugLog("Modo de segurança ativado (Sem permissão de câmera).");
        }
    }

    pararCamera() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.isInitialized = false;
        }
    }
}

// Inicialização automática do gerenciador de passthrough ao carregar o script
document.addEventListener('DOMContentLoaded', () => {
    // Pequeno atraso para garantir prioridade de carregamento do DOM principal
    setTimeout(() => {
        window.passthroughManager = new MobilePassthroughManager();
    }, 500);
});
    
