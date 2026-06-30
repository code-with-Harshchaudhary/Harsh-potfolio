import { useEffect, useRef, useCallback } from 'react';

interface FluidConfig {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach(unit: number): number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap(): void;
}

interface ProgramInfo {
  prog: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  bind(): void;
}

const VS = `precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL; varying vec2 vR;
varying vec2 vT; varying vec2 vB;
uniform vec2 texelSize;
void main(){
  vUv=aPosition*0.5+0.5;
  vL=vUv-vec2(texelSize.x,0.0);
  vR=vUv+vec2(texelSize.x,0.0);
  vT=vUv+vec2(0.0,texelSize.y);
  vB=vUv-vec2(0.0,texelSize.y);
  gl_Position=vec4(aPosition,0.0,1.0);
}`;

const FS_CLEAR = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`;

const FS_DISPLAY = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uEdgeLow;
uniform float uEdgeHigh;
uniform float uGrayR;
uniform float uGrayG;
uniform float uGrayB;
uniform float uTime;
float hash(vec2 p){
  return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),
             mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);
}
void main(){
  vec3 dye=texture2D(uTexture,vUv).rgb;
  float density=max(dye.r,max(dye.g,dye.b));
  float alpha=smoothstep(uEdgeLow,uEdgeHigh,density);
  if(alpha<0.004){gl_FragColor=vec4(0.0);return;}
  vec2 nUv=vUv*8.0;
  float n=noise(nUv)*0.5+noise(nUv*2.0)*0.25+noise(nUv*4.0)*0.125;
  float rough=0.92+n*0.16;
  vec3 baseCol=vec3(uGrayR/255.0,uGrayG/255.0,uGrayB/255.0);
  vec3 col=baseCol*rough;
  col+=vec3(0.02,0.01,0.0)*sin(vUv.x*20.0+uTime)*0.5;
  gl_FragColor=vec4(col,alpha);
}`;

const FS_SPLAT = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main(){
  vec2 p=vUv-point;
  p.x*=aspectRatio;
  float s=exp(-dot(p,p)/radius);
  vec3 base=texture2D(uTarget,vUv).xyz;
  gl_FragColor=vec4(base+s*color,1.0);
}`;

const FS_ADVECTION_LINEAR = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main(){
  vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;
  gl_FragColor=dissipation*texture2D(uSource,coord);
  gl_FragColor.a=1.0;
}`;

const FS_ADVECTION_BILERP = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;
vec4 bilerp(sampler2D sam,vec2 uv,vec2 ts){
  vec2 st=uv/ts-0.5;
  vec2 iuv=floor(st);vec2 fuv=fract(st);
  vec4 a=texture2D(sam,(iuv+vec2(0.5,0.5))*ts);
  vec4 b=texture2D(sam,(iuv+vec2(1.5,0.5))*ts);
  vec4 c=texture2D(sam,(iuv+vec2(0.5,1.5))*ts);
  vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*ts);
  return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);
}
void main(){
  vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;
  gl_FragColor=dissipation*bilerp(uSource,coord,dyeTexelSize);
  gl_FragColor.a=1.0;
}`;

const FS_DIVERGENCE = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;varying vec2 vR;
varying vec2 vT;varying vec2 vB;
uniform sampler2D uVelocity;
void main(){
  float L=texture2D(uVelocity,vL).x;
  float R=texture2D(uVelocity,vR).x;
  float T=texture2D(uVelocity,vT).y;
  float B=texture2D(uVelocity,vB).y;
  vec2 C=texture2D(uVelocity,vUv).xy;
  if(vL.x<0.0)L=-C.x;
  if(vR.x>1.0)R=-C.x;
  if(vT.y>1.0)T=-C.y;
  if(vB.y<0.0)B=-C.y;
  gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0);
}`;

const FS_CURL = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;varying vec2 vR;
varying vec2 vT;varying vec2 vB;
uniform sampler2D uVelocity;
void main(){
  float L=texture2D(uVelocity,vL).y;
  float R=texture2D(uVelocity,vR).y;
  float T=texture2D(uVelocity,vT).x;
  float B=texture2D(uVelocity,vB).x;
  gl_FragColor=vec4(0.5*(R-L-T+B),0.0,0.0,1.0);
}`;

const FS_VORTICITY = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;varying vec2 vR;
varying vec2 vT;varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main(){
  float L=texture2D(uCurl,vL).x;
  float R=texture2D(uCurl,vR).x;
  float T=texture2D(uCurl,vT).x;
  float B=texture2D(uCurl,vB).x;
  float C=texture2D(uCurl,vUv).x;
  vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
  force/=length(force)+0.0001;
  force*=curl*C;
  force.y*=-1.0;
  vec2 vel=texture2D(uVelocity,vUv).xy+force*dt;
  gl_FragColor=vec4(clamp(vel,-1000.0,1000.0),0.0,1.0);
}`;

const FS_PRESSURE = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;varying vec2 vR;
varying vec2 vT;varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main(){
  float L=texture2D(uPressure,vL).x;
  float R=texture2D(uPressure,vR).x;
  float T=texture2D(uPressure,vT).x;
  float B=texture2D(uPressure,vB).x;
  float div=texture2D(uDivergence,vUv).x;
  gl_FragColor=vec4((L+R+B+T-div)*0.25,0.0,0.0,1.0);
}`;

const FS_GRAD_SUBTRACT = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;varying vec2 vR;
varying vec2 vT;varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main(){
  float L=texture2D(uPressure,vL).x;
  float R=texture2D(uPressure,vR).x;
  float T=texture2D(uPressure,vT).x;
  float B=texture2D(uPressure,vB).x;
  vec2 vel=texture2D(uVelocity,vUv).xy-vec2(R-L,T-B);
  gl_FragColor=vec4(vel,0.0,1.0);
}`;

const DEFAULT_CONFIG: FluidConfig = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 0.980,
  VELOCITY_DISSIPATION: 0.995,
  PRESSURE: 0.80,
  PRESSURE_ITERATIONS: 20,
  CURL: 25,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
};

export function useFluidSim(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programsRef = useRef<Record<string, ProgramInfo>>({});
  const fboRef = useRef<{
    velocity: DoubleFBO;
    dye: DoubleFBO;
    divergence: FBO;
    curl: FBO;
    pressure: DoubleFBO;
  } | null>(null);
  const extRef = useRef<{ halfFloat: number; linearFiltering: boolean; internalFormat: number; format: number } | null>(null);
  const lastTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const configRef = useRef<FluidConfig>({ ...DEFAULT_CONFIG });

  const getResolution = useCallback((res: number, gl: WebGLRenderingContext) => {
    let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (ar < 1) ar = 1.0 / ar;
    const mn = Math.round(res), mx = Math.round(res * ar);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: mx, height: mn } : { width: mn, height: mx };
  }, []);

  const compileShader = useCallback((gl: WebGLRenderingContext, type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[FluidSim] Shader:', gl.getShaderInfoLog(s));
    }
    return s;
  }, []);

  const createProgram = useCallback((gl: WebGLRenderingContext, fsSrc: string): ProgramInfo => {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(prog, 0, 'aPosition');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[FluidSim] Link:', gl.getProgramInfoLog(prog));
    }
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(prog, i)!;
      uniforms[info.name] = gl.getUniformLocation(prog, info.name);
    }
    return { prog, uniforms, bind: () => gl.useProgram(prog) };
  }, [compileShader]);

  const createFBO = useCallback((gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO => {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture: tex, fbo, width: w, height: h,
      texelSizeX: 1.0 / w, texelSizeY: 1.0 / h,
      attach(unit: number) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return unit;
      }
    };
  }, []);

  const createDoubleFBO = useCallback((gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO => {
    const fbo1 = createFBO(gl, w, h, internalFormat, format, type, filter);
    const fbo2 = createFBO(gl, w, h, internalFormat, format, type, filter);
    return {
      width: w, height: h,
      texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
      _a: fbo1, _b: fbo2,
      get read() { return this._a; },
      get write() { return this._b; },
      swap() { const t = this._a; this._a = this._b; this._b = t; }
    };
  }, [createFBO]);

  const initPrograms = useCallback((gl: WebGLRenderingContext) => {
    const ext = extRef.current!;
    const advFS = ext.linearFiltering ? FS_ADVECTION_LINEAR : FS_ADVECTION_BILERP;
    programsRef.current = {
      clear: createProgram(gl, FS_CLEAR),
      display: createProgram(gl, FS_DISPLAY),
      splat: createProgram(gl, FS_SPLAT),
      advection: createProgram(gl, advFS),
      divergence: createProgram(gl, FS_DIVERGENCE),
      curl: createProgram(gl, FS_CURL),
      vorticity: createProgram(gl, FS_VORTICITY),
      pressure: createProgram(gl, FS_PRESSURE),
      gradSubtract: createProgram(gl, FS_GRAD_SUBTRACT),
    };

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, -1,1, 1,1, -1,-1, 1,1, 1,-1]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
  }, [createProgram]);

  const initFramebuffers = useCallback((gl: WebGLRenderingContext) => {
    const cfg = configRef.current;
    const ext = extRef.current!;
    const simRes = getResolution(cfg.SIM_RESOLUTION, gl);
    const dyeRes = getResolution(cfg.DYE_RESOLUTION, gl);
    const filter = ext.linearFiltering ? gl.LINEAR : gl.NEAREST;
    const IF = ext.internalFormat, F = ext.format, T = ext.halfFloat;
    gl.disable(gl.BLEND);
    fboRef.current = {
      velocity: createDoubleFBO(gl, simRes.width, simRes.height, IF, F, T, filter),
      dye: createDoubleFBO(gl, dyeRes.width, dyeRes.height, IF, F, T, filter),
      divergence: createFBO(gl, simRes.width, simRes.height, IF, F, T, gl.NEAREST),
      curl: createFBO(gl, simRes.width, simRes.height, IF, F, T, gl.NEAREST),
      pressure: createDoubleFBO(gl, simRes.width, simRes.height, IF, F, T, gl.NEAREST),
    };
  }, [getResolution, createDoubleFBO, createFBO]);

  const resizeCanvas = useCallback((gl: WebGLRenderingContext, canvas: HTMLCanvasElement) => {
    const w = window.innerWidth, h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      initFramebuffers(gl);
    }
  }, [initFramebuffers]);

  const blit = useCallback((gl: WebGLRenderingContext, target: FBO | null) => {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, []);

  const step = useCallback((gl: WebGLRenderingContext, dt: number) => {
    const cfg = configRef.current;
    const p = programsRef.current;
    const fbo = fboRef.current!;
    gl.disable(gl.BLEND);

    p.curl.bind();
    gl.uniform2f(p.curl.uniforms.texelSize, fbo.velocity.texelSizeX, fbo.velocity.texelSizeY);
    gl.uniform1i(p.curl.uniforms.uVelocity, fbo.velocity.read.attach(0));
    blit(gl, fbo.curl);

    p.vorticity.bind();
    gl.uniform2f(p.vorticity.uniforms.texelSize, fbo.velocity.texelSizeX, fbo.velocity.texelSizeY);
    gl.uniform1i(p.vorticity.uniforms.uVelocity, fbo.velocity.read.attach(0));
    gl.uniform1i(p.vorticity.uniforms.uCurl, fbo.curl.attach(1));
    gl.uniform1f(p.vorticity.uniforms.curl, cfg.CURL);
    gl.uniform1f(p.vorticity.uniforms.dt, dt);
    blit(gl, fbo.velocity.write); fbo.velocity.swap();

    p.divergence.bind();
    gl.uniform2f(p.divergence.uniforms.texelSize, fbo.velocity.texelSizeX, fbo.velocity.texelSizeY);
    gl.uniform1i(p.divergence.uniforms.uVelocity, fbo.velocity.read.attach(0));
    blit(gl, fbo.divergence);

    p.clear.bind();
    gl.uniform1i(p.clear.uniforms.uTexture, fbo.pressure.read.attach(0));
    gl.uniform1f(p.clear.uniforms.value, cfg.PRESSURE);
    blit(gl, fbo.pressure.write); fbo.pressure.swap();

    p.pressure.bind();
    gl.uniform2f(p.pressure.uniforms.texelSize, fbo.velocity.texelSizeX, fbo.velocity.texelSizeY);
    gl.uniform1i(p.pressure.uniforms.uDivergence, fbo.divergence.attach(0));
    for (let i = 0; i < cfg.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(p.pressure.uniforms.uPressure, fbo.pressure.read.attach(1));
      blit(gl, fbo.pressure.write); fbo.pressure.swap();
    }

    p.gradSubtract.bind();
    gl.uniform2f(p.gradSubtract.uniforms.texelSize, fbo.velocity.texelSizeX, fbo.velocity.texelSizeY);
    gl.uniform1i(p.gradSubtract.uniforms.uPressure, fbo.pressure.read.attach(0));
    gl.uniform1i(p.gradSubtract.uniforms.uVelocity, fbo.velocity.read.attach(1));
    blit(gl, fbo.velocity.write); fbo.velocity.swap();

    p.advection.bind();
    gl.uniform2f(p.advection.uniforms.texelSize, fbo.velocity.texelSizeX, fbo.velocity.texelSizeY);
    if (!extRef.current!.linearFiltering)
      gl.uniform2f(p.advection.uniforms.dyeTexelSize, fbo.velocity.texelSizeX, fbo.velocity.texelSizeY);
    gl.uniform1i(p.advection.uniforms.uVelocity, fbo.velocity.read.attach(0));
    gl.uniform1i(p.advection.uniforms.uSource, fbo.velocity.read.attach(0));
    gl.uniform1f(p.advection.uniforms.dt, dt);
    gl.uniform1f(p.advection.uniforms.dissipation, cfg.VELOCITY_DISSIPATION);
    blit(gl, fbo.velocity.write); fbo.velocity.swap();

    if (!extRef.current!.linearFiltering)
      gl.uniform2f(p.advection.uniforms.dyeTexelSize, fbo.dye.texelSizeX, fbo.dye.texelSizeY);
    gl.uniform1i(p.advection.uniforms.uVelocity, fbo.velocity.read.attach(0));
    gl.uniform1i(p.advection.uniforms.uSource, fbo.dye.read.attach(1));
    gl.uniform1f(p.advection.uniforms.dissipation, cfg.DENSITY_DISSIPATION);
    blit(gl, fbo.dye.write); fbo.dye.swap();
  }, [blit]);

  const render = useCallback((gl: WebGLRenderingContext) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const p = programsRef.current.display;
    const cfg = (window as unknown as Record<string, unknown>).BgConfig as Record<string, number> | undefined;
    p.bind();
    gl.uniform1i(p.uniforms.uTexture, fboRef.current!.dye.read.attach(0));
    gl.uniform1f(p.uniforms.uEdgeLow, cfg?.EDGE_LOW ?? 0.08);
    gl.uniform1f(p.uniforms.uEdgeHigh, cfg?.EDGE_HIGH ?? 0.09);
    gl.uniform1f(p.uniforms.uGrayR, cfg?.GRAY_R ?? 210);
    gl.uniform1f(p.uniforms.uGrayG, cfg?.GRAY_G ?? 200);
    gl.uniform1f(p.uniforms.uGrayB, cfg?.GRAY_B ?? 185);
    gl.uniform1f(p.uniforms.uTime, Date.now() / 1000);

    blit(gl, null);
  }, [blit]);

  const doSplat = useCallback((gl: WebGLRenderingContext, x: number, y: number, dx: number, dy: number, color?: { r: number; g: number; b: number }) => {
    const cfg = configRef.current;
    const p = programsRef.current.splat;
    const fbo = fboRef.current!;
    const canvas = canvasRef.current!;
    const ar = canvas.width / canvas.height;
    const radius = (cfg.SPLAT_RADIUS / 100) * (ar > 1 ? ar : 1);
    const c = color ?? { r: 0.82, g: 0.78, b: 0.72 };
    p.bind();

    gl.uniform1i(p.uniforms.uTarget, fbo.velocity.read.attach(0));
    gl.uniform1f(p.uniforms.aspectRatio, ar);
    gl.uniform2f(p.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
    gl.uniform3f(p.uniforms.color, dx, -dy, 0.0);
    gl.uniform1f(p.uniforms.radius, radius);
    blit(gl, fbo.velocity.write); fbo.velocity.swap();

    gl.uniform1i(p.uniforms.uTarget, fbo.dye.read.attach(0));
    gl.uniform3f(p.uniforms.color, c.r, c.g, c.b);
    blit(gl, fbo.dye.write); fbo.dye.swap();
  }, [blit, canvasRef]);

  const splat = useCallback((x: number, y: number, dx: number, dy: number, color?: { r: number; g: number; b: number }) => {
    const gl = glRef.current;
    if (!gl) return;
    gl.disable(gl.BLEND);
    const cfg = configRef.current;
    doSplat(gl, x, y, dx * cfg.SPLAT_FORCE, dy * cfg.SPLAT_FORCE, color);
  }, [doSplat]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const opts: WebGLContextAttributes = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: true };
    const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts) as WebGLRenderingContext | null;
    if (!gl) { console.error('[FluidSim] WebGL not supported'); return; }
    glRef.current = gl;
    gl.clearColor(0, 0, 0, 0);

    const hf = gl.getExtension('OES_texture_half_float');
    const hfl = gl.getExtension('OES_texture_half_float_linear');
    extRef.current = {
      halfFloat: hf ? hf.HALF_FLOAT_OES : gl.UNSIGNED_BYTE,
      linearFiltering: !!hfl,
      internalFormat: gl.RGBA,
      format: gl.RGBA,
    };

    // Apply overrides
    const w = window.innerWidth;
    if (w < 1200) {
      configRef.current = {
        ...configRef.current,
        CURL: w < 600 ? 8 : w < 900 ? 12 : 16,
        SPLAT_RADIUS: w < 600 ? 0.18 : w < 900 ? 0.20 : 0.22,
        SIM_RESOLUTION: w < 600 ? 64 : w < 900 ? 96 : 128,
        PRESSURE_ITERATIONS: w < 600 ? 8 : w < 900 ? 12 : 16,
      };
    }

    initPrograms(gl);
    initFramebuffers(gl);

    // Set bg config
    (window as unknown as Record<string, unknown>).BgConfig = {
      GRAY_R: 30, GRAY_G: 25, GRAY_B: 90,
      EDGE_LOW: 0.01, EDGE_HIGH: 0.09,
    };

    const update = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      resizeCanvas(gl, canvas);
      step(gl, dt);
      render(gl);
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef, initPrograms, initFramebuffers, resizeCanvas, step, render]);

  return { splat };
}
