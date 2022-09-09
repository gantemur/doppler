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
    }

    function stop() {
        ring = 0;
        window.clearInterval(timer);
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
        if (tHeight > 70) tHeight = 70;
        sHeight -= tHeight;
        ctx.canvas.width = sWidth;
        ctx.canvas.height = sHeight;
        ctxx.canvas.width = sWidth;
        ctxx.canvas.height = tHeight;
        rescale = sWidth / width;
        x0 = sWidth / 2;
        y0 = sHeight / 2;
        baseline = tHeight * 0.8;
        if (baseline < 60) baseline = 60;
        document.getElementById('TEXT1').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT1').style.width = '' + sWidth + 'px';
        document.getElementById('TEXT2').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT2').style.width = '' + sWidth + 'px';
        document.getElementById('TEXT3').setAttribute("style", "width:" + sWidth + "px");
        document.getElementById('TEXT3').style.width = '' + sWidth + 'px';
//        document.getElementById('TEXT4').setAttribute("style", "width:" + sWidth + "px");
//        document.getElementById('TEXT4').style.width = '' + sWidth + 'px';

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
//        freqer.value = freq;
        dister.value = h;
        skiper.value = skip;

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
        
        document.addEventListener("keydown", keyb)
        window.addEventListener("orientationchange", resize, false);
        window.addEventListener("resize", resize, false);
        resize();
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
        if (Ex > width/2) stop();
        draw();
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
        


        //freqqer.innerHTML = freqq_text + ": " + tlongsu.toFixed(1);

        ctx.clearRect(0, 0, sWidth, sHeight); // clear canvas

        //Emitter
        ctx.fillStyle = emi_style;
        ctx.beginPath();
        ctx.arc(x0+Ex*rescale, y0+Ey*rescale, emi_rad, 0, Math.PI * 2, false);
        ctx.fill();

        //Waves
        var cnt = 0;
        var opp = 1;
        var dopp, r, rr;
        if (wavlen > 0) dopp = 0.99 / wavlen;
        else dopp = 1;
        n0 = wavx.length - wavlen;
        if (n0 < 0) n0 = 0;        
        for (i = wavx.length - 1; i > 0; i--) {
            r = (t-wavt[i])*c;
            rr = (wavx[i]-Rx)*(wavx[i]-Rx) + (wavy[i]-Ry)*(wavy[i]-Ry);
            if (r*r>rr) cnt += 1;
            ctx.strokeStyle = wav_style + opp + ')';
            ctx.beginPath();
            ctx.arc(x0+wavx[i]*rescale, y0+wavy[i]*rescale, r*rescale, 0, Math.PI * 2, false);
            ctx.stroke();
            opp -= dopp;
        }
        var amp = cnt - wavcnt;
        if (amp < 0) amp = 0;
        wavcnt = cnt;
        
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

        //Graph
        var x = x0 + Ex * rescale;
        var y = baseline - amp * 20;
        gx.push(x);
        gy.push(y);
        ctxx.clearRect(0, 0, sWidth, tHeight); // clear canvas
        ctxx.fillStyle = rec_style;
        ctxx.strokeStyle = rec_style;
        ctxx.beginPath();
        ctxx.moveTo(gx[0], gy[0]);
        for (i=1; i<gx.length; i++)
            ctxx.lineTo(gx[i], gy[i]);
        ctxx.stroke();
    }