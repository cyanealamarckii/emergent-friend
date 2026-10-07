const launch = document.getElementById("launch");
const introVideo = document.getElementById("introVideo");

const soundButton = document.getElementById("soundButton");
const soundText = document.getElementById("soundText");
const soundIcon = document.querySelector(".sound-icon");

let hasEnteredHome = false;


/* =========================================================
   VIDEO LOADED
========================================================= */

introVideo.addEventListener("loadeddata", async () => {

    launch.classList.add("video-ready");

    try {

        /*
            First try to play with sound.

            Some browsers will allow this.
            Others will block it because the user
            has not interacted with the page yet.
        */

        introVideo.muted = false;
        introVideo.volume = 1;

        await introVideo.play();

        /*
            Sound autoplay worked.
            Keep the sound button hidden.
        */

        showSoundButton();

        updateSoundButton();

    } catch (error) {

        console.log("Autoplay with sound was blocked.");

        /*
            Browser blocked audio autoplay.

            Start the video muted instead so the
            cinematic launch still plays.
        */

        introVideo.muted = true;

        try {
            await introVideo.play();
        } catch (playError) {
            console.log("Video autoplay was also blocked:", playError);
        }

        /*
            Now show the manual SOUND ON button.
        */

        showSoundButton();
        updateSoundButton();
    }
});


/* =========================================================
   SOUND BUTTON
========================================================= */

soundButton.addEventListener("click", async () => {

    if (hasEnteredHome) return;

    try {

        if (introVideo.paused) {
            await introVideo.play();
        }

        // switch between sound on and sound off
        introVideo.muted = !introVideo.muted;

        if (!introVideo.muted) {
            introVideo.volume = 1;
        }

        updateSoundButton();

    } catch (error) {

        console.log("Could not change sound:", error);

    }
});


/* =========================================================
   UPDATE SOUND BUTTON
========================================================= */

function updateSoundButton() {

    if (introVideo.muted) {

        soundText.textContent = "SOUND ON";
        soundIcon.textContent = "♪";
        soundButton.setAttribute("aria-label", "Turn sound on");
        soundButton.classList.remove("sound-active");

    } else {

        soundText.textContent = "SOUND OFF";
        soundIcon.textContent = "♫";
        soundButton.setAttribute("aria-label", "Turn sound off");
        soundButton.classList.add("sound-active");
    }
}


/* =========================================================
   SHOW SOUND BUTTON
========================================================= */

function showSoundButton() {

    soundButton.classList.add("visible");
}


/* =========================================================
   HIDE SOUND BUTTON
========================================================= */

function hideSoundButton() {

    soundButton.classList.remove("visible");
}


/* =========================================================
   VIDEO → HOME
========================================================= */

function enterHome() {
  if (hasEnteredHome) return;

  hasEnteredHome = true;

  // Stop the launch video without resetting it to frame 1
  introVideo.pause();
  introVideo.muted = true;

  hideSoundButton();

  // Immediately transition to the home page
  launch.classList.add("hidden");

  setTimeout(() => {
      launch.style.display = "none";
  }, 1500);
}


/* =========================================================
   VIDEO FINISHED
========================================================= */

introVideo.addEventListener("ended", () => {

    enterHome();

});


/* =========================================================
   VIDEO ERROR
========================================================= */

introVideo.addEventListener("error", () => {

    console.warn(
        "intro-video.mov could not be loaded."
    );

    /*
        Still allow the website to continue.
    */

    setTimeout(() => {

        enterHome();

    }, 1000);
});




/* =========================================================
   MOBILE MENU
========================================================= */

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileClose = document.querySelector(".mobile-close");


if (menuButton) {

    menuButton.addEventListener("click", () => {

        mobileMenu.classList.add("open");

    });
}


if (mobileClose) {

    mobileClose.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

    });
}


document
    .querySelectorAll(".mobile-menu a")
    .forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("open");

        });

    });

/* =========================================================
   DOME RISES WHILE SCROLLING
========================================================= */

const dome = document.getElementById("dome");

function updateDome() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // 0 at the top of the page, 1 after one screen of scrolling
  const p = Math.min(window.scrollY / h, 1);

  // radius: starts about half the screen width, grows very large
  const startR = w * 0.5;
  const endR = Math.max(w, h) * 3;
  const r = startR + (endR - startR) * p * p;

  // top edge of the circle: starts at the bottom of the screen,
  // ends slightly above the top so the corners are covered
  const topY = h - p * h * 1.2;

  // circle centre
  const cy = topY + r;

  dome.style.clipPath = `circle(${r}px at 50% ${cy}px)`;
}

window.addEventListener("scroll", updateDome, { passive: true });
window.addEventListener("resize", updateDome);
updateDome();

/* =========================================================
   STORY: VERTICAL LINES DRAW WHILE SCROLLING
========================================================= */

const sfLines = document.querySelectorAll(".sf-line");

function updateLine() {
    const h = window.innerHeight;

    sfLines.forEach(line => {
        const fill = line.querySelector(".sf-line-fill");
        if (!fill) return;

        const rect = line.getBoundingClientRect();

        // 0 when the line first arrives, 1 when fully drawn
        const p = Math.min(Math.max((h * 0.6 - rect.top) / rect.height, 0), 1);

        fill.style.transform = `scaleY(${p})`;
    });
}

window.addEventListener("scroll", updateLine, { passive: true });
window.addEventListener("resize", updateLine);
updateLine();

/* =========================================================
   SKIP BUTTON
========================================================= */

const skipButton = document.getElementById("skipButton");

if (skipButton) {
    skipButton.addEventListener("click", enterHome);
}

/* =========================================================
   SLOW SCROLL FOR MENU LINKS
========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function smoothScrollTo(targetY, duration = 1600) {
    const startY = window.scrollY;
    const distance = targetY - startY;

    if (reduceMotion) {
        window.scrollTo(0, targetY);
        return;
    }

    const startTime = performance.now();

    // slow start, slow end
    function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * ease(t));
        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;

        event.preventDefault();

        const y = target.getBoundingClientRect().top + window.scrollY;
        smoothScrollTo(y);
    });
});

/* =========================================================
   HOW IT WORKS — ARROW NAVIGATION ONLY
========================================================= */

const howTrack = document.querySelector(".how-track");
const howBtnPrev = document.querySelector(".how-btn-prev");
const howBtnNext = document.querySelector(".how-btn-next");
const howHint = document.getElementById("howHint");

if (howTrack) {

    const slideCount = howTrack.children.length;

    function currentIndex() {
        return Math.round(howTrack.scrollLeft / howTrack.clientWidth);
    }

    function goTo(index) {
        const i = Math.max(0, Math.min(index, slideCount - 1));
        howTrack.scrollTo({
            left: i * howTrack.clientWidth,
            behavior: "smooth"
        });
    }

    function updateHowButtons() {
        const i = currentIndex();
        const atStart = i <= 0;
        const atEnd = i >= slideCount - 1;

        if (howBtnPrev) howBtnPrev.disabled = atStart;
        if (howBtnNext) howBtnNext.disabled = atEnd;
        if (howHint) howHint.classList.toggle("hidden", atEnd);
    }

    if (howBtnPrev) howBtnPrev.addEventListener("click", () => goTo(currentIndex() - 1));
    if (howBtnNext) howBtnNext.addEventListener("click", () => goTo(currentIndex() + 1));

    howTrack.addEventListener("scroll", updateHowButtons, { passive: true });
    window.addEventListener("resize", updateHowButtons);
    updateHowButtons();
}
