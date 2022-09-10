    function speed_change() {
        v = parseInt(speeder.value);
        draw();
    }

    function cpeed_change() {
        c = parseInt(cpeeder.value);
        draw();
    }

    function dist_change() {
        h = parseInt(dister.value);
        Ry = h;
        draw();
    }

    function skip_change() {
        skip = parseInt(skiper.value);
        draw();
    }

    function freq_change() {
        freq = parseInt(freqer.value);
        draw();
    }

    function keyb(e) {
        if (e.keyCode == 32) startstop();
        if (e.keyCode == 82) restart();
        if (e.keyCode == 77) mute();
    }

    function mute() {
        if (sound) {
            sound  = 0;
            document.getElementById('MUTE').innerHTML = "&#x1f50a;";
            gainL.gain.value = 0;
            gainR.gain.value = 0;
        } else {
            sound  = 1;
            document.getElementById('MUTE').innerHTML = "&#x1f507;";
            if (ring) {
                gainL.gain.value = gleft;
                gainR.gain.value = gright;
            }
        }
    }

    function startstop() {
        //     	canvas.style.left = "10px";
        //     	canvas.style.position = "absolute";
        if (ring == 0) start();
        else stop();
    }

    function start() {
        if (ring == 0) timer = window.setInterval(drawplus, speed);
        ring = 1;
        if (begin) {
            begin = 0;
            oscillator.start(0);
            oscillatorx.start(0);
        } 
        else if (sound) {
            gainL.gain.value = gleft;
            gainR.gain.value = gright;
        }
    }

    function stop() {
        ring = 0;
        window.clearInterval(timer);
        gainL.gain.value = 0;
        gainR.gain.value = 0;
    }

    function resize() {
        var cHeight = document.documentElement.clientHeight;
        var cWidth = document.documentElement.clientWidth;
        var oWidth = sWidth;
        sWidth = cWidth;
        sHeight = cHeight;
        sHeight -= vpadding;
//        if (sWidth > 650) sWidth = 650;
//        if (sHeight > 650) sHeight = 650;
//        sWidth = Math.min(sWidth, sHeight);
//        sHeight = sWidth;
        tHeight = sHeight * hr;
        if (tHeight > 80) tHeight = 80;
        sHeight -= tHeight;
        ctx.canvas.width = sWidth;
        ctx.canvas.height = sHeight;
        ctxx.canvas.width = sWidth;
        ctxx.canvas.height = tHeight;
        rescale = sWidth / width;
        x0 = sWidth / 2;
        y0 = sHeight / 2;
        baseline = tHeight - 10;
        if (baseline < 0) baseline = tHeight;
        gscale = (baseline-1) / ampmax;
        document.getElementById('TEXT1').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT1').style.width = '' + sWidth + 'px';
        document.getElementById('TEXT2').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT2').style.width = '' + sWidth + 'px';
        document.getElementById('TEXT3').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT3').style.width = '' + sWidth + 'px';
        document.getElementById('TEXT4').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT4').style.width = '' + sWidth + 'px';

        if (ring == 0) draw();
    }

    function resizedraw() {
        resize();
        draw();
    }

    function init() {
        ring = 0;
        speeder.value = v;
        cpeeder.value = c;
        freqer.value = freq;
        dister.value = h;
        skiper.value = skip;
        freqqtext = "ажиглагдах давтамж";

        Ex = -width/2;
        Ey = 0 ;
        Rx = 0;
        Ry = h;
        t = 0;
        steps = 0;
        wavt = [];
        wavx = [];
        wavy = [];
        wavcnt = 0;
        gx = [];
        gy = [];
        
        document.addEventListener("keydown", keyb)
        window.addEventListener("orientationchange", resize, false);
        window.addEventListener("resize", resize, false);
        resize();

        oscillator.type = "triangle"; // sine, square, sawthooth, triangle
        oscillator.frequency.value = freq;
        oscillator.connect(gainL);
        gainL.gain.value = gleft;
        gainL.connect(merger,0,0);
        oscillatorx.type = "triangle"; // sine, square, sawthooth, triangle
        oscillatorx.frequency.value = 1000;
        oscillatorx.connect(gainR);
        gainR.gain.value = gright;
        gainR.connect(merger,0,1);
        merger.connect(context.destination);

//        gainNode.gain.linearRampToValueAtTime(0.0001, context.currentTime + duration);

    }

    function restart() {
        stop();
        
        Ex = -width/2;
        Ey = 0 ;
        Rx = 0;
        Ry = h;
        t = 0;
        steps = 0;
        wavt = [];
        wavx = [];
        wavy = [];
        wavcnt = 0;
        gx = [];
        gy = [];
        
        draw();
    }

    function drawplus() {
        t += dt;
        Ex += v*dt;
        if (Ex*2 > width) {
            stop();
            return;
        }

        //Waves
        var cnt = 0;
        var r, rr;
//        n0 = wavx.length - wavlen;
//        if (n0 < 0) n0 = 0;        
        for (i = wavx.length - 1; i > 0; i--) {
            r = (t-wavt[i])*c;
            rr = (wavx[i]-Rx)*(wavx[i]-Rx) + (wavy[i]-Ry)*(wavy[i]-Ry);
            if (r*r>rr) cnt += 1;
        }
        var amp = cnt - wavcnt;
        if (amp < 0) amp = 0;
        wavcnt = cnt;
        gx.push(Ex);
        gy.push(amp);
        if (amp > ampmax) {
            ampmax = amp;
            gscale = (baseline-1) / ampmax;
        }   

        draw();
        var d = - Ex;
        var cosine = d / Math.sqrt(d*d + h*h);
        var ratio = 1 - v * cosine / c;
        freqq = freq / ratio;
        //oscillator.frequency.value = freqq;
        oscillator.frequency.setValueAtTime(freqq, 0);
        oscillatorx.frequency.setValueAtTime(freqq, 0);
        freqqer.innerHTML = freqqtext + ": " + freqq.toFixed(1) + 'Гц';
        var r = Ex*2/width;
        gleft = 1 - r;
        gright = 1 + r;
        if (sound) {
            gainL.gain.value = gleft;
            gainR.gain.value = gright;
        }

        steps += 1;
        if ((steps-1) % skip) return;
        wavt.push(t);
        wavx.push(Ex);
        wavy.push(Ey);
        if (wavx.length > wavmaxlen) {
            wavx.splice(0, wavx.length - wavlen);
            wavy.splice(0, wavy.length - wavlen);
            wavt.splice(0, wavt.length - wavlen);
        }
    }

    function draw() {
        
        ctx.clearRect(0, 0, sWidth, sHeight); // clear canvas

        //Emitter
        ctx.fillStyle = emi_style;
        ctx.beginPath();
        ctx.arc(x0+Ex*rescale, y0+Ey*rescale, emi_rad, 0, Math.PI * 2, false);
        ctx.fill();

        //Waves
        var opp = 1;
        var dopp, r;
        if (wavlen > 0) dopp = 0.99 / wavlen;
        else dopp = 1;
        n0 = wavx.length - wavlen;
        if (n0 < 0) n0 = 0;        
        for (i = wavx.length - 1; i > n0; i--) {
            r = (t-wavt[i])*c;
            ctx.strokeStyle = wav_style + opp + ')';
            ctx.beginPath();
            ctx.arc(x0+wavx[i]*rescale, y0+wavy[i]*rescale, r*rescale, 0, Math.PI * 2, false);
            ctx.stroke();
            opp -= dopp;
        }
        
        //Reciever
        var dr = 0;
        if (gy[gy.length-1] > 0) {
            dr = 3;
            ctx.fillStyle = rec_style;
        } else 
            ctx.fillStyle = rec_style;
        ctx.beginPath();
        ctx.arc(x0+Rx*rescale, y0+Ry*rescale, rec_rad+dr, 0, Math.PI * 2, false);
        ctx.fill();

        //Graph
        ctxx.clearRect(0, 0, sWidth, tHeight); // clear canvas
        ctxx.fillStyle = rec_style;
        ctxx.strokeStyle = rec_style;
        ctxx.beginPath();
        ctxx.moveTo(x0+gx[0]*rescale, baseline-gy[0]*gscale);
        for (i=1; i<gx.length; i++)
            ctxx.lineTo(x0+gx[i]*rescale, baseline-gy[i]*gscale);
        ctxx.stroke();
    }