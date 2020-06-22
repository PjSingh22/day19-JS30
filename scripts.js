/* eslint-disable strict */
const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      console.log(localMediaStream);
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => console.error('oh noooo!', err));
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;  

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0,0, width, height);
    // mess with them
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels);
    // ctx.globalAlpha = 0.1;
    pixels = greenScreen(pixels);
    // put them back in
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();

  //take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="Handsom-man" />`;
  strip.insertBefore(link, strip.firstChild);
}

function redEffect(px) {
  for(let i = 0; i < px.data.length; i+=4) {
    px.data[i + 0] = px.data[i + 0] + 200; //r
    px.data[i + 1] = px.data[i + 1] - 50; //g
    px.data[i + 2] = px.data[i + 2] * 0.5; //b
  }
  return px;
}

function rgbSplit(px) {
  for(let i = 0; i < px.data.length; i+=4) {
    px.data[i - 150] = px.data[i + 0]; //r
    px.data[i + 100] = px.data[i + 1]; //g
    px.data[i - 550] = px.data[i + 2]; //b
  }
  return px;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);