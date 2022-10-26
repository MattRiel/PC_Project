function arraysort(array) {
    for (var i = 0; i < array.length; i++) {
        temp = array[i]
        tempkey = i
        for (var j = i; j < array.length; j++) {
            if (temp > array[j]) {
                tempkey = j
                temp = array[j]
            }
        }
        tempsaved = temp
        array[tempkey] = array[i]
        array[i] = temp
    }
    return array
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function warning(text) {
    console.warn(text)
}

function info(text) {
    console.info(text)
}

function error(text) {
    console.error(text)
}

function log(text) {
    console.log(text)
}

function pc(canvas) {
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.width = 0
    this.height = 0
    this.imgsrc = "Blank"
    this.image2read = function() {
        this.originalLakeImageData = this.context.getImageData(0, 0, this.width, this.height)
        this.resultArr = new Array()
        this.tempArr = new Array()
        this.tempCount = 0
        for (var i = 0; i < this.originalLakeImageData.data.length; i++) {
            this.tempCount++
                this.tempArr.push(this.originalLakeImageData.data[i])
            if (this.tempCount == 4) {
                this.resultArr.push(this.tempArr)
                this.tempArr = []
                this.tempCount = 0
            }
        }
        info('image2read Success (' + this.imgsrc + ') : ' + this.width + 'x' + this.height)
        return this.resultArr
    }

    this.blank2canvas = function(w, h) {
        this.width = w
        this.height = h
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.imgsrc = "Blank"
        info('blank2canvas Success (Blank ' + w + 'x' + h + ')')
    }

    this.image2canvas = function(imgsrc) {
        var imageObj = new Image()
        var parent = this
        imageObj.onload = function() {
            parent.canvas.width = imageObj.width
            parent.canvas.height = imageObj.height
            parent.context.drawImage(imageObj, 0, 0)
            parent.width = imageObj.width
            parent.height = imageObj.height
            info('image2canvas Success (' + imgsrc + ')')
        }
        imageObj.src = imgsrc
        this.imgsrc = imgsrc
    }

    this.image2original = function() {
        if (this.imgsrc == "") {
            error("image2original Failed : Image Source not found!")
        } else if (this.imgsrc == "blank") {
            this.blank2canvas(this.width, this.height)
            info("image2original Success")
        } else {
            this.image2canvas(this.imgsrc)
            info("image2original Success")
        }
    }

    this.array2canvas = function(arr) {
        this.imageData = this.context.getImageData(0, 0, this.width, this.height)
        if (this.imageData.data.length != arr.length * 4) {
            error("array2canvas Failed to Execute")
            return false
        }
        for (var i = 0; i < arr.length; i++) {
            this.imageData.data[(i * 4)] = arr[i][0]
            this.imageData.data[(i * 4) + 1] = arr[i][1]
            this.imageData.data[(i * 4) + 2] = arr[i][2]
            this.imageData.data[(i * 4) + 3] = arr[i][3]
        }
        this.context.clearRect(0, 0, this.width, this.height)
        this.context.putImageData(this.imageData, 0, 0)
        info('Array2Canvas Success (' + this.imgsrc + ')')
    }

    this.hist2read = function(arr) {
        //checking
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] < 0 || arr[i] > 3) {
                error('hist2read Failed : Wrong parameter(' + arr[i] + ') : (' + this.imgsrc + ')')
                return false
            }
        }
        //end of checking
        var read = this.image2read()
        var resArr = new Array()
        for (var i = 0; i < arr.length; i++) {
            var tempArr = new Array(read.length)
            for (var c = 0; c < read.length; c++) {
                tempArr[c] = read[c][arr[i]]
            }
            var tempArr = tempArr.sort()
            var fixedval = new Array(256)
            for (var init = 0; init < 256; init++) fixedval[init] = 0

            for (var a = 0; a < tempArr.length; a++) {
                fixedval[tempArr[a]]++
            }
            resArr.push(fixedval)
        }
        return resArr
    }

    this.hist2canvas = function(arr, fontsize) {
        if (arr == undefined) {
            error("hist2canvas Failed to execute")
            return false
        }
        var wc = this.width
        var hc = this.height
        var max = Math.max.apply(null, arr)
        var gmax = max - (max % 100) + 100
        var gmid = Math.ceil(gmax / 2)
        var context = this.context
        var margin = 5
        context.clearRect(0, 0, this.width, this.height)

        context.fillStyle = "#f0f0f0";
        context.fillRect(0, 0, wc, hc);

        context.font = fontsize + "px Arial";
        var txt1 = gmax
        var txt2 = gmid

        widthfontmax = context.measureText(txt1).width
        widthfontmid = context.measureText(txt2).width

        context.fillStyle = "#000000";
        context.fillText(txt1, margin, fontsize);

        context.beginPath();

        context.moveTo(widthfontmax + margin * 2, 0);
        context.lineTo(widthfontmax + margin * 2, hc);

        context.moveTo(0, (hc - margin * 2));
        context.lineTo(wc, (hc - margin * 2));

        if (gmid == gmax) {
            gmid = -1
            txt2 = ""
        } else {
            context.fillStyle = "#000000";
            context.fillText(txt2, margin, fontsize + ((hc / 2) - margin * 2));
        }

        var marginbottom = (margin * 2)
        var histheight = hc - marginbottom - (widthfontmax / 2)
        var histwidth = wc - 2 * margin - widthfontmax - 1

        for (var i = 0; i < arr.length; i++) {
            context.moveTo(2 * margin + widthfontmax + 1 + (((i + 1) / 256) * histwidth), hc - ((arr[i] / gmax) * histheight) - marginbottom)
            context.lineTo(2 * margin + widthfontmax + 1 + (((i + 1) / 256) * histwidth), (hc - marginbottom));
        }

        context.strokeStyle = '#000000';
        context.stroke();

        var grad = context.createLinearGradient(2 * margin + widthfontmax + 1, hc, wc, hc);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(1, '#ffffff');

        context.fillStyle = grad;
        context.fillRect(2 * margin + widthfontmax + 1, hc - marginbottom, wc, hc);

        info("Hist2canvas Success")
    }

    this.i2x = function(i) {
        return (i % this.width)
    }

    this.i2y = function(i) {
        return ((i - (i % this.width)) / this.width)
    }

    this.xy2i = function(x, y) {
        return (y * this.width) + (x)
    }
}