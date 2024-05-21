import { theme } from './theme.js';
export const audio = (() => {

    const music = document.getElementById('button-music');
    let audio = null;

    const getAudio = () => {
        if (!audio) {
            audio = new Audio();
           
            audio.src = theme.isDarkMode() ? "./assets/music/sound-dark-1.mp3" : "./assets/music/sound-light.mp3" ;//music.getAttribute('data-url');
            audio.load();
            audio.currentTime = 0;
            audio.autoplay = true;
            audio.muted = false;
            audio.loop = true;
            audio.volume = 1;
        }

        return audio;
    };

    const switchingThemAudio= ()=>{
       
        if(audio){
            audio.pause();
            audio = null;
            getAudio()
        }
    }
    const button = (button) => {
        if (button.getAttribute('data-status') !== 'true') {
            button.setAttribute('data-status', 'true');
            getAudio().play();
            button.innerHTML = '<i class="fa-solid fa-circle-pause spin-button"></i>';
            return;
        }

        button.setAttribute('data-status', 'false');
        getAudio().pause();
        button.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    };

    const showButton = () => {
        music.style.display = 'block';
    };

    return {
        play: () => getAudio().play(),
        button,
        showButton,
        switchingThemAudio
    };
})();