const inviteConfig = {
  whatsappNumber: '258870880696',
  scheduleWhatsappMessage: 'Obrigado pelo convite estarei lá'
};

const opening = document.getElementById('opening');
const invitation = document.getElementById('invitation');
const sealButton = document.getElementById('sealButton');
const weddingMusic = document.getElementById('weddingMusic');
const musicControl = document.getElementById('musicControl');
const musicToggleButton = document.getElementById('musicToggleButton');
const musicControlLabel = document.getElementById('musicControlLabel');
const musicControlStatus = document.getElementById('musicControlStatus');
const scheduleConfirmButton = document.getElementById('scheduleConfirmButton');
const weddingCountdown = document.getElementById('weddingCountdown');
const countdownComplete = document.getElementById('countdownComplete');
let revealObserver;
let openingStarted = false;
let weddingCountdownInterval;

function setInvitationContent() {
  if (inviteConfig.whatsappNumber) {
    const phone = inviteConfig.whatsappNumber.replace(/\D/g, '');

    if (!phone) {
      throw new Error('O número de WhatsApp deve incluir o indicativo do país.');
    }

    const whatsappUrl = new URL(`https://wa.me/${phone}`);
    whatsappUrl.searchParams.set('text', inviteConfig.scheduleWhatsappMessage);
    scheduleConfirmButton.href = whatsappUrl.toString();
  } else {
    throw new Error('Adiciona o número de WhatsApp em script.js para activar a confirmação.');
  }
}

function updateWeddingCountdown() {
  const targetTime = Date.parse(weddingCountdown.dataset.target);
  if (!Number.isFinite(targetTime)) {
    throw new Error('A data-alvo da contagem decrescente é inválida.');
  }

  const remainingMilliseconds = targetTime - Date.now();
  if (remainingMilliseconds <= 0) {
    weddingCountdown.hidden = true;
    countdownComplete.hidden = false;
    window.clearInterval(weddingCountdownInterval);
    weddingCountdownInterval = undefined;
    return;
  }

  countdownComplete.hidden = true;
  weddingCountdown.hidden = false;
  let remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
  const days = Math.floor(remainingSeconds / 86400);
  remainingSeconds %= 86400;
  const hours = Math.floor(remainingSeconds / 3600);
  remainingSeconds %= 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  document.getElementById('countdownDays').textContent = String(days).padStart(2, '0');
  document.getElementById('countdownHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('countdownMinutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('countdownSeconds').textContent = String(seconds).padStart(2, '0');
}

function startWeddingCountdown() {
  window.clearInterval(weddingCountdownInterval);
  updateWeddingCountdown();

  if (!weddingCountdown.hidden) {
    weddingCountdownInterval = window.setInterval(updateWeddingCountdown, 1000);
  }
}

function revealSections() {
  const sections = invitation.querySelectorAll('.scroll-reveal, .first-screen-godparents');
  invitation.classList.add('scroll-effects-ready');

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.13, rootMargin: '0px 0px -6% 0px' }
  );

  sections.forEach((section) => revealObserver.observe(section));
}

function openInvitation() {
  if (openingStarted || invitation.classList.contains('show')) {
    return;
  }

  openingStarted = true;
  opening.classList.add('is-opening');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const openingDuration = reducedMotion ? 0 : 6800;
  const revealDelay = reducedMotion ? 0 : 5900;

  window.setTimeout(() => {
    invitation.classList.add('show', 'opening-reveal');
    invitation.setAttribute('aria-hidden', 'false');
    revealSections();
  }, revealDelay);

  window.setTimeout(() => {
    opening.classList.add('hide');
    invitation.classList.remove('opening-reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      opening.setAttribute('aria-hidden', 'true');
      opening.hidden = true;
    }, 750);
  }, openingDuration);
}

function updateMusicControl(isPlaying) {
  musicToggleButton.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproduzir música');
  musicToggleButton.setAttribute('aria-pressed', String(isPlaying));
  musicControlLabel.textContent = isPlaying ? 'Pausar música' : 'Reproduzir música';
  musicControl.classList.toggle('is-playing', isPlaying);
}

async function playWeddingMusic() {
  musicControl.hidden = false;
  musicControlStatus.textContent = '';

  try {
    await weddingMusic.play();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }

    updateMusicControl(false);
    musicControlStatus.textContent = 'Não foi possível reproduzir a música.';
    console.error('Não foi possível reproduzir a música do convite.', error);
  }
}

sealButton.addEventListener('click', () => {
  openInvitation();
  void playWeddingMusic();
});

musicToggleButton.addEventListener('click', () => {
  if (weddingMusic.paused) {
    void playWeddingMusic();
  } else {
    weddingMusic.pause();
  }
});

weddingMusic.addEventListener('play', () => updateMusicControl(true));
weddingMusic.addEventListener('pause', () => updateMusicControl(false));
weddingMusic.addEventListener('error', () => {
  musicControl.hidden = false;
  updateMusicControl(false);
  musicControlStatus.textContent = 'Não foi possível carregar a música.';
});

setInvitationContent();
startWeddingCountdown();

window.inviteConfig = inviteConfig;
