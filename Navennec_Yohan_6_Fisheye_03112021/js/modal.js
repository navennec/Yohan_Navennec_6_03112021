/* eslint-disable import/extensions */
import { getPhotographerId } from './functions.js';

// Eléments DOM
const header = document.querySelector('header');
const photographerPageContainer = document.querySelector('#photographer-main-content');
const pageCopntainer = document.querySelector('#page-container');
const modal = document.querySelector('.modal');
const modalBg = document.querySelector('.modal-background');

let photographerData = [];
// Générer la modale dynamiquement
export const createModal = async () => {
  photographerData = await getPhotographerId();
  modal.innerHTML = `
           <form
              id="contact"
              name="contact"
              action="photographer.html"
              method="GET"
              novalidate
            >
              <div aria-live="polite" class="modal-header">
                <h1 id="modal">Contactez-moi <br> ${photographerData.name} </h1>
                <button type="button" id="close-modal">Fermer la fenêtre de contact</button>
              </div>
              <div class="form-data">
                <label id="firstname" for="first">Prénom</label>
                <input type="text" id="first" name="first" aria-labelledby="firstname" />
                <small role="alert"></small>
              </div>
              <div class="form-data">
                <label id="lastname" for="last">Nom</label>
                <input type="text" id="last" name="last" aria-labelledby="lastname" />
                <small role="alert"></small>
              </div>
              <div class="form-data">
                <label id="youremail" for="email">Email</label>
                <input type="email" id="email" name="email" aria-labelledby="youremail" />
                <small role="alert"></small>
              </div>
              <div class="form-data">
                <label id="yourmessage" for="message">Votre message</label>
                <textarea
                name="message"
                id="message"
                aria-labelledby="yourmessage"
                cols="30"
                rows="8"
                ></textarea>
                <small role="alert"></small>
              </div>
              <input type="submit" value="Envoyer" class="btn contact-btn" />
          </form>
  `;
};

// Fermer et ouvrir la modale
const closeModal = () => {
  modal.style.display = 'none';
  modalBg.style.display = 'none';
  photographerPageContainer.setAttribute('aria-hidden', 'false');
  header.setAttribute('aria-hidden', 'false');
  modal.setAttribute('aria-hidden', 'true');

  // Affichage responsive mobile
  if (window.matchMedia('(max-width: 600px').matches) {
    header.style.display = 'block';
    photographerPageContainer.style.display = 'block';
    pageCopntainer.style.margin = '0 10px';
  }
};

const openModal = () => {
  modal.style.display = 'block';
  modalBg.style.display = 'block';
  photographerPageContainer.setAttribute('aria-hidden', 'true');
  header.setAttribute('aria-hidden', 'true');
  modal.setAttribute('aria-hidden', 'false');
  if (window.matchMedia('(max-width: 600px').matches) {
    header.style.display = 'none';
    photographerPageContainer.style.display = 'none';
    modalBg.style.display = 'none';
    pageCopntainer.style.margin = '0';
  }
};

// Validation formulaire
const validation = () => {
  const form = document.getElementById('contact');
  const firstNameEl = document.getElementById('first');
  const lastNameEl = document.getElementById('last');
  const emailEl = document.getElementById('email');
  const messageEl = document.getElementById('message');

  const isrequired = (value) => (value !== '');

  const showError = (input, message) => {
    const parentEl = input.parentElement;
    input.classList.add('error');

    const error = parentEl.querySelector('small');
    error.textContent = message;
  };

  const showSuccess = (input) => {
    const parentEl = input.parentElement;
    input.classList.remove('error');
    const error = parentEl.querySelector('small');
    error.textContent = '';
  };
  const checkFirstName = () => {
    let valid = false;
    const value = firstNameEl.value.trim();

    if (!isrequired(value)) {
      showError(firstNameEl, 'Veuillez entrer un prénom');
    } else if (value.length < 2) {
      showError(firstNameEl, 'Veillez entrer 2 caractères minimum');
    } else {
      valid = true;
      showSuccess(firstNameEl);
    }
    return valid;
  };
  const checkLastName = () => {
    let valid = false;
    const value = lastNameEl.value.trim();
    if (!isrequired(value)) {
      showError(lastNameEl, 'Veuillez entrer un nom');
    } else if (value.length < 2) {
      showError(lastNameEl, 'Veillez entrer 2 caractères minimum');
    } else {
      showSuccess(lastNameEl);
      valid = true;
    }
    return valid;
  };
  const emailValid = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/;

  const checkEmail = () => {
    let valid = false;
    const value = emailEl.value.trim();
    if (!isrequired(value)) {
      showError(emailEl, 'Veuillez entrer un e-mail');
    } else if (!value.match(emailValid)) {
      showError(emailEl, 'Veillez entrer un e-mail valide');
    } else {
      showSuccess(emailEl);
      valid = true;
    }
    return valid;
  };

  const checkMessage = () => {
    let valid = false;
    const value = messageEl.value.trim();
    if (!isrequired(value)) {
      showError(messageEl, 'Ce champ ne peut être vide');
    } else {
      showSuccess(messageEl);
      valid = true;
    }
    return valid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstNameValidation = checkFirstName();
    const lastNameValidation = checkLastName();
    const emailValidation = checkEmail();
    const messageValidation = checkMessage();

    const formValidation = firstNameValidation
      && lastNameValidation
      && emailValidation
      && messageValidation;

    if (formValidation) {
      console.log(firstNameEl.value, lastNameEl.value, emailEl.value, messageEl.value);
      modal.style.display = 'none';
      modalBg.style.display = 'none';
      form.reset();
      if (window.matchMedia('(max-width: 600px').matches) {
        header.style.display = 'block';
        photographerPageContainer.style.display = 'block';
        pageCopntainer.style.margin = '0 10px';
      }
    }
  });

  // Ajouter un délai pour l'apparition du le message d'erreur
  const debounce = (fn, delay = 1000) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  form.addEventListener('input', debounce((e) => {
    switch (e.target.id) {
      case 'first':
        checkFirstName();
        break;
      case 'last':
        checkLastName();
        break;
      case 'email':
        checkEmail();
        break;
      case 'message':
        checkMessage();
        break;
      default:
    }
  }));
};

// Gestion de l'ouverture et de la fermeture de la modale avec navigation au clavier
export const manageModal = () => {
  const modalBtn = document.querySelector('.modal-btn');
  const closeBtn = document.querySelector('#close-modal');
  const focusEl = document.querySelectorAll('.focus');
  modalBtn.addEventListener('click', () => {
    openModal();
    focusEl.forEach((elt) => elt.setAttribute('tabindex', '-1'));
    closeBtn.focus();
  });
  closeBtn.addEventListener('click', () => {
    closeModal();
    focusEl.forEach((elt) => elt.setAttribute('tabindex', '0'));
    modalBtn.focus();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      focusEl.forEach((elt) => elt.setAttribute('tabindex', '0'));
      modalBtn.focus();
    }
  });

  validation();
};
