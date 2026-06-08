$(function () {
  const cookieName = 'romanFiniLastVisit';
  const welcomeBanner = $('#welcomeBanner');
  const toggleEmailButton = $('#toggleEmail');
  const emailValue = $('#emailValue');
  const digitalClock = $('#digitalClock');
  const clockDate = $('#clockDate');
  const jokeStatus = $('#jokeStatus');
  const jokeText = $('#jokeText');
  const dogStatus = $('#dogStatus');
  const dogImage = $('#dogImage');
  const refreshDogButton = $('#refreshDog');
  const visitCount = $('#visitCount');
  const visitCountFooter = $('#visitCountFooter');
  const currentYear = $('#currentYear');

  if (currentYear.length) {
    currentYear.text(new Date().getFullYear());
  }

  if (welcomeBanner.length) {
    initializeWelcomeBanner(welcomeBanner, cookieName);
  }

  if (toggleEmailButton.length && emailValue.length) {
    toggleEmailButton.on('click', function () {
      const isHidden = emailValue.prop('hidden');
      emailValue.prop('hidden', !isHidden);
      toggleEmailButton.text(isHidden ? 'Hide my email' : 'Show my email');
      toggleEmailButton.attr('aria-expanded', String(isHidden));
    });
  }

  if (digitalClock.length && clockDate.length && $('#analogClock').length) {
    startClock();
  }

  if ($('#skillsChart').length && typeof Chart !== 'undefined') {
    renderSkillsChart();
  }

  if (jokeStatus.length && jokeText.length) {
    loadJoke(jokeStatus, jokeText);
    window.setInterval(function () {
      loadJoke(jokeStatus, jokeText);
    }, 60000);
  }

  if (dogStatus.length && dogImage.length && refreshDogButton.length) {
    loadDogImage(dogStatus, dogImage, refreshDogButton);
    refreshDogButton.on('click', function () {
      loadDogImage(dogStatus, dogImage, refreshDogButton);
    });
  }

  if (visitCount.length || visitCountFooter.length) {
    updateVisitorCount(visitCount, visitCountFooter);
  }
});

function initializeWelcomeBanner(target, cookieName) {
  const previousVisit = getCookie(cookieName);
  const now = new Date();

  if (previousVisit) {
    target.text('Welcome back! Your last visit was ' + formatDisplayDate(previousVisit));
  } else {
    target.text('Welcome to my homepage for the first time!');
  }

  setCookie(cookieName, now.toISOString(), 365);
}

function getCookie(name) {
  const cookieParts = document.cookie ? document.cookie.split('; ') : [];

  for (let index = 0; index < cookieParts.length; index += 1) {
    const cookiePart = cookieParts[index];
    if (cookiePart.indexOf(name + '=') === 0) {
      return decodeURIComponent(cookiePart.substring(name.length + 1));
    }
  }

  return '';
}

function setCookie(name, value, days) {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expiryDate.toUTCString() + '; path=/';
}

function formatDisplayDate(rawValue) {
  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return rawValue;
  }

  return parsedDate.toLocaleString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

function startClock() {
  updateClock();
  window.setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  $('#digitalClock').text(now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));
  $('#clockDate').text(now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  drawAnalogClock(document.getElementById('analogClock'), now);
}

function drawAnalogClock(canvas, now) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 18;

  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(centerX, centerY);

  const faceGradient = context.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  faceGradient.addColorStop(0, '#ffffff');
  faceGradient.addColorStop(1, '#eaf1ff');

  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fillStyle = faceGradient;
  context.fill();
  context.lineWidth = 10;
  context.strokeStyle = 'rgba(22, 99, 214, 0.16)';
  context.stroke();

  for (let index = 0; index < 60; index += 1) {
    const tickAngle = index * Math.PI / 30;
    const outerRadius = radius - 6;
    const innerRadius = index % 5 === 0 ? radius - 22 : radius - 14;

    context.beginPath();
    context.moveTo(Math.cos(tickAngle) * innerRadius, Math.sin(tickAngle) * innerRadius);
    context.lineTo(Math.cos(tickAngle) * outerRadius, Math.sin(tickAngle) * outerRadius);
    context.lineWidth = index % 5 === 0 ? 3 : 1;
    context.strokeStyle = index % 5 === 0 ? '#0e4fae' : 'rgba(95, 107, 128, 0.45)';
    context.stroke();
  }

  context.fillStyle = '#142033';
  context.font = '700 18px "Space Grotesk", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let number = 1; number <= 12; number += 1) {
    const numberAngle = number * Math.PI / 6 - Math.PI / 2;
    const numberRadius = radius - 38;
    context.fillText(String(number), Math.cos(numberAngle) * numberRadius, Math.sin(numberAngle) * numberRadius + 1);
  }

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  function drawHand(angle, handLength, handWidth, color) {
    context.beginPath();
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = handWidth;
    context.moveTo(0, 0);
    context.lineTo(Math.cos(angle) * handLength, Math.sin(angle) * handLength);
    context.stroke();
  }

  const hourAngle = (hours + minutes / 60) * Math.PI / 6 - Math.PI / 2;
  const minuteAngle = (minutes + seconds / 60) * Math.PI / 30 - Math.PI / 2;
  const secondAngle = seconds * Math.PI / 30 - Math.PI / 2;

  drawHand(hourAngle, radius * 0.5, 7, '#142033');
  drawHand(minuteAngle, radius * 0.7, 5, '#1663d6');
  drawHand(secondAngle, radius * 0.8, 2.5, '#cf5f5f');

  context.beginPath();
  context.arc(0, 0, 7, 0, Math.PI * 2);
  context.fillStyle = '#1663d6';
  context.fill();

  context.restore();
}

function renderSkillsChart() {
  const canvas = document.getElementById('skillsChart');

  if (!canvas) {
    return;
  }

  new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['HTML', 'CSS', 'JavaScript', 'jQuery', 'Ajax', 'Responsive UI'],
      datasets: [{
        label: 'Current comfort level',
        data: [92, 90, 84, 80, 78, 88],
        fill: true,
        backgroundColor: 'rgba(22, 99, 214, 0.14)',
        borderColor: '#1663d6',
        pointBackgroundColor: '#1663d6',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#1663d6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#142033',
            font: {
              family: 'Space Grotesk'
            }
          }
        }
      },
      scales: {
        r: {
          angleLines: {
            color: 'rgba(20, 32, 51, 0.1)'
          },
          grid: {
            color: 'rgba(20, 32, 51, 0.1)'
          },
          pointLabels: {
            color: '#142033',
            font: {
              family: 'Space Grotesk',
              size: 12,
              weight: '700'
            }
          },
          ticks: {
            backdropColor: 'transparent',
            color: '#5f6b80',
            stepSize: 20
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}

function loadJoke(statusTarget, jokeTarget) {
  statusTarget.text('Refreshing a joke from JokeAPI...');

  $.getJSON('https://v2.jokeapi.dev/joke/Any?safe-mode').done(function (data) {
    const jokeText = data.type === 'single' ? data.joke : data.setup + ' ' + data.delivery;
    jokeTarget.text(jokeText);
    statusTarget.text('Updated ' + new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }));
  }).fail(function () {
    statusTarget.text('JokeAPI is unavailable right now.');
    jokeTarget.text('The joke feed could not load at the moment.');
  });
}

function loadDogImage(statusTarget, imageTarget, buttonTarget) {
  statusTarget.text('Fetching a new image from Dog CEO...');
  buttonTarget.prop('disabled', true).text('Loading...');

  $.getJSON('https://dog.ceo/api/breeds/image/random?nocache=' + Date.now()).done(function (data) {
    imageTarget.attr('src', data.message);
    imageTarget.attr('alt', 'Random dog from Dog CEO API');
    statusTarget.text('Fresh image loaded from Dog CEO API.');
  }).fail(function () {
    statusTarget.text('Dog CEO API is unavailable right now.');
  }).always(function () {
    buttonTarget.prop('disabled', false).text('New dog image');
  });
}

function updateVisitorCount(visitCount, visitCountFooter) {
  $.getJSON('https://api.countapi.xyz/hit/romanfini-waph-project1/homepage').done(function (data) {
    const count = Number(data.value || 0).toLocaleString();
    visitCount.text(count);
    visitCountFooter.text(count);
  }).fail(function () {
    visitCount.text('N/A');
    visitCountFooter.text('N/A');
  });
}
