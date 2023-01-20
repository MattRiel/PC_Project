function arraysort(array) {
  for (var i = 0; i < array.length; i++) {
    temp = array[i];
    tempkey = i;
    for (var j = i; j < array.length; j++) {
      if (temp > array[j]) {
        tempkey = j;
        temp = array[j];
      }
    }
    tempsaved = temp;
    array[tempkey] = array[i];
    array[i] = temp;
  }
  return array;
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function warning(text) {
  console.warn(text);
}

function info(text) {
  console.info(text);
}

function error(text) {
  console.error(text);
}

function log(text) {
  console.log(text);
}

// Mengambil isi dari canvas HTML ke JS
function pc(canvas) {
  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.width = 0;
  this.height = 0;
  this.imgsrc = 'Blank';

  // fungsi yang akan membaca gambar lalu dirubah menjadi bentuk array
  this.image2read = function () {
    this.originalLakeImageData = this.context.getImageData(
      0,
      0,
      this.width,
      this.height
    );
    this.resultArr = new Array();
    this.tempArr = new Array();
    this.tempCount = 0;
    for (var i = 0; i < this.originalLakeImageData.data.length; i++) {
      this.tempCount++;
      this.tempArr.push(this.originalLakeImageData.data[i]);
      if (this.tempCount == 4) {
        this.resultArr.push(this.tempArr);
        this.tempArr = [];
        this.tempCount = 0;
      }
    }
    info(
      'image2read Success (' +
        this.imgsrc +
        ') : ' +
        this.width +
        'x' +
        this.height
    );
    return this.resultArr;
  };

  // membuat canvas kosong
  this.blank2canvas = function (w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.imgsrc = 'Blank';
    info('blank2canvas Success (Blank ' + w + 'x' + h + ')');
  };

  // masukin gambar ke canvas
  this.image2canvas = function (imgsrc) {
    var imageObj = new Image();
    var parent = this;
    imageObj.onload = function () {
      parent.canvas.width = imageObj.width;
      parent.canvas.height = imageObj.height;
      parent.context.drawImage(imageObj, 0, 0);
      parent.width = imageObj.width;
      parent.height = imageObj.height;
      info('image2canvas Success (' + imgsrc + ')');
    };
    imageObj.src = imgsrc;
    this.imgsrc = imgsrc;
  };

  // mengembalikan image atau blank canvas untuk kembali ke kondisi awal
  this.image2original = function () {
    if (this.imgsrc == '') {
      error('image2original Failed : Image Source not found!');
    } else if (this.imgsrc == 'blank') {
      this.blank2canvas(this.width, this.height);
      info('image2original Success');
    } else {
      this.image2canvas(this.imgsrc);
      info('image2original Success');
    }
  };

  // mengubah array agar dapat ditampilkan pada canvas dalam bentuk gambar
  this.array2canvas = function (arr) {
    this.imageData = this.context.getImageData(0, 0, this.width, this.height);
    if (this.imageData.data.length != arr.length * 4) {
      error('array2canvas Failed to Execute');
      return false;
    }
    for (var i = 0; i < arr.length; i++) {
      this.imageData.data[i * 4] = arr[i][0];
      this.imageData.data[i * 4 + 1] = arr[i][1];
      this.imageData.data[i * 4 + 2] = arr[i][2];
      this.imageData.data[i * 4 + 3] = arr[i][3];
    }
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.putImageData(this.imageData, 0, 0);
    info('Array2Canvas Success (' + this.imgsrc + ')');
  };

  // membaca data array agar dapat disusun histogram, lalu data dari hist2read akan dikirim ke hist2canvas
  this.hist2read = function (arr) {
    //checking
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] < 0 || arr[i] > 3) {
        error(
          'hist2read Failed : Wrong parameter(' +
            arr[i] +
            ') : (' +
            this.imgsrc +
            ')'
        );
        return false;
      }
    }
    //end of checking
    var read = this.image2read();
    var resArr = new Array();
    for (var i = 0; i < arr.length; i++) {
      var tempArr = new Array(read.length);
      for (var c = 0; c < read.length; c++) {
        tempArr[c] = read[c][arr[i]];
      }
      var tempArr = tempArr.sort();
      var fixedval = new Array(256);
      for (var init = 0; init < 256; init++) fixedval[init] = 0;

      for (var a = 0; a < tempArr.length; a++) {
        fixedval[tempArr[a]]++;
      }
      resArr.push(fixedval);
    }
    return resArr;
  };

  // menampilkan data dari hist2read menjadi histogram
  this.hist2canvas = function (arr, fontsize) {
    if (arr == undefined) {
      error('hist2canvas Failed to execute');
      return false;
    }
    var wc = this.width;
    var hc = this.height;
    var max = Math.max.apply(null, arr);
    var gmax = max - (max % 100) + 100;
    var gmid = Math.ceil(gmax / 2);
    var context = this.context;
    var margin = 5;
    context.clearRect(0, 0, this.width, this.height);

    context.fillStyle = '#f0f0f0';
    context.fillRect(0, 0, wc, hc);

    context.font = fontsize + 'px Arial';
    var txt1 = gmax;
    var txt2 = gmid;

    widthfontmax = context.measureText(txt1).width;
    widthfontmid = context.measureText(txt2).width;

    context.fillStyle = '#000000';
    context.fillText(txt1, margin, fontsize);

    context.beginPath();

    context.moveTo(widthfontmax + margin * 2, 0);
    context.lineTo(widthfontmax + margin * 2, hc);

    context.moveTo(0, hc - margin * 2);
    context.lineTo(wc, hc - margin * 2);

    if (gmid == gmax) {
      gmid = -1;
      txt2 = '';
    } else {
      context.fillStyle = '#000000';
      context.fillText(txt2, margin, fontsize + (hc / 2 - margin * 2));
    }

    var marginbottom = margin * 2;
    var histheight = hc - marginbottom - widthfontmax / 2;
    var histwidth = wc - 2 * margin - widthfontmax - 1;

    for (var i = 0; i < arr.length; i++) {
      context.moveTo(
        2 * margin + widthfontmax + 1 + ((i + 1) / 256) * histwidth,
        hc - (arr[i] / gmax) * histheight - marginbottom
      );
      context.lineTo(
        2 * margin + widthfontmax + 1 + ((i + 1) / 256) * histwidth,
        hc - marginbottom
      );
    }

    context.strokeStyle = '#000000';
    context.stroke();

    var grad = context.createLinearGradient(
      2 * margin + widthfontmax + 1,
      hc,
      wc,
      hc
    );
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#ffffff');

    context.fillStyle = grad;
    context.fillRect(2 * margin + widthfontmax + 1, hc - marginbottom, wc, hc);

    info('Hist2canvas Success');
  };

  this.i2x = function (i) {
    return i % this.width;
  };

  this.i2y = function (i) {
    return (i - (i % this.width)) / this.width;
  };

  this.xy2i = function (x, y) {
    return y * this.width + x;
  };
}

// Bentuk canvas
{
  var canvas1 = document.getElementById('canvas1');
  var canvas3 = document.getElementById('canvas3');
  var img = 'pics/pria25.png';
  // img = 'pics/xx' // ganti xx dengan nama file gambar
  var obj1 = new pc(canvas1);
  var prev = new pc(canvas3);
  prev.image2canvas(img);
  obj1.image2canvas(img);
  var FinalPic = new Array();
}

// Read Pic
{
  document.getElementById('read').addEventListener('click', function () {
    FinalPic = obj1.image2read();
    document.getElementById('log_out').innerHTML = 'Citra berhasil dibaca';
  });
}

// Original Pic
{
  document.getElementById('ori').addEventListener('click', function () {
    obj1.image2original();
    document.getElementById('log_out').innerHTML = 'Citra dipulihkan';
  });
}

// Algoritma Sobel
{
  document.getElementById('sobel').addEventListener('click', function () {
    function count(x, y) {
      if (y >= 0 && x >= 0 && x < obj1.width && y < obj1.height)
        return parseInt(FinalPic[obj1.xy2i(x, y)]);
      else return 0;
    }

    var XArray = new Array(4);
    var YArray = new Array(4);
    var FinalArr = new Array();
    var xcoord = 0;
    var ycoord = 0;

    for (var i = 0; i < FinalPic.length; i++) {
      var PrepArr = new Array(4);
      xcoord = obj1.i2x(i);
      ycoord = obj1.i2y(i);
      for (var j = 0; j < 3; j++) {
        XArray[j] =
          count(xcoord - 1, ycoord - 1) * -1 +
          count(xcoord - 1, ycoord) * -2 +
          count(xcoord - 1, ycoord + 1) * -1 +
          count(xcoord + 1, ycoord - 1) +
          count(xcoord + 1, ycoord) * 2 +
          count(xcoord + 1, ycoord + 1);

        YArray[j] =
          count(xcoord - 1, ycoord - 1) * -1 +
          count(xcoord, ycoord - 1) * -2 +
          count(xcoord + 1, ycoord - 1) * -1 +
          count(xcoord - 1, ycoord + 1) +
          count(xcoord, ycoord + 1) * 2 +
          count(xcoord + 1, ycoord + 1);

        PrepArr[j] = Math.floor(
          Math.sqrt(
            parseInt(XArray[j]) * parseInt(XArray[j]) +
              parseInt(YArray[j]) * parseInt(YArray[j])
          )
        );
      }
      PrepArr[3] = FinalPic[i][3];
      FinalArr.push(PrepArr);
    }
    obj1.array2canvas(FinalArr); // hasil terakhir disimpan di array FinalArr
    document.getElementById('log_out').innerHTML = 'Sobel Edge Detection';
  });
}

// Grayscale
{
  document.getElementById('grayscl').addEventListener('click', function () {
    // array grayscale
    HasilAkhir = new Array();
    for (var c = 0; c < FinalPic.length; c++) {
      temp = new Array();
      for (var d = 0; d < 4; d++) {
        temp.push(FinalPic[c][d]);
      }
      HasilAkhir.push(temp);
    }

    for (var i = 0; i < HasilAkhir.length; i++) {
      var total = Math.floor(
        (HasilAkhir[i][0] + HasilAkhir[i][1] + HasilAkhir[i][2]) / 3
      );
      FinalPic[i][0] = total;
      FinalPic[i][1] = total;
      FinalPic[i][2] = total;
      FinalPic[i][3] = HasilAkhir[i][3];
    }

    obj1.array2canvas(FinalPic);
    document.getElementById('log_out').innerHTML = 'Grayscale';
  });
}

// Negative
{
  document.getElementById('negatif').addEventListener('click', function () {
    // array negative
    HasilAkhir = new Array();
    for (var c = 0; c < FinalPic.length; c++) {
      temp = new Array();
      for (var d = 0; d < 4; d++) {
        temp.push(FinalPic[c][d]);
      }
      HasilAkhir.push(temp);
    }
    for (var i = 0; i < HasilAkhir.length; i++) {
      FinalPic[i][0] = 255 - HasilAkhir[i][0];
      FinalPic[i][1] = 255 - HasilAkhir[i][1];
      FinalPic[i][2] = 255 - HasilAkhir[i][2];
      FinalPic[i][3] = HasilAkhir[i][3];
    }
    obj1.array2canvas(FinalPic);
    document.getElementById('log_out').innerHTML = 'Negative';
  });
}

// Brightness
{
  // Brightness
  document.getElementById('brightness').addEventListener('click', function () {
    document.getElementById('brightness_val').value = this.value;
    p = parseInt(this.value);
    // array brightness
    HasilAkhir = new Array();
    for (var c = 0; c < FinalPic.length; c++) {
      temp = new Array();
      for (var d = 0; d < 4; d++) {
        temp.push(FinalPic[c][d]);
      }
      HasilAkhir.push(temp);
    }

    for (var i = 0; i < FinalPic.length; i++) {
      HasilAkhir[i][0] = FinalPic[i][0] + p;
      HasilAkhir[i][1] = FinalPic[i][1] + p;
      HasilAkhir[i][2] = FinalPic[i][2] + p;
      HasilAkhir[i][3] = FinalPic[i][3];
    }
    obj1.array2canvas(HasilAkhir);
    document.getElementById('log_out').innerHTML = 'Brightness';
  });

  // Brightness Default
  document.getElementById('brdefault').addEventListener('click', function () {
    document.getElementById('brightness').value = 0;
    document.getElementById('brightness_val').value = 0;
    rgbachange();
  });
}

// Threshold
{
  // Threshold
  document.getElementById('threshold').addEventListener('click', function () {
    document.getElementById('threshold_val').value = this.value;
    batas = parseInt(this.value);
    // array threshold
    HasilAkhir = new Array();
    for (var c = 0; c < FinalPic.length; c++) {
      temp = new Array();
      for (var d = 0; d < 4; d++) {
        temp.push(FinalPic[c][d]);
      }
      HasilAkhir.push(temp);
    }

    for (var i = 0; i < FinalPic.length; i++) {
      blend = Math.floor(
        (HasilAkhir[i][0] + HasilAkhir[i][1] + HasilAkhir[i][2]) / 3
      );
      if (blend < batas) {
        blend = 0;
      } else {
        blend = 255;
      }
      FinalPic[i][0] = blend;
      FinalPic[i][1] = blend;
      FinalPic[i][2] = blend;
      FinalPic[i][3] = FinalPic[i][3];
    }
    obj1.array2canvas(HasilAkhir);
    document.getElementById('log_out').innerHTML = 'Threshold';
  });

  // Threshold Default
  document.getElementById('thdefault').addEventListener('click', function () {
    document.getElementById('threshold').value = 0;
    document.getElementById('threshold_val').value = 0;
    rgbachange();
  });
}
