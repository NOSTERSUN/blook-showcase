/* BLOOK — branded Instagram Story image generator + share.
   window.bkIgStory(imgUrl, text, url):
     builds a 1080x1920 on-brand Story image (logo + product + URL on brand colours)
     then shares it via the native file-share sheet (→ Instagram → Add to Story),
     falling back to a download + open Instagram on desktop. */
(function(){
  var GOLD='#C9A96E', GOLDD='#A0784A', CREAM='#F4EFE8';

  // Make image same-origin so the canvas is never tainted (og:image may be an absolute blookliving.com URL).
  function sameOrigin(src){
    try{ var u=new URL(src, location.href); return (u.origin===location.origin)? u.href : u.pathname.replace(/^\//,''); }
    catch(e){ return src; }
  }
  function prettyUrl(u){ try{ return (u||'https://blookliving.com').replace(/^https?:\/\//,'').replace(/\/+$/,''); }catch(e){ return 'blookliving.com'; } }

  function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
  function cover(x,img,X,Y,w,h){
    var ir=img.width/img.height, tr=w/h, sw,sh,sx,sy;
    if(ir>tr){ sh=img.height; sw=sh*tr; sx=(img.width-sw)/2; sy=0; }
    else { sw=img.width; sh=sw/tr; sx=0; sy=(img.height-sh)/2; }
    x.drawImage(img,sx,sy,sw,sh,X,Y,w,h);
  }
  function spaced(x,str,cx,y,sp){
    var w=[],tot=0,i; for(i=0;i<str.length;i++){ var ww=x.measureText(str[i]).width; w.push(ww); tot+=ww+sp; } tot-=sp;
    var sx=cx-tot/2, a=x.textAlign; x.textAlign='left';
    for(i=0;i<str.length;i++){ x.fillText(str[i],sx,y); sx+=w[i]+sp; }
    x.textAlign=a;
  }
  function wrap(x,text,cx,y,maxW,lh,maxLines){
    var words=(text||'').split(/\s+/), line='', lines=[], i;
    for(i=0;i<words.length;i++){ var t=line?line+' '+words[i]:words[i]; if(x.measureText(t).width>maxW && line){ lines.push(line); line=words[i]; } else line=t; }
    if(line) lines.push(line);
    if(maxLines && lines.length>maxLines){ lines=lines.slice(0,maxLines); lines[maxLines-1]=lines[maxLines-1]+'…'; }
    var startY=y-(lines.length-1)*lh; // bottom-anchored
    for(i=0;i<lines.length;i++){ x.fillText(lines[i],cx,startY+i*lh); }
  }

  function build(img,text,url){
    var W=1080,H=1920, c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d');
    // background
    var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#241608'); g.addColorStop(.55,'#170D05'); g.addColorStop(1,'#0C0703');
    x.fillStyle=g; x.fillRect(0,0,W,H);
    var rgl=x.createRadialGradient(W/2,250,40,W/2,250,760); rgl.addColorStop(0,'rgba(201,169,110,.22)'); rgl.addColorStop(1,'rgba(201,169,110,0)');
    x.fillStyle=rgl; x.fillRect(0,0,W,860);
    // outer frame
    x.strokeStyle='rgba(201,169,110,.55)'; x.lineWidth=3; rr(x,40,40,W-80,H-80,28); x.stroke();
    // wordmark
    x.textAlign='center';
    x.fillStyle=GOLD; x.font='italic 600 134px Fraunces, Georgia, serif'; x.fillText('BLOOK',W/2,252);
    x.fillStyle='rgba(244,239,232,.72)'; x.font='500 30px Inter, Arial, sans-serif'; spaced(x,'THE CLASS OF CALM',W/2,304,10);
    // product card
    var cx=110,cy=360,cw=W-220,ch=1090,rad=30;
    x.save(); rr(x,cx,cy,cw,ch,rad); x.clip();
    if(img){ cover(x,img,cx,cy,cw,ch); } else { x.fillStyle='#2D2016'; x.fillRect(cx,cy,cw,ch); }
    var og=x.createLinearGradient(0,cy+ch-380,0,cy+ch); og.addColorStop(0,'rgba(12,7,3,0)'); og.addColorStop(1,'rgba(10,6,2,.86)');
    x.fillStyle=og; x.fillRect(cx,cy+ch-380,cw,380);
    x.restore();
    x.strokeStyle='rgba(201,169,110,.5)'; x.lineWidth=2; rr(x,cx,cy,cw,ch,rad); x.stroke();
    // title over card bottom
    x.fillStyle=CREAM; x.font='600 54px "IBM Plex Sans Thai", Fraunces, serif';
    wrap(x,text||'BLOOK LIVING',W/2,cy+ch-110,cw-130,68,2);
    // CTA pill with URL
    var pw=640,ph=108,px=(W-pw)/2,py=H-300;
    var pg=x.createLinearGradient(px,0,px+pw,0); pg.addColorStop(0,'#C9A96E'); pg.addColorStop(1,'#A0784A');
    x.fillStyle=pg; rr(x,px,py,pw,ph,ph/2); x.fill();
    x.fillStyle='#1A0F08'; x.textAlign='center';
    x.font='700 27px Inter, Arial, sans-serif'; spaced(x,'เยี่ยมชมเว็บไซต์ · SHOP NOW',W/2,py+44,1.5);
    x.font='600 36px Inter, Arial, sans-serif'; x.fillText(prettyUrl(url),W/2,py+86);
    // handle
    x.fillStyle='rgba(244,239,232,.58)'; x.font='500 27px Inter, Arial, sans-serif'; x.fillText('@blookliving',W/2,H-130);
    return c;
  }

  window.bkIgStory=function(imgUrl,text,url){
    imgUrl=sameOrigin(imgUrl||'assets/catalog/sofa-overview-1.jpg');
    url=url||location.href;
    var done=false;
    function finish(canvas){
      if(done) return; done=true;
      try{
        canvas.toBlob(function(blob){
          if(!blob){ return fail(); }
          var file=new File([blob],'blook-story.jpg',{type:'image/jpeg'});
          if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
            navigator.share({files:[file], text:(text||'BLOOK LIVING')+' · '+prettyUrl(url)}).catch(function(){ dl(blob); });
          } else { dl(blob); }
        },'image/jpeg',0.92);
      }catch(e){ fail(); }
    }
    function dl(blob){
      try{ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='blook-story.jpg'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(a.href);},3000); }catch(e){}
      alert('บันทึกรูป Story แล้ว 📷\nลิงก์ '+prettyUrl(url)+' อยู่ในภาพแล้ว — เปิด Instagram → Story → เลือกรูปนี้ แล้วเพิ่มสติกเกอร์ลิงก์ได้เลย');
      setTimeout(function(){ window.open('https://www.instagram.com/','_blank','noopener'); },400);
    }
    function fail(){ alert('สร้างภาพ Story ไม่สำเร็จ ลองใหม่อีกครั้งนะคะ'); }
    var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
    ready.then(function(){
      var img=new Image(); img.crossOrigin='anonymous';
      img.onload=function(){ finish(build(img,text,url)); };
      img.onerror=function(){ finish(build(null,text,url)); };
      img.src=imgUrl;
      setTimeout(function(){ if(!done) finish(build(null,text,url)); },4500);
    });
  };
  // expose builder for preview/testing
  window.bkBuildStoryCanvas=build;
})();
