
(() => {
  'use strict';
  const root=document.querySelector('.emerald-viewer');
  if(!root)return;
  const canvas=root.querySelector('canvas');
  const geometry={"vertices":[[-0.41759999999999997,0.48,-0.8235999999999999],[0.41759999999999997,0.48,-0.8235999999999999],[0.58,0.48,-0.592992],[0.58,0.48,0.592992],[0.41759999999999997,0.48,0.8235999999999999],[-0.41759999999999997,0.48,0.8235999999999999],[-0.58,0.48,0.592992],[-0.58,0.48,-0.592992],[-0.5472,0.32,-1.0792],[0.5472,0.32,-1.0792],[0.76,0.32,-0.7770239999999999],[0.76,0.32,0.7770239999999999],[0.5472,0.32,1.0792],[-0.5472,0.32,1.0792],[-0.76,0.32,0.7770239999999999],[-0.76,0.32,-0.7770239999999999],[-0.6552,0.15,-1.2922],[0.6552,0.15,-1.2922],[0.91,0.15,-0.930384],[0.91,0.15,0.930384],[0.6552,0.15,1.2922],[-0.6552,0.15,1.2922],[-0.91,0.15,0.930384],[-0.91,0.15,-0.930384],[-0.72,0.025,-1.42],[0.72,0.025,-1.42],[1,0.025,-1.0224],[1,0.025,1.0224],[0.72,0.025,1.42],[-0.72,0.025,1.42],[-1,0.025,1.0224],[-1,0.025,-1.0224],[-0.72,-0.025,-1.42],[0.72,-0.025,-1.42],[1,-0.025,-1.0224],[1,-0.025,1.0224],[0.72,-0.025,1.42],[-0.72,-0.025,1.42],[-1,-0.025,1.0224],[-1,-0.025,-1.0224],[-0.5903999999999999,-0.28,-1.1643999999999999],[0.5903999999999999,-0.28,-1.1643999999999999],[0.82,-0.28,-0.8383679999999999],[0.82,-0.28,0.8383679999999999],[0.5903999999999999,-0.28,1.1643999999999999],[-0.5903999999999999,-0.28,1.1643999999999999],[-0.82,-0.28,0.8383679999999999],[-0.82,-0.28,-0.8383679999999999],[-0.3744,-0.57,-0.7384],[0.3744,-0.57,-0.7384],[0.52,-0.57,-0.531648],[0.52,-0.57,0.531648],[0.3744,-0.57,0.7384],[-0.3744,-0.57,0.7384],[-0.52,-0.57,0.531648],[-0.52,-0.57,-0.531648],[-0.0252,-0.84,-0.0497],[0.0252,-0.84,-0.0497],[0.035,-0.84,-0.035783999999999996],[0.035,-0.84,0.035783999999999996],[0.0252,-0.84,0.0497],[-0.0252,-0.84,0.0497],[-0.035,-0.84,0.035783999999999996],[-0.035,-0.84,-0.035783999999999996]],"faces":[[7,6,5,4,3,2,1,0],[0,1,9,8],[1,2,10,9],[2,3,11,10],[3,4,12,11],[4,5,13,12],[5,6,14,13],[6,7,15,14],[7,0,8,15],[8,9,17,16],[9,10,18,17],[10,11,19,18],[11,12,20,19],[12,13,21,20],[13,14,22,21],[14,15,23,22],[15,8,16,23],[16,17,25,24],[17,18,26,25],[18,19,27,26],[19,20,28,27],[20,21,29,28],[21,22,30,29],[22,23,31,30],[23,16,24,31],[24,25,33,32],[25,26,34,33],[26,27,35,34],[27,28,36,35],[28,29,37,36],[29,30,38,37],[30,31,39,38],[31,24,32,39],[32,33,41,40],[33,34,42,41],[34,35,43,42],[35,36,44,43],[36,37,45,44],[37,38,46,45],[38,39,47,46],[39,32,40,47],[40,41,49,48],[41,42,50,49],[42,43,51,50],[43,44,52,51],[44,45,53,52],[45,46,54,53],[46,47,55,54],[47,40,48,55],[48,49,57,56],[49,50,58,57],[50,51,59,58],[51,52,60,59],[52,53,61,60],[53,54,62,61],[54,55,63,62],[55,48,56,63],[56,57,58,59,60,61,62,63]],"planes":[[0,1,0,0.48],[0,0.8476254856023485,-0.5305949831626593,0.8438582612218934],[0.4368454279061476,0.8452959029983959,-0.3076376252860195,0.8415390323184029],[0.6643638388299197,0.7474093186836599,0,0.7440874994895101],[0.43684542790614744,0.8452959029983959,0.3076376252860194,0.8415390323184027],[0,0.8476254856023485,0.5305949831626593,0.8438582612218934],[-0.4368454279061476,0.8452959029983959,0.3076376252860195,0.8415390323184029],[-0.6643638388299197,0.7474093186836599,0,0.7440874994895101],[-0.43684542790614744,0.8452959029983959,-0.3076376252860194,0.8415390323184027],[0,0.781584278954092,-0.6237996592591343,0.9233115615377672],[0.5130441326475031,0.7786199189591518,-0.3612986849630303,0.9198096642637447],[0.7498378553650925,0.6616216370868463,0,0.7815956939452611],[0.5130441326475031,0.7786199189591518,0.3612986849630303,0.9198096642637446],[0,0.781584278954092,0.6237996592591343,0.9233115615377672],[-0.5130441326475031,0.7786199189591518,0.3612986849630303,0.9198096642637447],[-0.7498378553650925,0.6616216370868463,0,0.7815956939452611],[-0.5130441326475031,0.7786199189591518,-0.3612986849630303,0.9198096642637446],[0,0.7148948109850453,-0.6992320138742623,1.0107818299760785],[0.5745259562466483,0.711492944215849,-0.4045957438356678,1.0059719683496313],[0.8115343414514944,0.5843047258450758,0,0.8261419595976213],[0.5745259562466483,0.711492944215849,0.4045957438356678,1.0059719683496313],[0,0.7148948109850453,0.6992320138742623,1.0107818299760785],[-0.5745259562466483,0.711492944215849,0.4045957438356678,1.0059719683496313],[-0.8115343414514944,0.5843047258450758,0,0.8261419595976213],[-0.5745259562466483,0.711492944215849,-0.4045957438356678,1.0059719683496313],[0,0,-1,1.42],[0.8176056393931193,0,-0.5757786192909292,1.4062816997561653],[1,0,0,1],[0.8176056393931193,0,0.5757786192909292,1.4062816997561653],[0,0,1,1.42],[-0.8176056393931193,0,0.5757786192909292,1.4062816997561653],[-1,0,0,1],[-0.8176056393931193,0,-0.5757786192909292,1.4062816997561653],[0,-0.7079372052018545,-0.7062753807764979,1.0206094708326734],[0.5802573871625457,-0.7045007335902911,-0.4086319627905252,1.015655224259336],[0.8169678632647616,-0.5766831975986554,0,0.831384943204728],[0.5802573871625457,-0.7045007335902912,0.4086319627905252,1.015655224259336],[0,-0.7079372052018545,0.7062753807764979,1.0206094708326734],[-0.5802573871625457,-0.7045007335902911,0.4086319627905252,1.015655224259336],[-0.8169678632647616,-0.5766831975986554,0,0.831384943204728],[-0.5802573871625457,-0.7045007335902912,-0.4086319627905252,1.015655224259336],[0,-0.8266376588079838,-0.5627345564655288,0.8867066620146972],[0.463147706472998,-0.824083505310576,-0.3261603566711254,0.8839669066964777],[0.6950220968474748,-0.718988376049112,0,0.7712348647086806],[0.463147706472998,-0.824083505310576,0.3261603566711254,0.8839669066964777],[0,-0.8266376588079838,0.5627345564655288,0.8867066620146972],[-0.463147706472998,-0.824083505310576,0.3261603566711254,0.8839669066964777],[-0.6950220968474748,-0.718988376049112,0,0.7712348647086806],[-0.463147706472998,-0.824083505310576,-0.3261603566711254,0.8839669066964777],[0,-0.9310092308908113,-0.36499563284524333,0.8001880369006902],[0.3009408555801411,-0.9297957841664953,-0.21193017998601496,0.7991450982057806],[0.48640753703992856,-0.8737320572754272,0,0.7509591919077563],[0.3009408555801411,-0.9297957841664953,0.21193017998601496,0.7991450982057805],[0,-0.9310092308908113,0.36499563284524333,0.8001880369006902],[-0.3009408555801411,-0.9297957841664953,0.21193017998601496,0.7991450982057806],[-0.48640753703992856,-0.8737320572754272,0,0.7509591919077563],[-0.3009408555801411,-0.9297957841664953,-0.21193017998601496,0.7991450982057805],[0,-1,0,0.84]]};
  const initialTilt=-Math.atan2(5.4,2.9);
  let ax=initialTilt,ay=0,targetX=ax,targetY=ay,frame=0,w=0,h=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});
  let drawGL;
  if(gl){
    const vs='attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
    const fs=`precision highp float;
      uniform vec2 size;uniform vec2 angle;uniform vec3 bg;uniform vec4 planes[58];
      mat3 rotation(){float a=angle.x,b=angle.y;mat3 x=mat3(1.,0.,0.,0.,cos(a),sin(a),0.,-sin(a),cos(a));mat3 y=mat3(cos(b),0.,-sin(b),0.,1.,0.,sin(b),0.,cos(b));return y*x;}
      vec3 studio(vec3 d){
        vec3 c=vec3(.025,.045,.042)+vec3(.13,.2,.17)*max(d.y,0.);
        float panel=pow(max(dot(d,normalize(vec3(-1.,1.6,1.4))),0.),65.);
        float strip=pow(max(dot(d,normalize(vec3(1.,.5,1.))),0.),170.);
        float rim=pow(max(dot(d,normalize(vec3(.15,-.3,-1.))),0.),32.);
        c+=vec3(3.5,4.,3.8)*panel+vec3(4.5,3.8,2.8)*strip+vec3(.7,1.5,1.2)*rim;
        float bars=smoothstep(.94,.985,abs(sin(atan(d.x,d.z)*7.)))*smoothstep(-.1,.3,d.y);
        return c+bars*.24;
      }
      bool hit(vec3 o,vec3 d,out float lo,out float hi,out vec3 nearN,out vec3 farN){
        lo=-10000.;hi=10000.;nearN=vec3(0.);farN=vec3(0.);
        for(int i=0;i<58;i++){
          vec3 n=planes[i].xyz;float den=dot(n,d),dist=planes[i].w-dot(n,o);
          if(abs(den)<.000001){if(dist<0.)return false;}
          else {float t=dist/den;if(den<0.){if(t>lo){lo=t;nearN=n;}}else{if(t<hi){hi=t;farN=n;}}}
        }
        return hi>=max(lo,0.);
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy-.5*size)/size.y;
        mat3 rot=rotation();
        vec3 o=rot*vec3(0.,2.9,5.4);vec3 forward=normalize(vec3(0.,-2.9,-5.4));
        vec3 right=vec3(1.,0.,0.);vec3 up=normalize(cross(right,forward));
        vec3 d=rot*normalize(forward+uv.x*right*.75+uv.y*up*.75);
        float lo,hi;vec3 n,farN;
        float halo=exp(-dot(uv,uv)*3.);vec3 background=bg+vec3(.015,.045,.028)*halo;
        if(!hit(o,d,lo,hi,n,farN)){gl_FragColor=vec4(background,1.);return;}
        vec3 p=o+d*lo;float fres=.049+.951*pow(1.-max(0.,dot(-d,n)),5.);
        vec3 col=studio(reflect(d,n))*fres;
        vec3 dir=refract(d,n,1./1.57);vec3 throughput=vec3(1.-fres);
        p+=dir*.0008;
        for(int bounce=0;bounce<6;bounce++){
          if(!hit(p,dir,lo,hi,n,farN))break;
          throughput*=exp(-vec3(1.65,.16,.78)*hi);
          p+=dir*hi;
          vec3 exitRay=refract(dir,-farN,1.57);
          if(dot(exitRay,exitRay)>.01){
            float f=.049+.951*pow(1.-abs(dot(dir,farN)),5.);
            col+=throughput*studio(exitRay)*(1.-f);throughput*=f;
          }
          dir=reflect(dir,farN);p+=dir*.0008;
        }
        col+=throughput*vec3(.025,.16,.07);
        col=pow(col/(col+vec3(.7)),vec3(.4545));
        gl_FragColor=vec4(col,1.);
      }`;
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
    try{
      const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      gl.uniform4fv(gl.getUniformLocation(program,'planes[0]'),new Float32Array(geometry.planes.flat()));
      const size=gl.getUniformLocation(program,'size'),angle=gl.getUniformLocation(program,'angle'),bg=gl.getUniformLocation(program,'bg');
      drawGL=()=>{
        gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(size,canvas.width,canvas.height);gl.uniform2f(angle,ax,ay);
        gl.uniform3f(bg,.024,.075,.052);gl.drawArrays(gl.TRIANGLES,0,6);
      };
    }catch(error){console.warn('Using faceted preview:',error.message);}
  }
  let ctx;
  let visible=false;
  if(!drawGL){
    const replacement=canvas.cloneNode();canvas.replaceWith(replacement);
    ctx=replacement.getContext('2d');
    if(!ctx)return;
  }
  const activeCanvas=ctx?root.querySelector('canvas'):canvas;
  root.classList.add('is-rendered');
  function fallback(){
    ctx.clearRect(0,0,w,h);const scale=Math.min(w*.27,h*.29);
    const pts=geometry.vertices.map(([x,y,z])=>{const a=y*Math.cos(ax)-z*Math.sin(ax),b=y*Math.sin(ax)+z*Math.cos(ax);return [x*Math.cos(ay)+b*Math.sin(ay),a,-x*Math.sin(ay)+b*Math.cos(ay)];});
    geometry.faces.map((f,i)=>({f,i,z:f.reduce((s,j)=>s+pts[j][2],0)/f.length})).sort((a,b)=>a.z-b.z).forEach(({f,i})=>{
      ctx.beginPath();f.forEach((j,k)=>{const p=pts[j],s=scale*6/(6-p[2]);k?ctx.lineTo(w/2+p[0]*s,h/2-p[1]*s):ctx.moveTo(w/2+p[0]*s,h/2-p[1]*s);});ctx.closePath();
      ctx.fillStyle='hsl(151 77% '+(16+(i*13%34))+'%)';ctx.fill();ctx.strokeStyle='rgba(166,244,205,.3)';ctx.lineWidth=.7;ctx.stroke();
    });
  }
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function draw(){frame=0;if(!visible||document.hidden||!w||!h)return;ax+=(targetX-ax)*.14;ay+=(targetY-ay)*.14;if(drawGL)drawGL();else fallback();if(Math.abs(ax-targetX)+Math.abs(ay-targetY)>.001)schedule();}
  function sync(){if(reduced.matches){ax=targetX;ay=targetY;}schedule();}
  let dragging=false,lastX=0,lastY=0;
  activeCanvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;activeCanvas.setPointerCapture(e.pointerId);});
  activeCanvas.addEventListener('pointermove',e=>{
    if(dragging){targetY+=(e.clientX-lastX)*.012;targetX+=(e.clientY-lastY)*.009;lastX=e.clientX;lastY=e.clientY;}
    else if(e.pointerType==='mouse'){const r=activeCanvas.getBoundingClientRect();targetY=((e.clientX-r.left)/r.width-.5)*1.5;targetX=initialTilt+((e.clientY-r.top)/r.height-.5)*.6;}
    targetX=Math.max(-1.39,Math.min(1.39,targetX));targetY=((targetY+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;sync();
  });
  activeCanvas.addEventListener('pointerup',()=>{dragging=false;});activeCanvas.addEventListener('pointercancel',()=>{dragging=false;});
  new ResizeObserver(()=>{const r=activeCanvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=drawGL?Math.min(devicePixelRatio||1,1.25):Math.min(devicePixelRatio||1,2);activeCanvas.width=Math.round(w*dpr);activeCanvas.height=Math.round(h*dpr);if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);schedule();}).observe(activeCanvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();}).observe(root);
  visible=true;
  requestAnimationFrame(()=>{schedule();});
  document.addEventListener('visibilitychange',schedule);
  root.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;
    e.preventDefault();
    if(e.key==='Home'){targetX=initialTilt;targetY=0;}
    else {targetY+=e.key==='ArrowRight'?.15:e.key==='ArrowLeft'?-.15:0;targetX+=e.key==='ArrowDown'?.12:e.key==='ArrowUp'?-.12:0;}
    targetX=Math.max(-1.39,Math.min(1.39,targetX));sync();
  });
})();
