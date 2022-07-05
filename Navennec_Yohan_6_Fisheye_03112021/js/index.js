/* eslint-disable import/extensions */
import { fetchPhotographer } from './functions.js';
// Bouton passer au contenu
const mainLink = document.querySelector('.main-link');
window.addEventListener('scroll', () => {
  if (window.scrollY > 120) {
    mainLink.style.display = 'inline';
  } else {
    mainLink.style.display = 'none';
  }
});

let photographerData = [];

const photographerDisplay = async () => {
  photographerData = await fetchPhotographer();
  document.querySelector('.photographer-container').innerHTML = photographerData
    .map((photographer) => {
      const tags = [];
      for (let i = 0; i < photographer.tags.length; i += 1) {
        tags.push(
          `  <li><a aria-label="${photographer.tags[i]}" href="#" class="tag" data-tag="${photographer.tags[i]}">#${photographer.tags[i]}</a></li>`,
        );
      }

      return `
        <section class="photographer">
          <a href="./photographer.html?id=${photographer.id}" class="photographer-link">
            <img src="images/photographers/${photographer.portrait}" class="profile-image" alt="" />
            <h2 class="photographer__name profile-name">${photographer.name}</h2>
          </a>
          <div class="photographer__description">
            <p lang="en" class="photographer__location profile-location" >${photographer.city}, ${photographer.country}</p>
            <p class="photographer__tagline">${photographer.tagline}</p>
            <p aria-label="${photographer.price} euros par jour" class="photographer__price"><span aria-hidden="true">${photographer.price}€/jour</span></p>
          </div>
          <ul lang="en">
            ${tags.join('')}
         </ul>
      </section>

        `;
    })
    .join('');
};

// Filtres
const tagFilter = async () => {
  await photographerDisplay();

  const tagEl = document.querySelectorAll('.tag');

  tagEl.forEach((tags) => {
    tags.addEventListener('click', (e) => {
      const photographerEl = document.querySelectorAll('.photographer');
      photographerEl.forEach((elt) => {
        const photographer = elt;
        const photographerTags = Array.from(
          photographer.querySelectorAll('.tag'),
        ).map((element) => element.dataset.tag);
        const containSelectedTag = photographerTags.includes(
          e.target.dataset.tag,
        );
        if (containSelectedTag) {
          photographer.style.display = 'flex';
        } else {
          photographer.style.display = 'none';
        }
      });
    });
  });
};
tagFilter();
