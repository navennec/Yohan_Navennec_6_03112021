/* eslint-disable import/extensions */
import {
  getMediasFromPhotographer, factory, getPhotographerId, pageId,
} from './functions.js';
import { createModal, manageModal } from './modal.js';

// Elements DOM
const header = document.querySelector('header');
const photographerPageContainer = document.querySelector('#photographer-main-content');
const mediaContainer = document.querySelector('.media-display');
const toggle = document.querySelector('.dropdown__toggle');
const menu = document.querySelector('.dropdown__menu');
const option = menu.querySelectorAll('li');
const lightbox = document.querySelector('.lightbox');
const lightboxContainer = document.createElement('div');

let photographerData = [];
let mediaData = [];

// Afficher en-tête photographe
const photographerBannerDisplay = async () => {
  photographerData = await getPhotographerId();
  // Titre de la page
  document.title = `Profil: ${photographerData.name} - Fisheye`;

  const tags = [];
  for (let i = 0; i < photographerData.tags.length; i += 1) {
    tags.push(
      `  <li><a  aria-label="${photographerData.tags[i]}" href="#" class="tag focus" data-tag="${photographerData.tags[i]}">#${photographerData.tags[i]}</a></li>`,
    );
  }

  document.querySelector('.photographer-banner').innerHTML = `
      
    <div class="photographer-banner__description">
    <h1 class="photographer-banner__name profile-name">${photographerData.name}</h1>
      <div>
        <p lang="en" class="photographer-banner__location profile-location">${photographerData.city}, ${photographerData.country}</p>
        <p class="photographer-banner__tagline">${photographerData.tagline}</p>
      </div>
      <ul aria-label="Catégories médias" lang="en">
        ${tags.join('')}
      </ul>
    </div>
    <button class="modal-btn btn focus">Contactez-moi</button>
    <img src="images/photographers/${photographerData.portrait}" class="profile-image" alt="">
 `;
};

// Trier les médias par tag
const tagFilterMedia = () => {
  const tags = document.querySelectorAll('.tag');
  tags.forEach((tag) => {
    tag.addEventListener('click', (e) => {
      const mediaEl = document.querySelectorAll('.media-element');
      mediaEl.forEach((element) => {
        const elt = element;
        const mediaTag = elt.dataset.tag;
        const containSelectedTag = mediaTag.includes(
          e.target.dataset.tag,
        );
        if (containSelectedTag) {
          elt.style.display = 'block';
        } else {
          elt.style.display = 'none';
        }
      });
    });
  });
};
photographerBannerDisplay().then(() => {
  tagFilterMedia();
  createModal().then(() => manageModal());
});

const mediaDisplay = async (filter) => {
  mediaData = await getMediasFromPhotographer(pageId);
  // Trier les médias en fonction du filtre
  if (filter === 'Popularité') {
    mediaData.sort((a, b) => (a.likes < b.likes ? 1 : -1));
  } else if (filter === 'Date') {
    mediaData.sort((a, b) => (a.date < b.date ? 1 : -1));
  } else if (filter === 'Titre') {
    mediaData.sort((a, b) => (a.title > b.title ? 1 : -1));
  }

  // Afficher les images en fonction de l'id du photographe

  mediaContainer.innerHTML = '';
  mediaData.forEach((element) => {
    const media = factory(element);
    if (media !== undefined) {
      mediaContainer.innerHTML += media.displayList();
    }
  });
};

// Likes
const likesDisplay = async () => {
  const likesContainer = document.querySelectorAll('.media-likes');
  const values = Array.from(document.querySelectorAll('.media-likes__number')).map((like) => parseInt(like.innerText, 10));
  const reducer = (previousValue, currentValue) => previousValue + currentValue;
  let totalOfLikes = values.reduce(reducer);
  photographerData = await getPhotographerId();

  // Afficher dynamiquement le nombre total de likes et le prix/photographe
  document.querySelector('.like-counter').innerHTML = `
  <div aria-label="${totalOfLikes}jaime" class="total-likes">
  <p aria-hidden="true" class="total-likes__number">${totalOfLikes}</p>
  <i class="fas fa-heart"></i>
  </div>
  <p aria-label="${photographerData.price}€ par jour"><span aria-hidden="true">${photographerData.price}€/jour</span></p>
  `;
  // Gestion du total de likes
  likesContainer.forEach((element) => {
    const elt = element;
    const like = elt.querySelector('.media-likes__number');
    const totalContainer = document.querySelector('.total-likes__number');
    let likeValue = parseInt(like.innerText, 10);
    const manageTotalOfLikes = () => {
      if (like.hasAttribute('active')) {
        likeValue -= 1;
        totalOfLikes -= 1;
        like.removeAttribute('active');
      } else {
        likeValue += 1;
        totalOfLikes += 1;
        like.setAttribute('active', '');
      }
      like.innerHTML = likeValue;
      like.parentElement.setAttribute('aria-label', `${likeValue} jaimes`);
      totalContainer.innerHTML = totalOfLikes;
      totalContainer.parentElement.setAttribute('aria-label', `${totalOfLikes} jaimes`);
    };
    const likesKeyup = (e) => {
      if (e.key === 'Enter') {
        manageTotalOfLikes();
      }
    };
    element.addEventListener('click', manageTotalOfLikes);
    element.addEventListener('keydown', likesKeyup);
  });
};

// Lightbox
const navigate = (medias, index, direction) => {
  let newIndex = index;
  if (direction === 'next') {
    if (index === medias.length - 1) {
      newIndex = 0;
    } else {
      newIndex += 1;
    }
  } else if (direction === 'prev') {
    if (index === 0) {
      newIndex = medias.length - 1;
    } else {
      newIndex -= 1;
    }
  }
  return medias[newIndex];
};

const manageLightbox = () => {
  const links = document.querySelectorAll('a[href$=".jpg"], a[href$=".mp4"');

  // Créer le container de la lightbox
  lightboxContainer.classList.add('lightbox__container');
  lightbox.appendChild(lightboxContainer);

  const close = () => {
    photographerPageContainer.classList.remove('hidden');
    header.classList.remove('hidden');
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    // eslint-disable-next-line no-use-before-define
    document.removeEventListener('keyup', onKeyUp);
  };
  const onKeyUp = (e) => {
    if (e.key === 'Escape') {
      close();
    }
  };
  // Générer un nouveau média dans la lightbox
  const createMedia = (media, focusElt) => {
    const i = mediaData.findIndex((element) => element.id === media.id);
    const keyEvent = (e) => {
      if (e.key === ('ArrowRight')) {
        const nextMedia = navigate(mediaData, i, 'next');
        createMedia(nextMedia, '.lightbox__next');
        window.removeEventListener('keyup', keyEvent);
      } else if (e.key === ('ArrowLeft')) {
        const prevMedia = navigate(mediaData, i, 'prev');
        createMedia(prevMedia, '.lightbox__prev');
        window.removeEventListener('keyup', keyEvent);
      }
      onKeyUp(e);
    };
    lightboxContainer.innerHTML = '';
    const mediaLightbox = factory(media);
    if (media !== undefined) {
      lightboxContainer.innerHTML += mediaLightbox.displayLightbox();
      if (focusElt !== undefined) {
        lightbox.querySelector(focusElt).focus();
      } else {
        lightbox.querySelector('.lightbox__close').focus();
      }
    }
    // Navigation dans la lightbox
    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    window.addEventListener('keyup', keyEvent);
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => {
      const nextMedia = navigate(mediaData, i, 'next');
      createMedia(nextMedia, '.lightbox__next');
    });
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => {
      const prevMedia = navigate(mediaData, i, 'prev');
      createMedia(prevMedia, '.lightbox__prev');
    });
  };

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const mediaId = mediaData.find((elt) => elt.id === parseInt(e.currentTarget.dataset.id, 10));

      e.preventDefault();
      photographerPageContainer.classList.add('hidden');
      header.classList.add('hidden');
      photographerPageContainer.setAttribute('aria-hidden', 'true');
      lightbox.classList.remove('hidden');
      lightbox.setAttribute('aria-hidden', 'false');
      createMedia(mediaId);
    });
  });
};

// Dropdown
const toggler = (expand = null) => {
  const display = expand === null ? menu.getAttribute('aria-expanded') !== 'true' : expand;

  menu.setAttribute('aria-expanded', display);

  if (display) {
    toggle.classList.add('active');
    menu.setAttribute('aria-activedescendant', 'option');
  } else {
    toggle.classList.remove('active');
  }
};
// Navigation au clavier sur le bouton du dropdown
const toggleKeyDown = (e) => {
  if (e.key === 'Escape') {
    toggler(false);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault(e);
    menu.children[0].focus();
  }
};
// Navigation clavier sur la liste éléments du dropdown
const menuKeyDown = (e) => {
  e.preventDefault();
  if (e.key === 'Escape') {
    toggler(false);
  } else if (e.key === 'ArrowUp' && e.target.previousElementSibling) {
    e.target.previousElementSibling.focus();
  } else if (e.key === 'ArrowDown' && e.target.nextElementSibling) {
    e.target.nextElementSibling.focus();
  } else {
    toggle.focus();
  }
};

toggle.addEventListener('click', () => {
  toggler();
});
toggle.addEventListener('keydown', toggleKeyDown);
menu.addEventListener('keydown', menuKeyDown);

const setValue = (element) => {
  const elt = element;
  const elementContent = element.textContent;
  const toggleContent = toggle.textContent;
  toggle.textContent = elementContent;
  elt.textContent = toggleContent;
  mediaDisplay(toggle.innerText).then(() => {
    // Afficher la lightbox au changement de filtre
    manageLightbox();
    // Afficher les likes au changement de filtre
    likesDisplay();
  });
  toggler(false);
};
option.forEach((item) => {
  item.addEventListener('click', () => setValue(item));
  item.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      setValue(item);
    }
  });
});

mediaDisplay('Popularité').then(() => {
  // Afficher la lightbox au chargement de la page
  manageLightbox();
  // Afficher les likes au chargemet de la page
  likesDisplay();
});
