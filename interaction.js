/* ============================================================================ */
/* ARQUIVO: interaction.js                                                      */
/* DESCRIÇÃO: Lógica avançada de componentes, detecção de interações por gestos  */
/* de pinça (pinch) e manipulação de eventos de esqueleto para o app de VR.     */
/* ============================================================================ */

"use strict";

// Registro do componente principal de interatividade avançada no A-Frame
AFRAME.registerComponent('advanced-interactive', {
    schema: {
        activeColor: { type: 'color', default: '#F1C40F' },
        inactiveColor: { type: 'color', default: '#4CC3D9' },
        speed: { type: 'number', default: 1.0 }
    },

    init: function () {
        const data = this.data;
        const el = this.el;
        
        // Armazena a cor original do elemento baseado no material atual
        this.originalColor = '#4CC3D9';
        if (el.hasAttribute('material') && el.getAttribute('material').color) {
            this.originalColor = el.getAttribute('material').color;
        }

        // Variáveis de controle de estado de toque e animação
        this.isHovered = false;
        this.isPressed = false;
        this.animationTimer = 0;

        // Registro de ouvintes de eventos de interseção e clique genérico
        el.addEventListener('raycaster-intersected', (evt) => {
            this.onIntersectEnter(evt);
        });

        el.addEventListener('raycaster-intersected-cleared', (evt) => {
            this.onIntersectLeave(evt);
        });

        el.addEventListener('click', (evt) => {
            this.onElementClicked(evt);
        });

        // Log interno de inicialização do componente para fins de depuração
        if (typeof updateDebugLog === 'function') {
            updateDebugLog("Componente advanced-interactive inicializado em: " + el.id);
        }
    },

    onIntersectEnter: function (evt) {
        this.isHovered = true;
        const el = this.el;
        
        // Efeito visual de destaque ao aproximar a mão ou o cursor virtual
        if (el.object3D) {
            el.object3D.scale.set(1.1, 1.1, 1.1);
        }
        
        if (el.components.material) {
            el.setAttribute('material', 'color', '#F1C40F');
        }
    },

    onIntersectLeave: function (evt) {
        this.isHovered = false;
        const el = this.el;
        
        // Retorna ao estado de escala e cor originais ao afastar
        if (el.object3D) {
            el.object3D.scale.set(1.0, 1.0, 1.0);
        }
        
        if (el.components.material) {
            el.setAttribute('material', 'color', this.originalColor);
        }
    },

    onElementClicked: function (evt) {
        const el = this.el;
        this.isPressed = !this.isPressed;

        // Executa lógica específica dependendo de qual botão foi acionado na interface
        if (el.id === 'btnMudarCor') {
            this.executarMudancaDeCorGlobal();
        } else if (el.id === 'btnResetar') {
            this.executarAcaoDeReset();
        } else {
            this.executarAnimacaoGenerica();
        }

        // Feedback visual rápido de clique (efeito de escala "pulsar")
        this.triggerPulseEffect();
    },

    executarMudancaDeCorGlobal: function () {
        const coresDisponíveis = ['#2ECC71', '#E74C3C', '#9B59B6', '#F39C12', '#1ABC9C', '#3498DB'];
        const corAleatoria = coresDisponíveis[Math.floor(Math.random() * coresDisponíveis.length)];
        
        // Altera a cor de todos os botões da interface HUD como feedback visual
        const todosBotoes = document.querySelectorAll('[advanced-interactive]');
        todosBotoes.forEach(botao => {
            botao.setAttribute('material', 'color', corAleatoria);
        });

        if (typeof updateDebugLog === 'function') {
            updateDebugLog("Cor da interface alterada para: " + corAleatoria);
        }
    },

    executarAcaoDeReset: function () {
        // Restaura as configurações iniciais de todos os elementos interativos
        const todosBotoes = document.querySelectorAll('[advanced-interactive]');
        todosBotoes.forEach((botao, index) => {
            const corOriginal = index === 0 ? '#4CC3D9' : '#EF2D5E';
            botao.setAttribute('material', 'color', corOriginal);
            if (botao.object3D) {
                botao.object3D.scale.set(1.0, 1.0, 1.0);
            }
        });

        if (typeof updateDebugLog === 'function') {
            updateDebugLog("Sistema resetado com sucesso.");
        }
    },

    executarAnimacaoGenerica: function () {
        const el = this.el;
        let currentRotation = el.getAttribute('rotation') || {x: 0, y: 0, z: 0};
        el.setAttribute('rotation', {
            x: currentRotation.x + 15,
            y: currentRotation.y + 30,
            z: currentRotation.z
        });
    },

    triggerPulseEffect: function () {
        const el = this.el;
        if (!el.object3D) return;

        let startTime = performance.now();
        let duration = 200; // milissegundos

        function pulseStep(currentTime) {
            let elapsed = currentTime - startTime;
            let progress = elapsed / duration;

            if (progress < 1) {
                let scaleFactor = 1.0 + Math.sin(progress * Math.PI) * 0.2;
                el.object3D.scale.set(scaleFactor, scaleFactor, scaleFactor);
                requestAnimationFrame(pulseStep);
            } else {
                el.object3D.scale.set(1.0, 1.0, 1.0);
            }
        }
        requestAnimationFrame(pulseStep);
    },

    tick: function (time, timeDelta) {
        // Processamento contínuo por frame, útil para animações fluidas baseadas em tempo
        this.animationTimer += timeDelta;
        if (this.animationTimer > 5000) {
            this.animationTimer = 0;
            // Executa baixa manutenção interna de estado se necessário
        }
    }
});

/* ============================================================================ */
/* MONITORAMENTO GLOBAL DE EVENTOS DE HAND TRACKING E GESTOS DE PINÇA (PINCH)   */
/* ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const rightHandEl = document.querySelector('#rightHand');
    const leftHandEl = document.querySelector('#leftHand');

    if (rightHandEl) {
        rightHandEl.addEventListener('pinchstarted', (evt) => {
            if (typeof updateDebugLog === 'function') {
                updateDebugLog("Gesto de Pinça Detectado (Mão Direita)");
            }
            dispararInteracaoPorGesto();
        });

        rightHandEl.addEventListener('pinchended', (evt) => {
            // Evento disparado quando o usuário solta o gesto de pinça
        });
    }

    if (leftHandEl) {
        leftHandEl.addEventListener('pinchstarted', (evt) => {
            if (typeof updateDebugLog === 'function') {
                updateDebugLog("Gesto de Pinça Detectado (Mão Esquerda)");
            }
            dispararInteracaoPorGesto();
        });
    }
});

// Função auxiliar para acionar elementos interativos mais próximos ao realizar gestos
function dispararInteracaoPorGesto() {
    const botoes = document.querySelectorAll('[advanced-interactive]');
    if (botoes.length > 0) {
        // Seleciona aleatoriamente ou o primeiro botão para simular o toque por esqueleto de mão
        const alvoSelecionado = botoes[Math.floor(Math.random() * botoes.length)];
        alvoSelecionado.emit('click');
    }
}

// Funções utilitárias adicionais de suporte e validação de ambiente WebXR
function validarCompatibilidadeHandTracking() {
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            if (supported) {
                console.log("[MR-Check]: Sessão Immersive-VR suportada pelo navegador.");
            }
        });
    }
}
validarCompatibilidadeHandTracking();
    
