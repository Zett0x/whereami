'use strict';

const btn = document.getElementById('btn-country');
const countriesContainer = document.getElementById('countries');
const loc = document.getElementById('loc');

const getJSON = (url, err = 'Something went wrong!') => {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${err} ${response.status}`);
    return response.json();
  });
};
const renderError = msg =>
  countriesContainer.insertAdjacentText('beforeEnd', msg);

const getCountryData = countryName => {
  //country 1
  getJSON(
    `https://restcountries.eu/rest/v2/name/${countryName}`,
    'Country not found.'
  )
    .then(data => {
      renderCountry(...data);
      //console.log(...data);
      const neighbour = data[0].borders[0];
      if (!neighbour) throw new Error('No neighbour found!');
      //country 2
      return getJSON(
        `https://restcountries.eu/rest/v2/alpha/${neighbour}`,
        'Neighbour country not found'
      );
    })
    .then(data => renderCountry(data, 'neighbour'))
    .catch(err => {
      console.error(`${err}`);
      renderError(`Something went wrong:  ${err.message} try again!`);
      //console.error('aa');
    })
    .finally(() => (countriesContainer.style.opacity = 1));
};

const renderCountry = (countryData, clase = 'country') => {
  const html = `<article class="${clase}">
    <img class="country__img" src="${countryData.flag}" />
    <div class="country__data">
      <h3 class="country__name">${countryData.name}</h3>
      <h4 class="country__region">${countryData.region}</h4>
      <p class="country__row"><span>👫</span>${(
        countryData.population / 1000000
      ).toFixed(2)} million people</p>
      <p class="country__row"><span>🗣️</span>${
        countryData.languages[0].name
      } LANG</p>
      <p class="country__row"><span>💰</span>${
        countryData.currencies[0].name
      } CUR</p>
    </div>
  </article>`;

  countriesContainer.insertAdjacentHTML('beforeEnd', html);
};

const getPosition = () => {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
/*
const whereAmI = () => {
  getPosition()
    .then(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;

      return fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
    })

    .then(resolve => {
      if (!resolve.ok)
        throw new Error('You can make only 3 request per second!');
      return resolve.json();
    })
    .then(data => {
      if (data.countryName) {
        console.log(`You are in ${data.countryName}, ${data.locality}`);
        getCountryData(data.countryName);
      }
    })
    .catch(err => console.error(err.message));
};*/

//whereAmI ASYNC/AWAIT VERSION
const whereAmI = async () => {
  btn.removeEventListener('click', whereAmI);
  btn.remove();
  try {
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    const geo = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (!geo.ok) renderError(new Error('Geocode error'));

    const geoData = await geo.json();

    //console.log(`You are in ${geoData.countryName}, ${geoData.locality}`);

    loc.insertAdjacentText(
      'beforeend',
      `You are in ${geoData.countryName}, ${geoData.locality}`
    );
    loc.style.opacity = 1;
    getCountryData(geoData.countryName);
  } catch (err) {
    console.error(err.message);
  }
};

///EVENTS LISTENER
btn.addEventListener('click', whereAmI);
