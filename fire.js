    function setskip() {
        if (v<=100) skip = 20;
        else if (v>=800) skip = 2;
        else {
            skip = Math.floor(2000/v);
        }
        if (v>500) wavlen = 20;
        if (v>650) wavlen = 25;
    }

    function speed_change() {
        v = parseInt(speeder.value)/3.6;
        vv = v*v;
        ww = cc - vv;
        setskip();
        draw();
    }

    function dist_change() {
        h = parseInt(dister.value);
        Ry = h;
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
        if (sound) {
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
        ctx.canvas.width = sWidth;
        ctx.canvas.height = sHeight;
        rescale = sWidth / width;
        x0 = sWidth / 2;
        y0 = sHeight / 2;
        document.getElementById('TEXT1').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT1').style.width = '' + sWidth + 'px';
        document.getElementById('TEXT2').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT2').style.width = '' + sWidth + 'px';

        if (ring == 0) draw();
    }

    function resizedraw() {
        resize();
        draw();
    }

    function init() {
        ring = 0;
        speeder.value = (v*3.6).toFixed(0);
        dister.value = h;

        setskip();
        
        document.addEventListener("keydown", keyb)
        window.addEventListener("orientationchange", resize, false);
        window.addEventListener("resize", resize, false);
        resize();

        oscillator.type = "square"; // sine, square, sawthooth, triangle
        oscillator.frequency.value = freq;
        oscillator.connect(gainL);
        gainL.gain.value = 0;
        gainL.connect(merger,0,0);
        oscillatorx.type = "square"; // sine, square, sawthooth, triangle
        oscillatorx.frequency.value = freq;
        oscillatorx.connect(gainR);
        gainR.gain.value = 0;
        gainR.connect(merger,0,1);
        merger.connect(context.destination);

    }

    function restart() {
        stop();
        
        Ex = -width/2;
        Ey = 0 ;
        t = 0;
        steps = 0;
        wavt = [];
        wavx = [];
        wavy = [];
        wavcnt = 0;
        
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
        amp = cnt - wavcnt;
        if (amp < 0) amp = 0;
        wavcnt = cnt;

        draw();

        var p = t - Math.floor(t/tp)*tp;
        if (p < t1) freq = freq1 + df1*p;
        else freq = freq2 - df2*(p-t1);

        var x = Ex - Rx;
        var xx = x*x;
        var xv = 2*x*v;
        var ll = xx+h*h;
        var D = 4*(xx*vv+ww*ll)
        var fn = 0;
        var tt,ttt;
        if (v==c&&x>0) {
            fn = 1;
            tt = ll / xv;        
        } else if (ww>0) {
                fn = 1;
                tt = (Math.sqrt(D)-xv) / (2*ww);
        } else if (ww<0&&D>0&&x>0) {
            fn = 2;
            tt = (Math.sqrt(D)+xv) / (-2*ww);
            ttt = (Math.sqrt(D)-xv) / (2*ww);
        }
        if (fn==0) {
            gleft = 0;
            gright = 0;
            gainL.gain.value = 0;
            gainR.gain.value = 0;
        } else if (fn == 1) {
            var d = v*tt - x;
            var cosine = d / Math.sqrt(d*d + h*h);
            var ratio = 1 - v * cosine / c;
            freqq = freq / ratio;
            oscillator.frequency.setValueAtTime(freqq, 0);
            oscillatorx.frequency.setValueAtTime(freqq, 0);
            var r = d/width;
            if (r < -1) r = -1;
            else if (r > 1) r = 1;
            gleft = 1 - r;
            gright = 1 + r;
            if (sound) {
                gainL.gain.value = gleft;
                gainR.gain.value = gright;
            }
        } else {
            var d =  v*tt - x;
            var cosine = d / Math.sqrt(d*d + h*h);
            var ratio = v * cosine / c - 1;
            freqq = freq / ratio;
            oscillator.frequency.setValueAtTime(freqq, 0);
            d = x - v*ttt;
            cosine = d / Math.sqrt(d*d + h*h);
            ratio = v * cosine / c + 1;
            freqqq = freq / ratio;
            oscillatorx.frequency.setValueAtTime(freqqq, 0);
            gleft = 1;
            gright = 1;
            if (sound) {
                gainL.gain.value = gleft;
                gainR.gain.value = gright;
            }
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
        if (amp > 0) {
            dr = 3;
            ctx.fillStyle = rec_style;
        } else 
            ctx.fillStyle = rec_style;
        ctx.beginPath();
        ctx.arc(x0+Rx*rescale, y0+Ry*rescale, rec_rad+dr, 0, Math.PI * 2, false);
        ctx.fill();

    }