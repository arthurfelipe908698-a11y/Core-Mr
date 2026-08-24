// Componente A-Frame customizado para detectar proximidade e cliques das mãos/cursor
AFRAME.registerComponent('hand-interactive', {
    init: function () {
        const el = this.el;
        const defaultColor = el.getAttribute('material').color;

        // Efeito ao aproximar a mão ou o cursor
        el.addEventListener('raycaster-intersected', () => {
            el.setAttribute('material', 'color', '#F1C40F'); // Fica amarelo ao focar
            console.log("Mão ou cursor apontando para o objeto!");
        });

        // Retorna à cor original quando afasta
        el.addEventListener('raycaster-intersected-cleared', () => {
            el.setAttribute('material', 'color', defaultColor);
        });

        // Ação ao interagir / clicar
        el.addEventListener('click', () => {
            if (el.id === 'btnMudarCor') {
                const cubo = document.querySelector('#cuboPrincipal');
                cubo.setAttribute('material', 'color', '#' + Math.floor(Math.random()*16777215).toString(16));
                console.log("Cor do cubo alterada!");
            } else if (el.id === 'btnResetar') {
                const cubo = document.querySelector('#cuboPrincipal');
                cubo.setAttribute('scale', {x: 1, y: 1, z: 1});
                cubo.setAttribute('material', 'color', '#4CC3D9');
                console.log("Objeto resetado!");
            } else {
                // Se for o cubo principal, aumenta o tamanho
                let currentScale = el.getAttribute('scale');
                el.setAttribute('scale', {
                    x: currentScale.x * 1.2,
                    y: currentScale.y * 1.2,
                    z: currentScale.z * 1.2
                });
                console.log("Cubo expandido!");
            }
        });
    }
});

// Listener geral para inicialização do WebXR
document.addEventListener('DOMContentLoaded', () => {
    const sceneEl = document.querySelector('a-scene');

    sceneEl.addEventListener('enter-vr', () => {
        if (sceneEl.is('vr-mode')) {
            console.log("Modo VR / Realidade Mista Ativado pelo celular!");
        }
    });
});
