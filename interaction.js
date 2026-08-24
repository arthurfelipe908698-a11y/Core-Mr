// Componente A-Frame para interagir tanto por cursor quanto por gestos de pinça das mãos
AFRAME.registerComponent('hand-interactive', {
    init: function () {
        const el = this.el;
        const defaultColor = el.getAttribute('material').color;

        // Feedback visual ao tocar/apontar
        el.addEventListener('raycaster-intersected', () => {
            el.setAttribute('material', 'color', '#F1C40F'); 
        });

        el.addEventListener('raycaster-intersected-cleared', () => {
            el.setAttribute('material', 'color', defaultColor);
        });

        // Evento de clique padrão (compatível com toque de mão/cursor)
        el.addEventListener('click', () => {
            this.executarAcao();
        });
    },

    executarAcao: function() {
        const el = this.el;
        if (el.id === 'btnMudarCor') {
            const cubo = document.querySelector('#cuboPrincipal');
            cubo.setAttribute('material', 'color', '#' + Math.floor(Math.random()*16777215).toString(16));
        } else if (el.id === 'btnResetar') {
            const cubo = document.querySelector('#cuboPrincipal');
            cubo.setAttribute('scale', {x: 1, y: 1, z: 1});
            cubo.setAttribute('material', 'color', '#4CC3D9');
        } else {
            let currentScale = el.getAttribute('scale');
            el.setAttribute('scale', {
                x: currentScale.x * 1.2,
                y: currentScale.y * 1.2,
                z: currentScale.z * 1.2
            });
        }
    }
});

// Listener específico para detecção de gestos das mãos via WebXR Hand Tracking
document.addEventListener('DOMContentLoaded', () => {
    const rightHand = document.querySelector('#rightHand');
    const leftHand = document.querySelector('#leftHand');

    if (rightHand) {
        // Detecta quando o usuário faz o gesto de pinça (juntar polegar e indicador) com a mão direita
        rightHand.addEventListener('pinchstarted', (evt) => {
            console.log("Gesto de pinça detectado na mão direita!");
            // Dispara um clique virtual caso esteja mirando em algum objeto interativo
            const cursor = document.querySelector('a-cursor');
            if (cursor && cursor.components.raycaster.intersectedEls.length > 0) {
                const alvo = cursor.components.raycaster.intersectedEls[0];
                alvo.emit('click');
            }
        });
    }
});
